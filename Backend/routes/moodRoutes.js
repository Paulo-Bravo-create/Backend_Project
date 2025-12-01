const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); 
const moodController = require('../controllers/moodController'); 

// --- Mood Routes ---

// CREATE
router.post('/', protect, moodController.createMoodEntry);

// READ ALL
router.get('/', protect, moodController.getMoodEntries);

// READ SUMMARY (for Dashboard)
router.get('/summary', protect, moodController.getMoodSummary);

// UPDATE (NEW) - Requires log ID in the URL
router.put('/:id', protect, moodController.updateMoodEntry);

// DELETE (NEW) - Requires log ID in the URL
router.delete('/:id', protect, moodController.deleteMoodEntry);

module.exports = router;