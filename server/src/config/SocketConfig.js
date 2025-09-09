const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

const ChatService = require('../service/ChatService');
const { ApiResponse, ApiMessageResponse } = require('../utils/Utils');
const { RECIEVED, SENT, CREATED, UPDATED } = require('../utils/Messages');
const { corsOptions } = require('../middleware/CorsMiddleware');

require('dotenv').config()

const MESSAGE_SEND = 'send-message';
const MESSAGE_RECEIVE = 'receive-message';
const GROUP_CREATE_REQUEST = 'group-create-request';
const GROUP_CREATE_RESPONSE = 'group-create-response';
const GROUP_UPDATE_REQUEST = 'group-update-request';
const GROUP_UPDATE_RESPONSE = 'group-update-response';

const MAX_SOCKETS_PER_USER = 2;
const userSocketMap = {};

const SocketConfig = (server) => {
    const io = socketIO(server, { cors: corsOptions });

    io.use((socket, next) => {
        const token = socket.handshake?.auth?.token;
        if (!token) return next(new Error('Authentication error'));

        try {
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
            socket.user = user; // attach user to socket object
            next();
        } catch (err) {
            return next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        const user = socket.user;

        await handleUserSockets(user, socket);
        await handleUserJoinRooms(user, socket);

        socket.on(MESSAGE_SEND, async (data, acknowledgment) => {
            try {
                const { message, isNew } = await ChatService.sendMessage(user.id, data);
                acknowledgment(ApiResponse(SENT, message));

                if (isNew) {
                    userJoinRooms(user.name, message.chatId, socket);
                    const receiverSockets = userSocketMap[data.receiverId] || [];
                    receiverSockets.forEach(s => {
                        userJoinRooms(data.receiverId, message.chatId, s);
                    })
                }

                io.to(getRoomName(message.chatId)).emit(MESSAGE_RECEIVE, ApiResponse(RECIEVED, { ...message, tempId: data?.tempId }));
                console.info(`Message sent to room chat_${message.chatId}`);
            } catch (err) {
                console.error('Message send failed:', err.message);
                acknowledgment(ApiMessageResponse(err.message));
            }
        });

        socket.on(GROUP_CREATE_REQUEST, async (data, acknowledgment) => {
            try {
                const chatId = await ChatService.createGroup(data, user);
                acknowledgment(ApiResponse(CREATED, chatId));

                userJoinRooms(user.name, chatId, socket);
                if (Array.isArray(data.users)) {
                    data.users.forEach((participant) => {
                        const receiverSockets = userSocketMap[participant.id] || [];
                        receiverSockets.forEach(sock => {
                            userJoinRooms(participant.id, chatId, sock);
                        })
                    });
                }

                io.to(getRoomName(chatId)).emit(GROUP_CREATE_RESPONSE, ApiMessageResponse(CREATED));
                console.info(`Group created and sent to room chat_${chatId}`);
            } catch (err) {
                console.error('Group creation failed:', err.message);
                acknowledgment(ApiMessageResponse(err.message));
            }
        });

        socket.on(GROUP_UPDATE_REQUEST, async (data, acknowledgment) => {
            try {
                const chatId = data.chatId;
                await ChatService.addMemberToGroup(data, user);
                acknowledgment(ApiResponse(UPDATED, chatId));

                if (Array.isArray(data.users)) {
                    data.users.forEach((participant) => {
                        const receiverSockets = userSocketMap[participant.id] || [];
                        receiverSockets.forEach(receiverSocket => {
                            userJoinRooms(participant.id, chatId, receiverSocket);
                        })
                    });
                }

                console.info(`Added new members in group and sent to room chat_${chatId}`);
                io.to(getRoomName(chatId)).emit(GROUP_UPDATE_RESPONSE, ApiMessageResponse(UPDATED));
            } catch (err) {
                console.error('Group creation failed:', err.message);
                acknowledgment(ApiMessageResponse(err.message));
            }
        });

        socket.on('disconnect', () => {
            console.info(`User ${user.name} from socket ${socket.id} disconnected.`);

            userSocketMap[user.id] = userSocketMap[user.id].filter(s => s.id != socket.id);
            if (userSocketMap[user.id].length == 0) {
                delete userSocketMap[user.id];
            }
        });
    });
};

const getRoomName = (chatId) => `chat_${chatId}`;

const handleUserSockets = async (user, socket) => {
    console.info(`User ${user.name} connected with socket: ${socket.id}`)
    // console.info("");
    userSocketMap[user.id] = userSocketMap[user.id] || [];

    if (userSocketMap[user.id].length >= MAX_SOCKETS_PER_USER) {
        const oldSocket = userSocketMap[user.id].shift();
        if (oldSocket && oldSocket.disconnect) {
            console.info(`Disconnecting oldest socket (${oldSocket.id}) for user ${user.name}`);
            oldSocket.disconnect();
        }
    }

    userSocketMap[user.id].push(socket);
}

const handleUserJoinRooms = async (user, socket) => {
    try {
        const response = await ChatService.getAllChatsByUserId(user.id);
        const chats = response.data;

        chats.forEach(chat => {
            userJoinRooms(user.id, chat.id, socket)
        });
    } catch (err) {
        console.error('Error joining user rooms:', err.message);
    }
}

const userJoinRooms = (userId, chatId, socket) => {
    socket.join(getRoomName(chatId));
    console.info(`User with ${userId} joined room: ${getRoomName(chatId)}`);
}

module.exports = SocketConfig;