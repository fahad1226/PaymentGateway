const express = require("express");
const cors = require("cors");
const uuid = require("uuid").v4;

const stripe = require("stripe")("sk_test_ZWbzByKKW6KvseQpEjnKtP6400tykmQzAI");
const app = express();

// midleware

app.use(express.json());
app.use(cors());

// routes

app.get("/", (req, res) => {
    res.json("Hello World!");
});

app.post("/make_payment", (req, res) => {
    const { product, token } = req.body;

    console.log(`Product: ${product}`);
    console.log(`Price: ${product.price}`);

    const idempotencyKey = uuid();

    return stripe.customers
        .create({
            email: token.email,
            source: token.id,
        })
        .then((customer) => {
            stripe.charges.create(
                {
                    amount: product.price * 100,
                    currency: "USD",
                    customer: customer.id,
                    receipt_email: token.email,
                    description: product.name,
                    shipping: {
                        name: token.card.name,
                        address: {
                            country: token.card.address_country,
                        },
                    },
                },
                { idempotencyKey }
            );
        })
        .then((result) => res.status(200).json(result))
        .catch((err) => console.log(err));
});

// listen
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`listening on the port ${PORT}`));
