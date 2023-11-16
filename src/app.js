const express = require("express");
const ProductManager = require("./ProductManager.js");
const fs = require('fs').promises;

const app = express();
const port = 8080;

const productManager = new ProductManager("products.json");

app.get("/products", async (req, res) => {
    try {
        const limit = req.query.limit;

        let products = await productManager.getProducts();

        if (limit) {
            products = products.slice(0, limit);
        }

        res.send({ products });
    } catch (error) {
        console.error('Error getting products:', error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.get("/products/:pid", async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        res.send(product);
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
