const { Op } = require('sequelize');

const sequelize = require('../config/SequelizeConfig');
const { User, Chat, ChatParticipant, Message, MessageView } = require('../model');
const { ApiResponse, RuntimeError, ApiMessageResponse, USER_IMAGE_PLACEHOLDER } = require("../utils/Utils");
const { FOUND, NOT_FOUND, CREATED } = require("../utils/Messages");
const { CHAT_TYPE, CHAT_MEMBER_TYPE } = require("../utils/Enum");
const UserService = require('./UserService');
const { changeImageByteToBase64 } = require('../utils/ImageUtils');

const CHAT_LIST_MAX_SIZE = 15;
const EXISTING_DIRECT_CHAT_WITH_MEMBER_SQL = `SELECT c.id
    FROM aspire_chats c
    JOIN aspire_chatparticipants cp ON cp.chat_id = c.id
    WHERE c.type = 'direct' AND cp.user_id IN (:user1, :user2)
    GROUP BY c.id
    HAVING COUNT(DISTINCT cp.user_id) = 2
    LIMIT 1`;

const getAllChatsByUserId = async (userId, filters = {}) => {
    const { type } = filters;

    const where = {};
    if (type === CHAT_TYPE.GROUP || type === CHAT_TYPE.DIRECT) {
        where.type = type;
    }

    const chats = await Chat.findAll({
        attributes: ['id', 'type', 'name', 'lastSent'],
        include: [
            {
                model: ChatParticipant,
                as: 'MyParticipant',
                attributes: ['unreadMessage', 'lastSeen'],
                where: { userId },
                required: true,
            },
            {
                model: ChatParticipant,
                as: 'Participants',
                attributes: ['id', 'userId'],
                include: [
                    {
                        model: User,
                        as: 'User',
                        attributes: ['id', 'name', 'role', 'image'],
                    }
                ]
            }
        ],
        order: [['lastSent', 'DESC']],
        limit: CHAT_LIST_MAX_SIZE,
    });

    //console.log(chats);
    const formattedChats = chats?.map(c => {
        const chat = c.get({ plain: true });

        let name = chat.name;
        let otherUserId = null;
        let image;

        if (chat.type === CHAT_TYPE.DIRECT) {
            const otherUser = chat?.Participants.find(p => p.userId != userId);
            name = otherUser.User.name;
            otherUserId = otherUser.userId;
            image = changeImageByteToBase64(otherUser.User.image);
        }

        return {
            ...chat,
            name,
            otherUserId,
            image,
            unreadMessage: chat.MyParticipant?.unreadMessage,
        };
    });

    return ApiResponse(FOUND, formattedChats);
};

const getChatById = async (id, userId) => {
    const chat = await Chat.findByPk(id, {
        attributes: ['id', 'name', 'type', 'lastSent'],
        include: [
            {
                model: Message,
                as: 'Messages',
                attributes: ['id', 'content', 'contentType', 'senderId', 'createdAt'],
                separate: true,
                order: [['createdAt', 'ASC']],
                include: [
                    {
                        model: User,
                        as: 'Sender',
                        attributes: ['id', 'name'],
                    }
                ]
            },
            {
                model: ChatParticipant,
                as: 'Participants',
                attributes: ['id', 'userId', 'role'],
                include: [
                    {
                        model: User,
                        as: 'User',
                        attributes: ['id', 'name', 'image'],
                    }
                ]
            },
        ],
    });

    validateChatParticipants(chat, userId);

    if (chat.type === CHAT_TYPE.DIRECT) {
        const otherUser = chat.Participants.find(participant => participant.userId != userId);
        chat.name = otherUser.User.name;
        chat.setDataValue('image', changeImageByteToBase64(otherUser.User.image));
    }

    return ApiResponse(FOUND, chat);
};

const sendMessage = async (senderId, reqBody) => {
    //console.log(reqBody)
    const { id, receiverId, content, contentType } = reqBody;
    if (!content) throw new RuntimeError(500, 'Message is required');

    let isNew = false;

    const transaction = await sequelize.transaction();

    try {
        let chat;
        if (id) {
            chat = await Chat.findByPk(id, {
                include: [
                    { model: ChatParticipant, as: 'Participants', attributes: ['userId'] }
                ],
                transaction
            });

            if (!chat) throw new RuntimeError(404, NOT_FOUND);
            validateChatParticipants(chat, senderId)
        } else {
            const [chatResult] = await sequelize.query(EXISTING_DIRECT_CHAT_WITH_MEMBER_SQL, {
                replacements: { user1: senderId, user2: receiverId },
                transaction
            });

            if (chatResult?.id) chat = await Chat.findByPk(chatResult.id, transaction);
            else {
                chat = await createChat(null, CHAT_TYPE.DIRECT, transaction);
                await Promise.all([
                    createParticipant(chat.id, senderId, CHAT_MEMBER_TYPE.MEMBER, transaction),
                    createParticipant(chat.id, receiverId, CHAT_MEMBER_TYPE.MEMBER, transaction),
                ]);

                isNew = true;
            }
        }

        const message = await createMessage(chat.id, content, contentType, senderId, transaction);
        const Sender = await UserService.getNameById(senderId);
        message.Sender = Sender;

        await updateChatLastSent(chat, transaction);
        await updateUnreadMessageOnMessage(chat.id, senderId, transaction);

        await transaction.commit();
        return { message, isNew };
    } catch (error) {
        await transaction.rollback();
        console.error("Error creating chat:", error.message);
        throw error;
    }
}

const seenChatMessage = async (chatId, reqBody, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const { lastSeen } = reqBody;
        const chatParticipant = await getChatParticipant(userId, chatId, transaction);

        await createMessageView(chatParticipant.lastSeen, lastSeen, chatId, userId, transaction);
        await updateUnreadMessageOnView(chatParticipant, lastSeen, transaction);

        await transaction.commit();
        return ApiMessageResponse(CREATED);
    } catch (error) {
        await transaction.rollback();
        console.error("Error marking messages as seen:", error.message);
        throw error;
    }
}

const createGroup = async (reqBody, user) => {
    const transaction = await sequelize.transaction();

    try {
        if (reqBody?.users?.length <= 1) throw new RuntimeError(500, "Cannot make group with 2 person");

        const chatName = user?.name?.split(' ')[0] + ", " + reqBody.users.map(user => user.name?.split(' ')[0]).join(', ');
        const chat = await createChat(chatName, CHAT_TYPE.GROUP, transaction);

        const participantUserIds = (reqBody.users || []).map(user => user.id);
        await Promise.all([
            createParticipant(chat.id, user.id, CHAT_MEMBER_TYPE.ADMIN, transaction),
            createParticipantsBulk(chat.id, participantUserIds, CHAT_MEMBER_TYPE.MEMBER, transaction),
        ]);

        await transaction.commit();
        return chat.id;
    } catch (error) {
        await transaction.rollback();
        console.error("Error creating group chat:", error.message);
        throw error;
    }
}

const addMemberToGroup = async (reqBody, user) => {
    const transaction = await sequelize.transaction();

    try {
        await getAndValidateChatParticipant(reqBody.chatId, user.id, transaction);

        const participantUserIds = (reqBody.users || []).map(user => user.id);
        await createParticipantsBulk(reqBody.chatId, participantUserIds, CHAT_MEMBER_TYPE.MEMBER, transaction);

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error("Error add member to group chat:", error.message);
        throw error;
    }
}

//helpers
const createChat = async (name, type, transaction) => {
    return await Chat.create({ name, type }, { transaction });
}

const createParticipant = async (chatId, userId, role, transaction) => {
    return await ChatParticipant.create({ chatId, userId, role }, { transaction });
}

const createParticipantsBulk = async (chatId, userIds, role, transaction) => {
    const participants = userIds.map(userId => ({
        chatId,
        userId,
        role,
    }));

    return await ChatParticipant.bulkCreate(participants, { transaction });
};

const createMessage = async (chatId, content, contentType, senderId, transaction) => {
    const result = await Message.create({ chatId, content, contentType, senderId }, { transaction });
    return result.get({ plain: true });
}

const updateChatLastSent = async (chat, transaction) => {
    chat.lastSent = new Date();
    await chat.save({ transaction });
}

const updateUnreadMessageOnMessage = async (chatId, senderId, transaction) => {
    await ChatParticipant.increment(
        { unreadMessage: 1 },
        {
            where: {
                chatId,
                userId: { [Op.ne]: senderId }
            },
            transaction
        }
    );
}

const getChatParticipant = async (userId, chatId, transaction) => {
    const chatParticipant = await ChatParticipant.findOne({
        where: {
            chatId,
            userId,
        },
        transaction
    });

    if (!chatParticipant) {
        throw new RuntimeError(404, "chat participant " + NOT_FOUND);
    }

    return chatParticipant;
}

const createMessageView = async (lastSeen, seenTime, chatId, viewerId, transaction) => {
    const timeFilter = {
        [Op.lte]: seenTime,
        ...(lastSeen ? { [Op.gt]: lastSeen } : {})
    };

    const unseenMessages = await Message.findAll({
        attributes: ['id'],
        where: {
            chatId,
            createdAt: timeFilter
        },
        include: [{
            model: MessageView,
            as: 'MessageViews',
            attributes: ['id'],
            where: { viewerId },
            required: false,
        }],
        transaction
    });

    const messagesToView = unseenMessages
        .filter(m => (m.MessageViews || []).length == 0) // not yet viewed
        .map(m => ({
            messageId: m.id,
            viewerId,
            seenTime,
        }));

    if (messagesToView.length > 0) {
        await MessageView.bulkCreate(messagesToView, { transaction });
    }
}

const updateUnreadMessageOnView = async (chatParticipant, lastSeen, transaction) => {
    chatParticipant.unreadMessage = 0;
    chatParticipant.lastSeen = lastSeen;

    await chatParticipant.save({ transaction });
}

const validateChatParticipants = (chat, ...userIds) => {
    const participantIds = chat.Participants.map(participant => participant.userId);

    userIds.forEach((userId) => {
        if (!participantIds.includes(userId)) {
            throw new RuntimeError(403, `User ${userId} is not a participant of this chat id: ${chat.id} name:${chat.name}.`);
        }
    });
}

const getAndValidateChatParticipant = async (chatId, userId, transaction) => {
    const participant = await ChatParticipant.findOne({
        where: {
            chatId,
            userId,
        },
        transaction,
    })

    if (!participant) throw new RuntimeError(403, `User ${userId} is not a participant of this chat.`);

    return participant;
}

module.exports = {
    getAllChatsByUserId,
    getChatById,
    sendMessage,
    seenChatMessage,
    createGroup,
    addMemberToGroup,
}