const { supabase } = require('../config/db');

const normalizeCode = (code = '') => code.trim().toUpperCase();

const baseSelect = `id, code, description, discount_type, discount_value, max_discount_amount,
  min_cart_total, usage_limit, usage_count, starts_at, expires_at, is_active, created_at, updated_at`;

const mapCoupon = (coupon) => {
  if (!coupon) return null;
  return {
    ...coupon,
    discount_value: Number(coupon.discount_value || 0),
    max_discount_amount: coupon.max_discount_amount !== null ? Number(coupon.max_discount_amount) : null,
    min_cart_total: coupon.min_cart_total !== null ? Number(coupon.min_cart_total) : null,
  };
};

exports.listCoupons = async ({ limit = 50, offset = 0 } = {}) => {
  const rangeEnd = offset + limit - 1;
  const { data, error } = await supabase
    .from('coupons')
    .select(baseSelect)
    .order('created_at', { ascending: false })
    .range(offset, rangeEnd);

  if (error) throw error;
  return (data || []).map(mapCoupon);
};

exports.getCouponById = async (id) => {
  const { data, error } = await supabase
    .from('coupons')
    .select(baseSelect)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return mapCoupon(data);
};

exports.getCouponByCode = async (code) => {
  const normalized = normalizeCode(code);
  const { data, error } = await supabase
    .from('coupons')
    .select(baseSelect)
    .eq('code', normalized)
    .maybeSingle();

  if (error) throw error;
  return mapCoupon(data);
};

const buildCouponPayload = (data = {}) => {
  const payload = {
    code: normalizeCode(data.code),
    description: data.description || null,
    discount_type: data.discount_type === 'flat' ? 'flat' : 'percentage',
    discount_value: Number(data.discount_value || 0),
    max_discount_amount: data.max_discount_amount !== undefined && data.max_discount_amount !== null
      ? Number(data.max_discount_amount)
      : null,
    min_cart_total: data.min_cart_total !== undefined && data.min_cart_total !== null
      ? Number(data.min_cart_total)
      : null,
    usage_limit: data.usage_limit !== undefined && data.usage_limit !== null
      ? Number(data.usage_limit)
      : null,
    starts_at: data.starts_at || null,
    expires_at: data.expires_at || null,
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
  };

  if (!payload.code) {
    throw new Error('Coupon code is required');
  }
  if (!payload.discount_value || payload.discount_value <= 0) {
    throw new Error('Discount value must be greater than 0');
  }

  return payload;
};

exports.createCoupon = async (data) => {
  const payload = buildCouponPayload(data);
  const { data: created, error } = await supabase
    .from('coupons')
    .insert(payload)
    .select(baseSelect)
    .single();

  if (error) throw error;
  return mapCoupon(created);
};

exports.updateCoupon = async (id, data) => {
  const existing = await exports.getCouponById(id);
  if (!existing) {
    throw new Error('Coupon not found');
  }
  const payload = buildCouponPayload({ ...existing, ...data, code: data.code || existing.code });
  const { data: updated, error } = await supabase
    .from('coupons')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(baseSelect)
    .single();

  if (error) throw error;
  return mapCoupon(updated);
};

exports.deleteCoupon = async (id) => {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
  return true;
};

const ensureCouponActive = (coupon, cartTotal) => {
  if (!coupon) {
    return { valid: false, message: 'Coupon not found.' };
  }
  if (!coupon.is_active) {
    return { valid: false, message: 'This coupon is inactive.' };
  }
  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, message: 'This coupon is not yet active.' };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, message: 'This coupon has expired.' };
  }
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return { valid: false, message: 'This coupon has reached its usage limit.' };
  }
  if (coupon.min_cart_total && Number(cartTotal) < Number(coupon.min_cart_total)) {
    return { valid: false, message: `Minimum cart total ₹${Number(coupon.min_cart_total).toFixed(0)} required.` };
  }
  return { valid: true };
};

exports.calculateDiscount = (coupon, cartTotal) => {
  const total = Number(cartTotal) || 0;
  if (total <= 0) return 0;

  let discount = 0;
  if (coupon.discount_type === 'flat') {
    discount = Number(coupon.discount_value);
  } else {
    discount = (total * Number(coupon.discount_value)) / 100;
  }

  if (coupon.max_discount_amount) {
    discount = Math.min(discount, Number(coupon.max_discount_amount));
  }

  discount = Math.min(discount, total);
  return Number(discount.toFixed(2));
};

exports.validateCoupon = async ({ code, cartTotal }) => {
  const coupon = await exports.getCouponByCode(code);
  const status = ensureCouponActive(coupon, cartTotal);
  if (!status.valid) {
    return { valid: false, message: status.message };
  }

  const discountAmount = exports.calculateDiscount(coupon, cartTotal);
  if (discountAmount <= 0) {
    return { valid: false, message: 'Coupon does not apply to this cart.' };
  }

  return {
    valid: true,
    coupon,
    discountAmount,
    message: 'Coupon applied successfully.',
  };
};

exports.incrementUsage = async (couponId) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('usage_count')
    .eq('id', couponId)
    .single();
  if (error) throw error;
  const nextValue = (data?.usage_count || 0) + 1;
  const { error: updateError } = await supabase
    .from('coupons')
    .update({ usage_count: nextValue })
    .eq('id', couponId);
  if (updateError) throw updateError;
};

exports.recordRedemption = async ({ coupon_id, order_id, order_number, discount_amount }) => {
  if (!coupon_id) return;
  const { error } = await supabase.from('coupon_redemptions').insert({
    coupon_id,
    order_id,
    order_number,
    discount_amount,
  });
  if (error) throw error;
};
