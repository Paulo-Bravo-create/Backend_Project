

const db = require('../db'); 


const createJournalEntry = async (req, res) => {
    try {
        const userId = req.user.user_id; 
        const { title, content, sentiment_score } = req.body;

        if (!title || !content || sentiment_score === undefined) {
            return res.status(400).json({ message: 'Please include a title, content, and sentiment score' });
        }

        const sql = `
            INSERT INTO journal_entries 
            (user_id, title, content, sentiment_score) 
            VALUES (?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(sql, [userId, title, content, sentiment_score]);

        res.status(201).json({ 
            message: 'Journal entry saved successfully!',
            journal_id: result.insertId 
        });

    } catch (error) {
        console.error('MySQL Error (Create):', error);
        res.status(500).json({ message: 'Database error during entry creation' });
    }
};


const getJournalEntries = async (req, res) => {
    try {
        const userId = req.user.user_id; 

        const sql = `
            SELECT journal_id, title, content, sentiment_score, entry_date 
            FROM journal_entries 
            WHERE user_id = ?
            ORDER BY entry_date DESC
        `;
        
        const [entries] = await db.execute(sql, [userId]);

        res.status(200).json(entries);

    } catch (error) {
        console.error('MySQL Error (Read):', error);
        res.status(500).json({ message: 'Database error during entry retrieval' });
    }
};


const updateJournalEntry = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const journalId = req.params.id;
        const { title, content, sentiment_score } = req.body;

        if (!title || !content || sentiment_score === undefined) {
            return res.status(400).json({ message: 'All fields (title, content, sentiment_score) are required for update.' });
        }

        const sql = `
            UPDATE journal_entries 
            SET title = ?, content = ?, sentiment_score = ?
            WHERE journal_id = ? AND user_id = ?
        `;
        
        const [result] = await db.execute(sql, [title, content, sentiment_score, journalId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Journal entry not found or not authorized.' });
        }

        res.status(200).json({ message: 'Journal entry updated successfully.' });

    } catch (error) {
        console.error('MySQL Error (Update):', error);
        res.status(500).json({ message: 'Database error during entry update.' });
    }
};


const deleteJournalEntry = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const journalId = req.params.id;

        const sql = `
            DELETE FROM journal_entries 
            WHERE journal_id = ? AND user_id = ?
        `;
        
        const [result] = await db.execute(sql, [journalId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Journal entry not found or not authorized.' });
        }

        res.status(200).json({ message: 'Journal entry deleted successfully.' });

    } catch (error) {
        console.error('MySQL Error (Delete):', error);
        res.status(500).json({ message: 'Database error during entry deletion.' });
    }
};


const getJournalSummary = async (req, res) => {
    try {
        const userId = req.user.user_id; 

        const sql = `
            SELECT 
                COUNT(journal_id) AS total_entries,
                AVG(sentiment_score) AS average_sentiment
            FROM journal_entries 
            WHERE user_id = ?
        `;
        
        const [result] = await db.execute(sql, [userId]);
        const summary = result[0];

        summary.average_sentiment = summary.average_sentiment !== null 
            ? parseFloat(summary.average_sentiment).toFixed(2) 
            : '0.00';

        res.status(200).json(summary);

    } catch (error) {
        console.error('MySQL Error (Journal Summary):', error);
        res.status(500).json({ message: 'Database error during journal summary retrieval' });
    }
};


module.exports = {
    createJournalEntry,
    getJournalEntries,
    updateJournalEntry, 
    deleteJournalEntry, 
    getJournalSummary
};