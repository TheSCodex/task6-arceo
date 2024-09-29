const { Model, DataTypes } = require("sequelize");
const connection = require("../db.js");

class Slide extends Model {}

Slide.init(
  {
    content: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    presentationId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Presentations",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize: connection,
    modelName: "Slide",
  }
);

// Associations
Slide.associate = (models) => {
  Slide.belongsTo(models.Presentation, { foreignKey: "presentationId" });
};

module.exports = Slide;
