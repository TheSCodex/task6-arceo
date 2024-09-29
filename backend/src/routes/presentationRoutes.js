const express = require('express');
const router = express.Router();
const presentationController = require('../controllers/presentationController.js');

router.post('/', presentationController.createPresentation);
router.get('/', presentationController.getAllPresentations);

module.exports = router;
