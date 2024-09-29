const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:presentationId', userController.getUsersInPresentation);
router.post('/update-role', userController.updateUserRole);
router.post('/', userController.createAndLogUser);

module.exports = router;
