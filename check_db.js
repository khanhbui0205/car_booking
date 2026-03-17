const mongoose = require('mongoose');
require('dotenv').config();
const Car = require('./models/Car');

async function checkCars() {
  await mongoose.connect(process.env.MONGO_URI);
  const cars = await Car.find({});
  console.log(`Total cars: ${cars.length}`);
  cars.forEach(c => {
    console.log(`- ${c.brand} ${c.model}: Status=${c.status}, Approval=${c.approvalStatus}`);
  });
  await mongoose.disconnect();
}

checkCars();
