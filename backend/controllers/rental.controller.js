const Rental = require('../models/Rental');
const Tool = require('../models/Tool');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { TOOL_STATUS } = require('../utils/constants');
const { createAndPushNotification } = require('../services/notification.service');
const { getIO } = require('../config/socket');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const createRental = asyncHandler(async (req, res) => {
  const { toolId, days, deliveryDetails } = req.body;
  const tool = await Tool.findById(toolId);
  if (!tool) throw new ApiError(404, 'Tool not found.');
  if (tool.status !== TOOL_STATUS.AVAILABLE) throw new ApiError(400, 'Tool is not available for rent.');

  const subtotal = tool.dailyRate * days;
  const deliveryFee = 99;
  const tax = Math.round(subtotal * 0.05);
  const refundableDeposit = Math.max(500, Math.round(subtotal * 0.4));
  const total = subtotal + deliveryFee + tax;

  const rental = await Rental.create({
    userId: req.user._id, toolId, toolName: tool.name, days,
    subtotal, deliveryFee, tax, refundableDeposit, total,
    deliveryDetails, status: 'confirmed',
    deliveryOtp: generateOTP(),
    returnOtp: generateOTP(),
  });

  tool.status = TOOL_STATUS.RENTED;
  await tool.save();

  await createAndPushNotification({
    userId: req.user._id, title: 'Rental Confirmed',
    message: `Your rental for ${tool.name} (${days} days) has been confirmed. Total: ₹${total}.`,
    type: 'rental', metadata: { rentalId: rental._id },
  });

  // Notify tool owner (provider)
  await createAndPushNotification({
    userId: tool.ownerId.toString(), title: 'New Tool Rental',
    message: `${req.user.name} has rented your "${tool.name}" for ${days} days. Total: ₹${total}.`,
    type: 'rental', metadata: { rentalId: rental._id },
  });

  const io = getIO();
  if (io) {
    io.to(`user:${req.user._id.toString()}`).emit('new_rental', rental);
    io.to(`user:${tool.ownerId.toString()}`).emit('new_rental', rental);
  }

  res.status(201).json(new ApiResponse(201, { rental }, 'Rental created successfully.'));
});

const getRental = asyncHandler(async (req, res) => {
  const rental = await Rental.findById(req.params.id).populate('toolId', 'name image dailyRate');
  if (!rental) throw new ApiError(404, 'Rental not found.');
  res.status(200).json(new ApiResponse(200, { rental }, 'Rental retrieved.'));
});

const updateRentalStatus = asyncHandler(async (req, res) => {
  const { status, otp } = req.body;
  const rental = await Rental.findById(req.params.id).populate('toolId');
  if (!rental) throw new ApiError(404, 'Rental not found.');

  // Check OTPs if transitioning to delivered or returned
  if (status === 'delivered') {
    if (rental.deliveryOtp !== otp) {
      throw new ApiError(400, 'Invalid Delivery OTP');
    }
  } else if (status === 'returned') {
    if (rental.returnOtp !== otp) {
      throw new ApiError(400, 'Invalid Return OTP');
    }
    await Tool.findByIdAndUpdate(rental.toolId._id, { status: TOOL_STATUS.AVAILABLE });
  }

  rental.status = status;
  await rental.save();

  await createAndPushNotification({
    userId: rental.userId, title: 'Rental Updated',
    message: `Your rental status has been updated to: ${status}.`,
    type: 'rental', metadata: { rentalId: rental._id },
  });

  const io = getIO();
  if (io) {
    io.to(`user:${rental.userId.toString()}`).emit('rental_updated', rental);
    if (rental.toolId && rental.toolId.ownerId) {
      io.to(`user:${rental.toolId.ownerId.toString()}`).emit('rental_updated', rental);
    }
  }

  res.status(200).json(new ApiResponse(200, { rental }, `Rental status updated to ${status}.`));
});

const getProviderRentals = asyncHandler(async (req, res) => {
  const tools = await Tool.find({ ownerId: req.user._id }).select('_id');
  const toolIds = tools.map((t) => t._id);

  const rentals = await Rental.find({ toolId: { $in: toolIds } })
    .populate('userId', 'name phone avatar')
    .populate('toolId', 'name image dailyRate')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { rentals }, 'Provider rentals retrieved.'));
});

module.exports = { createRental, getRental, updateRentalStatus, getProviderRentals };
