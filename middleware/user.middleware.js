import jwt from 'jsonwebtoken'

const userMiddelware = {
    
    verifyToken: (req, res, next) => {

        const token = req.headers.authorization ||req.cookies.token;
        if (!token) {
            return res.status(500).json({
                message: "please provide a token",
                success: false
            })
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded)
            req.user = decoded;
            next()
        } catch (error) {
            return res.status(500).json({
                message: "invalid token",
                success: false
            })
        }
    }
}

export default userMiddelware;