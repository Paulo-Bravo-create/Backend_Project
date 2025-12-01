// File: ../controllers/moodController.js

const db = require('../db'); 

// @desc    Create a new mood entry
// @route   POST /api/mood_entries/
// @access  Private 
const createMoodEntry = async (req, res) => {
    // ... (Your existing logic)
    try {
        const userId = req.user.user_id; 
        const { mood_value, mood_note, mood_emoji } = req.body; 

        if (mood_value === undefined) {
            return res.status(400).json({ message: 'Mood score (mood_value) is required.' });
        }

        const sql = `
            INSERT INTO mood_logs 
            (user_id, mood_value, mood_note, mood_emoji) 
            VALUES (?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(sql, [userId, mood_value, mood_note || '', mood_emoji || '']);

        res.status(201).json({ 
            message: 'Mood entry saved successfully!',
            mood_id: result.insertId 
        });

    } catch (error) {
        console.error('MySQL Error (Mood Create):', error);
        res.status(500).json({ message: 'Database error during mood entry creation' });
    }
};

// @desc    Get all mood entries for the authenticated user
// @route   GET /api/mood_entries/
// @access  Private 
const getMoodEntries = async (req, res) => {
    // ... (Your existing logic)
    try {
        const userId = req.user.user_id; 

        const sql = `
            SELECT mood_id, mood_value, mood_note, mood_emoji, log_timestamp 
            FROM mood_logs 
            WHERE user_id = ?
            ORDER BY log_timestamp DESC
        `;
        
        const [entries] = await db.execute(sql, [userId]);

        res.status(200).json(entries);

    } catch (error) {
        console.error('MySQL Error (Mood Read):', error);
        res.status(500).json({ message: 'Database error during mood entry retrieval' });
    }
};


// @desc    Update a specific mood entry (NEW)
// @route   PUT /api/mood_entries/:id
// @access  Private 
const updateMoodEntry = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const moodId = req.params.id;
        const { mood_value, mood_note, mood_emoji } = req.body;

        if (mood_value === undefined) {
            return res.status(400).json({ message: 'Mood score (mood_value) is required for update.' });
        }

        const sql = `
            UPDATE mood_logs 
            SET mood_value = ?, mood_note = ?, mood_emoji = ?
            WHERE mood_id = ? AND user_id = ?
        `;
        
        const [result] = await db.execute(sql, [mood_value, mood_note || '', mood_emoji || '', moodId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Mood entry not found or not authorized.' });
        }

        res.status(200).json({ message: 'Mood entry updated successfully.' });

    } catch (error) {
        console.error('MySQL Error (Update):', error);
        res.status(500).json({ message: 'Database error during mood entry update.' });
    }
};

// @desc    Delete a specific mood entry (NEW)
// @route   DELETE /api/mood_entries/:id
// @access  Private 
const deleteMoodEntry = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const moodId = req.params.id;

        const sql = `
            DELETE FROM mood_logs 
            WHERE mood_id = ? AND user_id = ?
        `;
        
        const [result] = await db.execute(sql, [moodId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Mood entry not found or not authorized.' });
        }

        res.status(200).json({ message: 'Mood entry deleted successfully.' });

    } catch (error) {
        console.error('MySQL Error (Delete):', error);
        res.status(500).json({ message: 'Database error during mood entry deletion.' });
    }
};

// @desc    Get summary statistics for mood logs (NEW for Dashboard)
// @route   GET /api/mood_entries/summary
// @access  Private 
const getMoodSummary = async (req, res) => {
    try {
        const userId = req.user.user_id; 

        const sql = `
            SELECT 
                COUNT(mood_id) AS total_logs,
                AVG(mood_value) AS average_mood
            FROM mood_logs 
            WHERE user_id = ?
        `;
        
        const [result] = await db.execute(sql, [userId]);
        const summary = result[0];

        summary.average_mood = summary.average_mood !== null 
            ? parseFloat(summary.average_mood).toFixed(2) 
            : '0.00';

        res.status(200).json(summary);

    } catch (error) {
        console.error('MySQL Error (Mood Summary):', error);
        res.status(500).json({ message: 'Database error during mood summary retrieval' });
    }
};

module.exports = {
    createMoodEntry,
    getMoodEntries,
    updateMoodEntry, // EXPORT NEW
    deleteMoodEntry, // EXPORT NEW
    getMoodSummary
};