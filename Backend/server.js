const express = require('express');
const cors = require('cors'); 
const path = require('path'); 
require('dotenv').config(); 


const db = require('./db');


const authRoutes = require('./routes/authRoutes');
const journalRoutes = require('./routes/journalRoutes'); 
const moodRoutes = require('./routes/moodRoutes'); 
// NEW: Import the personality routes
const personalityRoutes = require('./routes/personalityRoutes'); 

const app = express();

const PORT = process.env.PORT || 3006; 




app.use(cors());


app.use(express.json());


app.use(express.static(path.join(__dirname, '../Frontend'))); 




app.use('/api/auth', authRoutes);
app.use('/api/journal_entries', journalRoutes); 
app.use('/api/mood_entries', moodRoutes); 
// NEW: Register the personality routes
app.use('/api/personality', personalityRoutes);


app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'MoodNight API is running successfully.' });
});



app.listen(PORT, () => {
    console.log(`\n🌙 MoodNight API server running on http://localhost:${PORT}`);
    
    
    db.getConnection()
        .then(connection => {
            console.log(`✅ Database connection successful to ${process.env.DB_NAME || 'DB'}!`);
            connection.release(); 
        })
        .catch(err => {
            console.error('❌ Database connection failed:', err.message);
        });
});