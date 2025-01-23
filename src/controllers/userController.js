const prisma = require("../utils/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserController {
  async register(req, res) {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: { username, password: hashedPassword },
    });
    res.status(201).json({
        status: "success",
        data: {
            id : user.id,
            username : user.username
        }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
  async login(req, res) {
    const { username, password } = req.body;
    const user = await prisma.users.findFirst({
        where: { username }
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid username or password'
        })
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(200).json({
        status: 'success',
        data: { token }
    });
  }
}

module.exports = new UserController();