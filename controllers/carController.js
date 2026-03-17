const Car = require("../models/Car");
const mongoose = require("mongoose");
const { ROLE_ADMIN } = require("../utils/roles");

const ALLOWED_FIELDS = ["brand", "model", "pricePerDay", "description", "imageUrl", "status", "ownerId", "approvalStatus"];

const pickFields = (source, fields) => {
  const data = {};
  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      data[field] = source[field];
    }
  });
  return data;
};

exports.getCars = async (req, res) => {
  const cars = await Car.find({ approvalStatus: "APPROVED" }).sort({ createdAt: -1 });
  res.json(cars);
};

exports.createCar = async (req, res) => {
  try {
    if (req.user.role !== ROLE_ADMIN) {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    const payload = pickFields(req.body, ALLOWED_FIELDS);
    payload.approvalStatus = payload.approvalStatus || "APPROVED";
    payload.ownerId = payload.ownerId || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(String(payload.ownerId))) {
      return res.status(400).json({ message: "Invalid ownerId" });
    }

    const car = await Car.create(payload);
    return res.status(201).json(car);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getMyCars = async (req, res) => {
  // If no owner role, "My Cars" might not make sense for customers, 
  // but admins can see all.
  const filter = req.user.role === ROLE_ADMIN ? {} : { ownerId: req.user.id };
  const cars = await Car.find(filter).sort({ createdAt: -1 });
  res.json(cars);
};

exports.getSystemCars = async (req, res) => {
  const cars = await Car.find()
    .populate("ownerId", "name email role")
    .sort({ createdAt: -1 });

  res.json(cars);
};

exports.updateCar = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid car id" });
  }

  if (req.user.role !== ROLE_ADMIN) {
    return res.status(403).json({ message: "Forbidden: Admin only" });
  }

  const car = await Car.findById(id);
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  const updates = pickFields(req.body, ALLOWED_FIELDS);
  Object.assign(car, updates);
  await car.save();

  return res.json(car);
};

exports.deleteCar = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid car id" });
  }

  if (req.user.role !== ROLE_ADMIN) {
    return res.status(403).json({ message: "Forbidden: Admin only" });
  }

  const car = await Car.findById(id);
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  await car.deleteOne();
  return res.json({ message: "Car deleted" });
};

exports.approveCar = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (req.user.role !== ROLE_ADMIN) {
    return res.status(403).json({ message: "Forbidden: Admin only" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid car id" });
  }

  const decision = String(status || "").toUpperCase();
  if (!["APPROVED", "REJECTED"].includes(decision)) {
    return res.status(400).json({ message: "status must be APPROVED or REJECTED" });
  }

  const car = await Car.findById(id);
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  car.approvalStatus = decision;
  await car.save();

  return res.json({ message: `Car ${decision.toLowerCase()}`, car });
};
