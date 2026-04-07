import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product';
import DatabaseConnection from '../config/database';

dotenv.config();

const updateImages = async () => {
  try {
    const dbConnection = new DatabaseConnection();
    await dbConnection.connect();

    const products = await Product.find();
    
    if (products.length >= 3) {
      products[0].image = '/images/car1.jpg';
      products[1].image = '/images/car2.jpg';
      products[2].image = '/images/car3.jpg';

      await products[0].save();
      await products[1].save();
      await products[2].save();
      
      console.log('Successfully updated product images in the database!');
    } else {
       console.log('Not enough products found to update.');
    }

    await dbConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error updating images:', error);
    process.exit(1);
  }
};

updateImages();
