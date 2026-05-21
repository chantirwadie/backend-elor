const express = require('express');
const router = express.Router();
const { uploadImage, uploadMultiple, deleteImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/', protect, admin, upload.single('image'), uploadImage);
router.post('/multiple', protect, admin, upload.array('images', 10), uploadMultiple);
router.delete('/:filename', protect, admin, deleteImage);

module.exports = router;
