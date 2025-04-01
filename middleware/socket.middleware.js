import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import userServices from '../database/services/user.services.js';

const socketMiddleware = {
    verifySocketAuth: async (socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    
            const token = cookies?.token || socket.handshake.auth?.token;
            
            if (!token) {
                return next(new Error("Please provide a token"));
            }

            const validToken = token.replace(/"/g, "").trim();
    
            const decoded = jwt.verify(validToken, process.env.JWT_SECRET);
            const user = await userServices.getByEmail(decoded.email);

            if (!user) {
                return next(new Error("Invalid token"));
            }
    
            socket.user = user;
            next()
        } catch (error) {
            console.log(`Socket auth error: ${error.message}`);
            return next(new Error("Unknown error"));
        }
    }
}

export default socketMiddleware;