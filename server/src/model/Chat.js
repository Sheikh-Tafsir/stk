const { IS_REQUIRED, lengthValidationMessage } = require('../utils/Messages');
const { CHAT_TYPE } = require('../utils/Enum');

module.exports = (sequelize, DataTypes) => {
    const Chat = sequelize.define('Chat', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        type: {
            type: DataTypes.ENUM(...Object.values(CHAT_TYPE)),
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
            }
        },

        name: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: {
                    args: [1, 100],
                    msg: lengthValidationMessage(1, 100)
                },
            }
        },

        lastSent: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: true,
            field: 'last_sent'
        },

        version: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
        {
            tableName: 'aspire_chats',
            underscored: true,
            timestamps: true,
            version: true,
        }
    );

    Chat.associate = models => {
        Chat.hasMany(models.ChatParticipant, { foreignKey: 'chatId', as: 'Participants' });
        Chat.hasOne(models.ChatParticipant, { foreignKey: 'chatId', as: 'MyParticipant' });
        Chat.hasMany(models.Message, { foreignKey: 'chatId', as: 'Messages' });
    };

    return Chat;
};