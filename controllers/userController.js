const User = require("../models/User");

exports.register = async (req, res) => {
  res.status(201).json(await User.create(req.body));
};

exports.login = async (req, res) => {
  const user = await User.findOne(req.body);
  if (!user) return res.status(401).json({ message: "Invalid login" });
  res.json({ token: user._id });
};
