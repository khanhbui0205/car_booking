const Car = require("../models/Car");
const mongoose = require("mongoose");
const { ROLE_ADMIN, ROLE_OWNER } = require("../utils/roles");

const OWNER_ALLOWED_FIELDS = ["brand", "model", "pricePerDay", "description", "imageUrl", "status"];
const ADMIN_ALLOWED_FIELDS = [...OWNER_ALLOWED_FIELDS, "ownerId", "approvalStatus"];

const pickFields = (source, fields) => {
  const data = {};
  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      data[field] = source[field];
    }
  });
  return data;
};

const isOwnerOfCar = (car, userId) => String(car.ownerId) === String(userId);

exports.getCars = async (req, res) => {
  const cars = await Car.find({ approvalStatus: "APPROVED" }).sort({ createdAt: -1 });
  res.json(cars);
};

exports.createCar = async (req, res) => {
  try {
    const payload =
      req.user.role === ROLE_ADMIN
        ? pickFields(req.body, ADMIN_ALLOWED_FIELDS)
        : pickFields(req.body, OWNER_ALLOWED_FIELDS);

    if (req.user.role === ROLE_OWNER) {
      payload.ownerId = req.user.id;
      payload.approvalStatus = "PENDING";
    }

    if (req.user.role === ROLE_ADMIN) {
      payload.approvalStatus = payload.approvalStatus || "APPROVED";
      payload.ownerId = payload.ownerId || req.user.id;
    }

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

  const car = await Car.findById(id);
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  if (req.user.role === ROLE_OWNER && !isOwnerOfCar(car, req.user.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const allowedFields = req.user.role === ROLE_ADMIN ? ADMIN_ALLOWED_FIELDS : OWNER_ALLOWED_FIELDS;
  const updates = pickFields(req.body, allowedFields);

  if (req.user.role === ROLE_OWNER) {
    updates.ownerId = req.user.id;
    updates.approvalStatus = "PENDING";
  }

  Object.assign(car, updates);
  await car.save();

  return res.json(car);
};

exports.deleteCar = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid car id" });
  }

  const car = await Car.findById(id);
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  if (req.user.role === ROLE_OWNER && !isOwnerOfCar(car, req.user.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await car.deleteOne();
  return res.json({ message: "Car deleted" });
};

exports.approveCar = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

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
