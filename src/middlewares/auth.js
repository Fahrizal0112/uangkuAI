const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized"
            });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await prisma.users.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized"
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Unauthorized"
        });
    }
};

module.exports = auth;