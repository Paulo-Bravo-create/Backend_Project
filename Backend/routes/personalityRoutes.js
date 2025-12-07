const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const personalityController = require('../controllers/personalityController');

router.post('/', protect, personalityController.saveResult);
router.get('/', protect, personalityController.getResult);

module.exports = router;