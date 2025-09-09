const { IS_REQUIRED, lengthValidationMessage } = require('../utils/Messages');
const { CONTENT_TYPE } = require('../utils/Enum');

module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
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

        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                len: {
                    args: [1, 500],
                    msg: lengthValidationMessage(1, 500)
                },
            }
        },

        contentType: {
            type: DataTypes.ENUM(...Object.values(CONTENT_TYPE)),
            allowNull: false,
            defaultValue: CONTENT_TYPE.TEXT,
            field: 'content_type',
            validate: {
                notNull: { msg: IS_REQUIRED },
                len: {
                    args: [1, 30],
                    msg: lengthValidationMessage(1, 30)
                },
            }
        },

        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'sender_id',
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: true,
            },
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },

        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            onUpdate: DataTypes.NOW,
            field: 'updated_at'
        }
    },
        {
            tableName: 'aspire_messages',
            timestamps: true,
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        }
    );

    // Define associations
    Message.associate = models => {
        Message.belongsTo(models.Chat, { foreignKey: 'chatId', as: 'Chat' });
        Message.belongsTo(models.User, { foreignKey: 'senderId', as: 'Sender' });
        Message.hasMany(models.MessageView, { foreignKey: 'messageId', as: 'MessageViews' });
    };

    return Message;
};