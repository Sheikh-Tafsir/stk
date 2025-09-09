const { IS_REQUIRED } = require('../utils/Messages');
const { CHAT_MEMBER_TYPE } = require('../utils/Enum');

module.exports = (sequelize, DataTypes) => {
    const ChatParticipant = sequelize.define('ChatParticipant', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        chatId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'chat_id',
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: true,
            },
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: true,
            },
        },

        role: {
            type: DataTypes.ENUM(...Object.values(CHAT_MEMBER_TYPE)),
            allowNull: false,
            defaultValue: CHAT_MEMBER_TYPE.MEMBER,
            validate: {
                notNull: { msg: IS_REQUIRED },
            }
        },

        unreadMessage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'unread_message',
            defaultValue: 0,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: true,
            },
        },

        lastSeen: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: true,
            field: 'last_seen'
        },

        version: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
        {
            tableName: 'aspire_chatparticipants',
            underscored: true,
            timestamps: true,
            version: true,
            indexes: [
                {
                    unique: true,
                    fields: ['chatId', 'userId'],
                    msg: "This user already belongs to chat"
                }
            ]
        }
    );

    // Define associations
    ChatParticipant.associate = models => {
        ChatParticipant.belongsTo(models.Chat, { foreignKey: 'chatId', as: 'Chat' });
        ChatParticipant.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
    };

    return ChatParticipant;
};