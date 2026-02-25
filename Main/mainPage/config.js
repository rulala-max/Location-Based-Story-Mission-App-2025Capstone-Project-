const local = {
  host: "localhost",
  user: "root",
  password: "",
  database: "capstone"
};

const production = {
  host: process.env.DB_HOST || local.host,
  user: process.env.DB_USER || local.user,
  password: process.env.DB_PASS || local.password,
  database: process.env.DB_NAME || local.database
};

module.exports = { local, production };
