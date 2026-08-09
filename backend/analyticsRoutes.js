const express = require('express');
const router = express.Router();
// Changed from '../controllers/analyticsController'
const { getRefillPredictions, getAdherenceStats } = require('./analyticsController'); 

router.get('/refills/:userId', getRefillPredictions);
router.get('/adherence/:userId', getAdherenceStats);

module.exports = router;