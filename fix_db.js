const mongoose = require('mongoose');
require('dotenv').config();
const Car = require('./models/Car');

async function fixCars() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await Car.updateMany(
    { approvalStatus: "APPROVEDD" },
    { approvalStatus: "APPROVED" }
  );
  console.log(`Updated ${result.modifiedCount} cars from APPROVEDD to APPROVED`);
  
  // also ensure all cars have APPROVED if they were somehow else
  const result2 = await Car.updateMany(
    { approvalStatus: { $exists: false } },
    { approvalStatus: "APPROVED" }
  );
  console.log(`Initialized ${result2.modifiedCount} cars with APPROVED status`);
  
  await mongoose.disconnect();
}

fixCars();
