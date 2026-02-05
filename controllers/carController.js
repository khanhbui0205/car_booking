const Car = require("../models/Car");

exports.getCars = async (req, res) => {
  res.json(await Car.find());
};

exports.createCar = async (req, res) => {
  res.status(201).json(await Car.create(req.body));
};
