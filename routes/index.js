var express = require("express");
var router = express.Router();
const { MercadoPagoConfig, Payment } = require("mercadopago");
const pagarStore = require("../models/Payment"); // Importa o modelo
const sequelize = require("../database/pg"); // Importa a conexão com o banco
const { send } = require("process");

const client = new MercadoPagoConfig({
  accessToken: process.env.ACCESS_TOKEN,
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
    transaction_amount: 0.02,
    description: data.description,
    payment_method_id: "pix",
    notification_url: process.env.NOTIFICATION_URL,
    // URL do Webhook
    payer: {
      email: data.payer.email,
      identification: {
        type: "CPF",
        number: data.payer.cpf,
      },
    },
  };
  const comprador = await pagarStore.findOne({
    where: { payer_cpf: data.payer.cpf, status: "approved" },
  });
  console.log(comprador);
  if (comprador !== null) {
    return res.status(400).send({
      error: true,
      message: "Já existe ingresso para o CPF informado.",
    });
  }
  console.log(data.hash);
  try {
    const result = await payment.create({
      body,
      requestOptions: { idempotencyKey: data.hash },
    });

    const paymentData = {
      transaction_id: result.id,
      status: result.status,
      payer_email: body.payer.email,
      payer_cpf: body.payer.identification.number,
      payer_name: `${data.payer.nomeCompleto} ${data.payer.sobrenome}`,
      genero: data.payer.genero,
    };

    await pagarStore.create(paymentData);
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
    const response = await payment.get({ id });

    const compra = {
      id: response.id,
      status: response.status,
    };
    res.status(200).send(compra);
  } catch (error) {
    res.status(500).send({ error: "erro ao consultar" });
  }
});

router.get("/buscar-ingressos", async function (req, res, next) {
  try {
    const result = await pagarStore.count({
      where: {
        status: "approved", // Filtra pelo status "approved"
      },
      group: ["genero"], // Agrupa pelos valores de gênero
      attributes: [
        "genero",
        [sequelize.fn("COUNT", sequelize.col("genero")), "count"],
      ], // Conta o número de ocorrências por gênero
    });
    res.json(result);
  } catch (error) {
    res.status(500).send("Erro ao buscar ingressos");
  }
});


router.get("/buscar-ingressos-aprovados", async function (req, res, next) {
  try {
    const result = await pagarStore.findAll({
      where: {
        status: "approved", // Filtra pelo status "approved"
      },
    });
    console.log(result);
    res.json(result);
  } catch (error) {
    res.status(500).send("Erro ao buscar ingressos");
  }
});

router.post("/atualizar-compra", async function (req, res, next) {
  try {
    const updated = await pagarStore.update(
      { status: "approved" },
      {
        where: { transaction_id: req.body?.id },
      }
    );
    console.log(updated);
    res.status(200).send("compra atualizada");
  } catch (error) {
    res.status(500).send("Erro ao atualizar compra");
  }
});

router.post("/webhook", async function (req, res, next) {
  const data = req.body?.data;
  const action = req.body?.action;
  try {
    if (action === "payment.updated") {
      const response = await payment.get({ id: data?.id });

      if (response.status === "approved") {
        await pagarStore.update(
          { status: response.status },
          {
            where: { transaction_id: response.id },
          }
        );
        return res.status(200).send({ approved: true });
      }
    }
  } catch (error) {
    return res.status(500).send({ message: error });
  }
});

module.exports = router;
