const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const protect = require('../middleware/authMiddleware'); 

// --- Journal Routes ---

// CREATE
router.post('/', protect, journalController.createJournalEntry);

// READ ALL
router.get('/', protect, journalController.getJournalEntries);

// READ SUMMARY (for Dashboard)
router.get('/summary', protect, journalController.getJournalSummary);

// UPDATE (NEW) - Requires entry ID in the URL
router.put('/:id', protect, journalController.updateJournalEntry);

// DELETE (NEW) - Requires entry ID in the URL
router.delete('/:id', protect, journalController.deleteJournalEntry);


module.exports = router;