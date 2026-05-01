const router = require('express').Router();
const { validateCoupon } = require('../controllers/coupon.controller');
const { auth } = require('../middleware/auth');

router.post('/validate', auth, validateCoupon);

module.exports = router;
