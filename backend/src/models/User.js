const { Model, DataTypes } = require("sequelize");
const connection = require("../db.js");

class User extends Model {}

User.init(
  {
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize: connection,
    modelName: "User",
  }
);

// Associations
User.associate = (models) => {
  User.hasMany(models.UserPresentation, {
    foreignKey: 'userId',
    as: 'userPresentations',
  });
};

module.exports = User;
