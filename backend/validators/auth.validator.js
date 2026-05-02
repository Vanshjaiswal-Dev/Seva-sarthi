const Joi = require('joi');

const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).max(128).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).allow('').optional().messages({
      'string.pattern.base': 'Enter a valid 10-digit mobile number',
    }),
    role: Joi.string().valid('user', 'provider').default('user'),
    // User address fields
    address: Joi.object({
      line1: Joi.string().allow(''),
      line2: Joi.string().allow(''),
      city: Joi.string().allow(''),
      pincode: Joi.string().allow(''),
      landmark: Joi.string().allow(''),
    }).optional(),
    // Provider-specific fields (optional, only used when role=provider)
    category: Joi.string().optional(),
    title: Joi.string().optional(),
    bio: Joi.string().max(1000).allow('').optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    experience: Joi.string().optional(),
    // New onboarding fields
    businessType: Joi.string().valid('individual', 'shop', 'agency').optional(),
    businessName: Joi.string().allow('').optional(),
    ownerName: Joi.string().allow('').optional(),
    fullAddress: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    pincode: Joi.string().allow('').optional(),
    primaryCategory: Joi.string().allow('').optional(),
    documents: Joi.object({
      idProof: Joi.string().allow(''),
      idProofType: Joi.string().valid('aadhar', 'pan', '').allow(''),
      profilePhoto: Joi.string().allow(''),
      businessLicense: Joi.string().allow(''),
      gst: Joi.string().allow(''),
    }).optional(),
  }),
};


const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),
};

const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    newPassword: Joi.string().min(6).max(128).required().messages({
      'string.min': 'New password must be at least 6 characters',
      'any.required': 'New password is required',
    }),
  }),
};

const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required',
    }),
  }),
};

const verifyOtpSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required().messages({
      'string.length': 'OTP must be 6 digits',
      'any.required': 'OTP is required',
    }),
  }),
};

const resetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    resetToken: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required().messages({
      'string.min': 'Password must be at least 6 characters',
    }),
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
};
