const express = require('express');
const router = express.Router();
const { handleReports, updateReportStatus } = require('../controllers/ReportController');
const { protect } = require('../middleware/auth');

router.get('/', protect, handleReports);
router.put('/:id', protect, updateReportStatus);

module.exports = router;
