const prisma = require("../utils/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserController {
  async register(req, res) {
    try {
      const { username, password } = req.body;

      const existingUser = await prisma.users.findFirst({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "Username sudah digunakan"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.users.create({
        data: { 
          username, 
          password: hashedPassword 
        }
      });

      res.status(201).json({
        status: "success",
        data: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      const user = await prisma.users.findFirst({
        where: { username }
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized"
        });
      }

      const token = jwt.sign(
        { id: user.id }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(200).json({
        status: "success",
        data: { token }
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }

  async updateMonthlyIncome(req, res) {
    try {
      const { monthly_income } = req.body;

      const user = await prisma.users.update({
        where: { id: req.user.id },
        data: { monthly_income }
      });

      res.status(200).json({
        status: "success",
        data: {
          id: user.id,
          username: user.username,
          monthly_income: user.monthly_income
        }
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }
}

module.exports = new UserController();
