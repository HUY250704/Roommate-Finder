const express = require('express');
const router = express.Router();
const { sendRequest, handleRequest, getRequests } = require('../controllers/RoommateRequestController');
const { protect } = require('../middleware/auth');

router.post('/', protect, sendRequest);
router.put('/:id', protect, handleRequest);
router.get('/', protect, getRequests);

module.exports = router;
