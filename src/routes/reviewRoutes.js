const express = require('express');
const router = express.Router();
const {
  addReview,
  getProductReviews,
  getAllReviews,
  approveReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/', protect, addReview);
router.get('/product/:productId', getProductReviews);
router.get('/admin/all', protect, admin, getAllReviews);
router.put('/:id/approve', protect, admin, approveReview);
router.delete('/:id', protect, admin, deleteReview);

module.exports = router;
