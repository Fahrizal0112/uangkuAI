const prisma = require("../utils/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserController {
  async register(req, res) {
    try {
      const { username, password, monthly_income } = req.body;

      const existingUser = await prisma.users.findFirst({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "Username already exists"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.users.create({
        data: {
          username,
          password: hashedPassword,
          monthly_income: monthly_income || null
        }
      });

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        status: "success",
        data: {
          id: user.id,
          username: user.username,
          monthly_income: user.monthly_income,
          token
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
          message: "Username or password is incorrect"
        });
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 
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

  async getProfile(req, res) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          username: true,
          monthly_income: true,
          createdAt: true
        }
      });

      res.status(200).json({
        status: "success",
        data: user
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { monthly_income } = req.body;

      const user = await prisma.users.update({
        where: { id: req.user.id },
        data: { monthly_income },
        select: {
          id: true,
          username: true,
          monthly_income: true,
          updatedAt: true
        }
      });

      res.status(200).json({
        status: "success",
        data: user
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      const user = await prisma.users.findUnique({
        where: { id: req.user.id }
      });

      if (!(await bcrypt.compare(oldPassword, user.password))) {
        return res.status(400).json({
          status: "error",
          message: "Password lama tidak sesuai"
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.users.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
      });

      res.status(200).json({
        status: "success",
        message: "Password berhasil diubah"
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }

  async logout(req, res) {
    res.clearCookie("token");
    res.status(200).json({
      status: "success",
      message: "Logout successful"
    });
  }

  async updateMonthlyIncome(req, res) {
    const { monthly_income } = req.body;
    const user = await prisma.users.update({
      where: { id: req.user.id },
      data: { monthly_income }
    });

    res.status(200).json({
      status: "success",
      data: user
    });
  }
}

module.exports = new UserController();
