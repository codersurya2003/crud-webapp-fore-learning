const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch((err) => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

const sampleProducts = [
    {
        name: 'Sample Product 1',
        price: 100,
        description: 'This is a sample product description.',
        category: 'Electronics',
    },
    {
        name: 'Sample Product 2',
        price: 200,
        description: 'Another sample product description.',
        category: 'Books',
    },
    {
        name: 'Sample Product 3',
        price: 300,
        description: 'Yet another sample product.',
        category: 'Clothing',
    },
];

const importData = async () => {
    try {
        await Product.deleteMany(); // Clear existing data
        console.log('Data Cleared...');

        await Product.insertMany(sampleProducts);
        console.log('Data Imported!');

        process.exit();
    } catch (err) {
        console.error('Error with data import:', err);
        process.exit(1);
    }
};

importData();
