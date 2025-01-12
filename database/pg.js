const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE_NAME, // Nome do banco de dados (DB_DATABASE)
  process.env.DATABASE_USERNAME, // Nome de usuário (DB_USERNAME).
  process.env.DATABASE_PASSWORD, // Senha (DB_PASSWORD)
  {
    host: process.env.DATABASE_HOST, // Host do banco (DB_HOST)
    port: process.env.DATABASE_PORT, // Porta do banco (DB_PORT)
    dialect: "postgres", // Tipo de banco de dados (DB_CONNECTION)
    logging: false, // Desativa logs de SQL (opcional)
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexão com PostgreSQL estabelecida com sucesso.");
  } catch (error) {
    console.error("Erro ao conectar ao PostgreSQL:", error);
  }
})();

module.exports = sequelize;
