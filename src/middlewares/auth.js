const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const auth = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7);
        } else {
            const cookies = req.headers.cookie;
            if (!cookies) {
                return res.status(401).json({
                    status: "error",
                    message: "Please login first"
                });
            }
            
            const tokenCookie = cookies.split(';')
                .find(c => c.trim().startsWith('token='));
            if (!tokenCookie) {
                return res.status(401).json({
                    status: "error",
                    message: "Token not found"
                });
            }
            token = tokenCookie.split('=')[1];
        }

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