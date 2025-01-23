const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const auth = async (req, res, next) => {
    try {
        let token = req.headers.cookie;
        
        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Please login first"
            });
        }

        // Ekstrak token dari string cookie
        token = token.split('=')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await prisma.users.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res.status(401).json({
                status: "error", 
                message: "User not found"
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Invalid token"
        });
    }
};

module.exports = auth;