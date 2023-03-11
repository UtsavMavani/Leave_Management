const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/config.json")[process.env.NODE_ENV];

let sequelize = null;
if (sequelize === null) {
  sequelize = new Sequelize(config.database, config.username, config.password, {
  ...config,
  logging: process.env.NODE_ENV === "test" ? false : console.log,
  });
}

sequelize.authenticate()
.then(() => {
  console.log("Database connected");
})
.catch((err) => {
  console.log("Database not conected", err);
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("../models/user")(sequelize, DataTypes);
db.roles = require("../models/role")(sequelize, DataTypes);
db.leaveRequests = require("../models/leaveRequest")(sequelize, DataTypes);

db.roles.hasMany(db.users, { foreignKey: "role" });

module.exports = db;