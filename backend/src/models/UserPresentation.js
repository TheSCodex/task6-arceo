const { Model, DataTypes } = require("sequelize");
const connection = require("../db.js");

class UserPresentation extends Model {}

UserPresentation.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    presentationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Presentations",
        key: "id",
      },
    },
    role: {
      type: DataTypes.ENUM("creator", "editor", "viewer"),
      allowNull: false,
      defaultValue: "viewer",
    },
  },
  {
    sequelize: connection,
    modelName: "UserPresentation",
  }
);

// Associations
UserPresentation.associate = (models) => {
  UserPresentation.belongsTo(models.User, {
    foreignKey: "userId",
    as: "User",
  });
  UserPresentation.belongsTo(models.Presentation, {
    foreignKey: "presentationId",
  });
};

module.exports = UserPresentation;
