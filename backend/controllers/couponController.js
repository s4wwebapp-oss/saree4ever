const couponService = require('../services/couponService');

exports.listCoupons = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const coupons = await couponService.listCoupons({
      limit: Number(limit),
      offset: Number(offset),
    });
    res.json({ coupons, count: coupons.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json({ coupon, message: 'Coupon created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await couponService.updateCoupon(id, req.body);
    res.json({ coupon, message: 'Coupon updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await couponService.deleteCoupon(id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal = 0 } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }
    const result = await couponService.validateCoupon({ code, cartTotal: Number(cartTotal) });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
