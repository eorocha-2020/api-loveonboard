var express = require("express");
var router = express.Router();
const { MercadoPagoConfig, Payment } = require("mercadopago");
const pagarStore = require("../models/Payment"); // Importa o modelo
const sequelize = require("../database/pg"); // Importa a conexão com o banco
const crypto = require("crypto");


// Função para gerar uma idempotencyKey única
const generateIdempotencyKey = () => {
  return crypto.randomBytes(16).toString("hex"); // Gera uma chave única de 32 caracteres hexadecimais
};

// Exemplo de uso
const idempotencyKey = generateIdempotencyKey();

const requestOptions = {
  idempotencyKey: idempotencyKey, // Usando a chave gerada
};

const client = new MercadoPagoConfig({
  accessToken:process.env.ACCESS_TOKEN,
  options: { timeout: 5000, idempotencyKey: idempotencyKey },
});

// Step 3: Initialize the API object
const payment = new Payment(client);
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/criar-pix", async function (req, res, next) {
  const data = req.body;
  const body = {
    transaction_amount: 0.12,
    description: data.description,
    payment_method_id: "pix",
    notification_url:process.env.NOTIFICATION_URL,
    // URL do Webhook
    payer: {
      email: data.payer.email,
      identification: {
        type: "CPF",
        number: data.payer.cpf,
      },
    },
  };

  try {
    const result = await payment.create({ body, requestOptions });

    const paymentData = {
      transaction_id: result.id,
      status: result.status,
      payer_email: body.payer.email,
      payer_cpf: body.payer.identification.number,
    };

    const savedPayment = await pagarStore.create(paymentData);
    // console.log("Pagamento salvo no PostgreSQL:", savedPayment);

    res.status(200).send(result);
  } catch (error) {
    console.error("Erro ao criar ou salvar pagamento:", error);
    res.status(500).send({ error: "Erro ao criar o pagamento." });
  }
});

router.get("/buscar-compra/:id", async function (req, res, next) {
  const { id } = req.params;
  console.log(id);
  try {
    const response = await pagarStore.findOne({
      where: { transaction_id: id },
    });

    const compra = {
      id: response.id,
      status: response.status,
    };
    res.status(200).send(compra);
  } catch (error) {
    res.status(500).send({ error: "erro ao consultar" });
  }
});

router.post("/webhook", async function (req, res, next) {
  const data = req.body?.data;
  const action = req.body?.action;
  console.log(data?.id, action);
  try {
    if (action === "payment.updated") {
      const response = await payment.get({ id: data?.id });
      console.log(response.status);

      if (response.status === "approved") {
        await pagarStore.update(
          { status: response.status },
          {
            where: { transaction_id: response.id },
          }
        );
        return res.status(200).send({approved: true})
      }
    }
  } catch (error) {
    return res.status(500).send({ message: error });
  }
});

module.exports = router;
