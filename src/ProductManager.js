const fs = require('fs').promises;

class Product {
    constructor(id, title, description, price, thumbnail, code, stock) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
    }
}

class ProductManager {
    constructor(filePath) {
        this.path = filePath;
        this.products = [];
        this.loadProducts();
    }

    async loadProducts() {
        try {
            const fileExists = await fs.access(this.path);
            if (fileExists) {
                const data = await fs.readFile(this.path, 'utf8');
                this.products = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading products:', error.message);
            this.products = [];
        }
    }

    async saveProducts() {
        const data = JSON.stringify(this.products, null, 2);
        await fs.writeFile(this.path, data);
    }

    addProduct(productData) {
        const { title, description, price, thumbnail, code, stock } = productData;

        if (!title || !description || !price || !thumbnail || !code || stock === undefined || isNaN(price) || price <= 0) {
            throw new Error("Invalid product data. Please provide valid information.");
        }

        if (this.isProductCodeDuplicate(code)) {
            throw new Error('Product code already exists');
        }

        const id = this.generateUniqueID();
        const newProduct = new Product(id, title, description, price, thumbnail, code, stock);
        this.products.push(newProduct);
        this.saveProducts();
        return newProduct;
    }

    isProductCodeDuplicate(code) {
        return this.products.some(product => product.code === code);
    }

    generateUniqueID() {
        const maxId = this.products.reduce((max, product) => (product.id > max ? product.id : max), 0);
        return maxId + 1;
    }

    getProducts() {
        return this.products;
    }

    getProductById(productId) {
        const product = this.products.find(product => product.id === productId);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    updateProduct(id, newProduct) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            const existingProduct = this.products[productIndex];
            
            if (newProduct.code && newProduct.code !== existingProduct.code && this.isProductCodeDuplicate(newProduct.code)) {
                throw new Error('Product code already exists');
            }

            Object.assign(existingProduct, newProduct);
            this.products[productIndex] = existingProduct;
            this.saveProducts();
            return existingProduct;
        } else {
            throw new Error('Product not found');
        }
    }

    async deleteProduct(productId) {
        const index = this.products.findIndex(product => product.id === productId);
        if (index !== -1) {
            this.products.splice(index, 1);
            await this.saveProducts();
        } else {
            throw new Error('Product not found');
        }
    }
}

// Ejemplo de uso
(async () => {
    const productManager = new ProductManager('products.json');

    try {
        await productManager.addProduct({
            title: "producto prueba",
            description: "Este es un producto de prueba",
            price: 200,
            thumbnail: "Sin imagen",
            code: "abc123",
            stock: 25
        });

        console.log("Lista de productos actualizada:");
        console.log(productManager.getProducts());
    } catch (error) {
        console.error(error.message);
    }
})();
