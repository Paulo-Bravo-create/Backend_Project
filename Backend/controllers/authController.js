const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); 


const validateAuthInput = (full_name, email, password) => {
    if (!full_name || !email || !password) {
        return "All fields are required.";
    }
    if (password.length < 8) {
        return "Password must be at least 8 characters.";
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "Invalid email format.";
    }
    return null; 
};



exports.registerUser = async (req, res) => {
    const { full_name, email, password } = req.body;
    const validationError = validateAuthInput(full_name, email, password);

    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        
        const [existingUsers] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        
        const [result] = await db.query(
            'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
            [full_name, email, password_hash]
        );

        
        res.status(201).json({ 
            message: 'User registered successfully.', 
            userId: result.insertId 
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};



exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        
        const [users] = await db.query('SELECT user_id, full_name, password_hash FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        
        const token = jwt.sign(
            { user_id: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } 
        );

        
        res.json({
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: email
            },
            message: 'Login successful.'
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login.' });
    }
};