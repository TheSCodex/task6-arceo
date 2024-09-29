const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();
const connection = new Sequelize({
  dialect: "mysql",
  host: process.env.SQLHOST,
  username: process.env.SQLUSER,
  password: process.env.SQLPASSWORD,
  port: process.env.SQLPORT,
  database: process.env.SQLDATABASE,
});

module.exports = connection;