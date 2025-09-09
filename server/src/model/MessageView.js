const { IS_REQUIRED } = require('../utils/Messages');

module.exports = (sequelize, DataTypes) => {
    const MessageView = sequelize.define('MessageView',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            messageId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'message_id',
                validate: {
                    notNull: { msg: IS_REQUIRED },
                    isInt: true,
                },
            },

            viewerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'viewer_id',
                validate: {
                    notNull: { msg: IS_REQUIRED },
                    isInt: true,
                },
            },

            seenTime: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'seen_time'
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
            tableName: 'aspire_messageviews',
            timestamps: true,
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        }
    );

    MessageView.associate = models => {
        MessageView.belongsTo(models.Message, { foreignKey: 'messageId', as: 'Message' });
    };

    return MessageView;
};