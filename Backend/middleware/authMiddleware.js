// File: ../middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const db = require('../db'); // Your MySQL connection pool

// The protect middleware function
const protect = async (req, res, next) => {
    let token;

    // 1. Check if the token is present in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format: 'Bearer <token>')
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token
            // CRITICAL: process.env.JWT_SECRET MUST be correctly loaded and match the secret used for signing.
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 
            
            // Extract the user ID. We assume the ID is stored as 'user_id' in the token payload.
            const userId = decoded.user_id || decoded.id; // Fallback to 'id' just in case

            if (!userId) {
                 return res.status(401).json({ message: 'Not authorized, token payload is missing user ID' });
            }

            // 3. Find the user in the MySQL database using the extracted ID
            const sql = 'SELECT user_id, email FROM users WHERE user_id = ?';
            const [users] = await db.execute(sql, [userId]); 
            
            if (users.length === 0) {
                return res.status(401).json({ message: 'Not authorized, user not found in database' });
            }

            // 4. Attach the user object (specifically user_id) to the request
            req.user = users[0];

            // 5. Continue to the next middleware or the controller function
            next();
        } catch (error) {
            // This catches expired tokens or tokens signed with the wrong secret
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                 console.error('JWT Verification Failed:', error.message);
            } else {
                 console.error('Authentication Error:', error);
            }
            
            // Respond with a 401 Unauthorized status
            res.status(401).json({ message: 'Not authorized, token failed or expired' });
        }
    }

    // If no token is found in the headers
    if (!token) {
        // We set the status here in case the logic above was bypassed (e.g., header was missing)
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = protect;