const express = require('express');
const router = express.Router();
const { analyzeContent } = require('../controllers/analyze.controller');

// POST /api/analyze
router.post('/analyze', analyzeContent);

module.exports = router;