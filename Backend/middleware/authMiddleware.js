

const jwt = require('jsonwebtoken');
const db = require('../db'); 


const protect = async (req, res, next) => {
    let token;

   
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
           
            token = req.headers.authorization.split(' ')[1];


            const decoded = jwt.verify(token, process.env.JWT_SECRET); 
            
      
            const userId = decoded.user_id || decoded.id; 

            if (!userId) {
                 return res.status(401).json({ message: 'Not authorized, token payload is missing user ID' });
            }

          
            const sql = 'SELECT user_id, email FROM users WHERE user_id = ?';
            const [users] = await db.execute(sql, [userId]); 
            
            if (users.length === 0) {
                return res.status(401).json({ message: 'Not authorized, user not found in database' });
            }


            req.user = users[0];


            next();
        } catch (error) {
        
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                 console.error('JWT Verification Failed:', error.message);
            } else {
                 console.error('Authentication Error:', error);
            }
            
       
            res.status(401).json({ message: 'Not authorized, token failed or expired' });
        }
    }


    if (!token) {
       
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = protect;