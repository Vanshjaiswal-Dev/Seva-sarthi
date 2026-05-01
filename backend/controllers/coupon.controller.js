const Coupon = require('../models/Coupon');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount = 0 } = req.body;
  if (!code) throw new ApiError(400, 'Coupon code is required.');

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, 'Invalid or expired coupon code.');

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new ApiError(400, 'This coupon has expired.');
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new ApiError(400, 'This coupon has reached its usage limit.');
  }
  if (orderAmount < coupon.minOrderAmount) {
    throw new ApiError(400, `Minimum order amount of ₹${coupon.minOrderAmount} required.`);
  }

  let discount = 0;
  if (coupon.discountType === 'flat') discount = coupon.discountValue;
  else if (coupon.discountType === 'percent') {
    discount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscount !== null) discount = Math.min(discount, coupon.maxDiscount);
  }

  res.status(200).json(new ApiResponse(200, {
    code: coupon.code, discountType: coupon.discountType,
    discountValue: coupon.discountValue, discount: Math.round(discount),
    description: coupon.description,
  }, 'Coupon is valid.'));
});

module.exports = { validateCoupon };
