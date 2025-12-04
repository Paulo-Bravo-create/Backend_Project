const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); 
const moodController = require('../controllers/moodController'); 


router.post('/', protect, moodController.createMoodEntry);


router.get('/', protect, moodController.getMoodEntries);


router.get('/summary', protect, moodController.getMoodSummary);

router.put('/:id', protect, moodController.updateMoodEntry);


router.delete('/:id', protect, moodController.deleteMoodEntry);

module.exports = router;