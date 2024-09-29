const express = require('express');
const router = express.Router();
const slideController = require('../controllers/slideController.js');

router.post('/', slideController.createSlide);
router.put('/', slideController.updateSlide);
router.get('/:presentationId', slideController.getSlidesByPresentationId);

module.exports = router;
