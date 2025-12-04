const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const protect = require('../middleware/authMiddleware'); 




router.post('/', protect, journalController.createJournalEntry);


router.get('/', protect, journalController.getJournalEntries);


router.get('/summary', protect, journalController.getJournalSummary);

router.put('/:id', protect, journalController.updateJournalEntry);

router.delete('/:id', protect, journalController.deleteJournalEntry);


module.exports = router;