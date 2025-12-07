const db = require('../db');

exports.saveResult = async (req, res) => {
    // Safely access user_id and check for middleware failure
    const userId = req.user ? req.user.user_id : null; 
    const { moon_phase, description } = req.body;

    if (!userId) {
        console.error('CRITICAL AUTH ERROR: User ID is missing in req.user. Token invalid or middleware failed.');
        return res.status(401).json({ message: 'Authentication failed. Please log in again.' });
    }
    
    if (!moon_phase) return res.status(400).json({ message: 'Moon phase is required' });

    // --- TRANSACTION IMPLEMENTATION TO ENSURE ATOMIC DELETE/INSERT ---
    let connection; // Declare connection variable to be accessible in finally block
    try {
        // 1. Get a dedicated connection from the pool
        connection = await db.getConnection(); 
        await connection.beginTransaction(); // Start the transaction

        // 2. Delete old result so user only has 1 (Part of the transaction)
        await connection.execute('DELETE FROM personality_results WHERE user_id = ?', [userId]);

        // 3. Save new result (Part of the transaction)
        const sql = `INSERT INTO personality_results (user_id, moon_phase, description) VALUES (?, ?, ?)`;
        await connection.execute(sql, [userId, moon_phase, description]);

        await connection.commit(); // Commit the transaction if both operations succeed

        res.status(201).json({ message: 'Saved successfully.' });
    } catch (error) {
        // If any error occurred, rollback the transaction
        if (connection) {
            await connection.rollback(); // Rollback to undo the DELETE if INSERT failed
        }
        
        // --- ENHANCED ERROR LOGGING ---
        console.error('CRITICAL DATABASE/SQL Save Error:', error.message);
        console.error('SQL Statement that failed:', error.sql || 'N/A');
        // ------------------------------
        
        res.status(500).json({ message: 'Server error. Please check your server console for the CRITICAL SQL error details.' });
    } finally {
        // 4. Release the connection back to the pool in any case
        if (connection) {
            connection.release();
        }
    }
};

exports.getResult = async (req, res) => {
    try {
        const userId = req.user ? req.user.user_id : null;
        
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required for retrieval.' });
        }
        
        const [rows] = await db.execute('SELECT * FROM personality_results WHERE user_id = ?', [userId]);
        res.status(200).json(rows[0] || {});
    } catch (error) {
        console.error('CRITICAL DATABASE/SQL Get Error:', error.message);
        res.status(500).json({ message: 'Server error. Check server console for SQL error details.' });
    }
};