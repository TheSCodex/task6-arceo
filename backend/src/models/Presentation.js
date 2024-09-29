const { Model, DataTypes } = require("sequelize");
const connection = require("../db.js");

class Presentation extends Model {}

Presentation.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: connection,
    modelName: "Presentation",
  }
);

// Associations
Presentation.associate = (models) => {
  Presentation.hasMany(models.UserPresentation, {
    foreignKey: "presentationId",
  });
};

module.exports = Presentation;
