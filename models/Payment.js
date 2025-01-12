const { DataTypes } = require("sequelize");
const sequelize = require("../database/pg");

const Payment = sequelize.define("Payment", {
  transaction_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payer_email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payer_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payer_cpf: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  genero: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

(async () => {
  await Payment.sync({ alter: true }); // Cria a tabela se não existir
})();

module.exports = Payment;
