const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, // Exige SSL para conexões seguras
      rejectUnauthorized: false, // Permite certificados autoassinados
    },
  },
  logging: false, // Desativa logs de SQL (opcional)
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexão com PostgreSQL estabelecida com sucesso.");
  } catch (error) {
    console.error("❌ Erro ao conectar ao PostgreSQL:", error);
  }
})();

module.exports = sequelize;