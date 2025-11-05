const express = require('express');
const {
  getJobStatus,
  getJobReport,
  downloadFile,
} = require('../controllers/jobs.controller');

const router = express.Router();

router.get('/:jobId', getJobStatus);
router.get('/:jobId/report', getJobReport);
router.get('/:jobId/download', downloadFile);

module.exports = router;


