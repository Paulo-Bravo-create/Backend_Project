const db = require('../db');

exports.saveResult = async (req, res) => {
  
    const userId = req.user ? req.user.user_id : null; 
    const { moon_phase, description } = req.body;

    if (!userId) {
        console.error('CRITICAL AUTH ERROR: User ID is missing in req.user. Token invalid or middleware failed.');
        return res.status(401).json({ message: 'Authentication failed. Please log in again.' });
    }
    
    if (!moon_phase) return res.status(400).json({ message: 'Moon phase is required' });

    
    let connection; 
    try {
      
        connection = await db.getConnection(); 
        await connection.beginTransaction(); 

        
        await connection.execute('DELETE FROM personality_results WHERE user_id = ?', [userId]);

       
        const sql = `INSERT INTO personality_results (user_id, moon_phase, description) VALUES (?, ?, ?)`;
        await connection.execute(sql, [userId, moon_phase, description]);

        await connection.commit(); 

        res.status(201).json({ message: 'Saved successfully.' });
    } catch (error) {
        
        if (connection) {
            await connection.rollback(); 
        }
        
       
        console.error('CRITICAL DATABASE/SQL Save Error:', error.message);
        console.error('SQL Statement that failed:', error.sql || 'N/A');
        
        
        res.status(500).json({ message: 'Server error. Please check your server console for the CRITICAL SQL error details.' });
    } finally {
     
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