const UserPresentation = require("../models/UserPresentation.js");
const User = require("../models/User.js");

exports.createAndLogUser = async (req, res) => {
  const { nickname } = req.body;
  try {
    const exists = await User.findOne({ where: { nickname: nickname } });
    if (exists) {
      return res.status(200).json({ message: "Welcome Back!", user: exists });
    } else {
      const newUser = await User.create({ nickname });
      return res.status(201).json({ user: newUser, message: "Welcome Home!" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error creating user", error });
  }
};

exports.getUsersInPresentation = async (req, res) => {
  try {
    const userPresentations = await UserPresentation.findAll({
      where: { presentationId: req.params.presentationId },
      include: [{ model: User }],
    });

    const users = userPresentations.map((up) => ({
      id: up.userId,
      nickname: up.User.nickname,
      role: up.role,
    }));

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users", error });
  }
};

exports.updateUserRole = async (req, res) => {
  const { userId, presentationId, newRole } = req.body;

  try {
    const userPresentation = await UserPresentation.findOne({
      where: { userId, presentationId },
    });

    if (!userPresentation) {
      return res
        .status(404)
        .json({ message: "User not found in this presentation." });
    }

    userPresentation.role = newRole;
    await userPresentation.save();

    return res.json({ message: "User role updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error updating user role", error });
  }
};
