const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "love_board", // Nome do banco de dados (DB_DATABASE)
  "meu_usuario", // Nome de usuário (DB_USERNAME)
  "1234", // Senha (DB_PASSWORD)
  {
    host: "localhost", // Host do banco (DB_HOST)
    port: 5432, // Porta do banco (DB_PORT)
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
