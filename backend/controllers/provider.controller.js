const Provider = require('../models/Provider');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Tool = require('../models/Tool');
const Rental = require('../models/Rental');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { TOOL_STATUS } = require('../utils/constants');

// @desc    List all providers (with filters)
// @route   GET /api/providers
// @access  Public
const getAllProviders = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    city,
    sortBy = 'relevance',
    page = 1,
    limit = 20,
  } = req.query;

  const query = { isAvailable: true, verificationStatus: 'approved' };

  if (category) {
    query.category = category;
  }

  let providers;
  let total;

  if (search || city) {
    const userQuery = { role: 'provider' };
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { category: searchRegex },
      ];
      userQuery.name = searchRegex;
    }
    
    if (city) {
      userQuery['address.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    // Also search/filter by user (name and/or city)
    const matchingUsers = await User.find(userQuery).select('_id');
    const userIds = matchingUsers.map((u) => u._id);
    
    if (userIds.length > 0) {
      if (!query.$or) query.$or = [];
      query.$or.push({ userId: { $in: userIds } });
    } else if (city) {
      // If we are strictly filtering by city and no users found, return empty
      query.userId = null;
    }
  }

  total = await Provider.countDocuments(query);

  let sortOption = {};
  if (sortBy === 'highestRated') sortOption = { rating: -1 };
  else sortOption = { isTopRated: -1, rating: -1 };

  providers = await Provider.find(query)
    .populate('userId', 'name email avatar phone')
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json(
    new ApiResponse(200, {
      providers,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    }, 'Providers retrieved.')
  );
});

// @desc    Get single provider profile
// @route   GET /api/providers/:id
// @access  Public
const getProvider = asyncHandler(async (req, res) => {
  let provider;
  try {
    provider = await Provider.findById(req.params.id).populate('userId', 'name email avatar phone');
  } catch (err) {
    // Ignore cast errors, will try finding by userId below
  }

  if (!provider) {
    try {
      provider = await Provider.findOne({ userId: req.params.id }).populate('userId', 'name email avatar phone');
    } catch (err) {
      // Ignore
    }
  }

  if (!provider) {
    throw new ApiError(404, 'Provider not found.');
  }

  res.status(200).json(
    new ApiResponse(200, { provider }, 'Provider retrieved.')
  );
});

// @desc    Update provider profile (own)
// @route   PUT /api/providers/profile
// @access  Private (Provider)
const updateProviderProfile = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ userId: req.user._id });
  if (!provider) {
    throw new ApiError(404, 'Provider profile not found.');
  }

  const allowedFields = [
    'category', 'title', 'bio', 'skills', 'certifications',
    'portfolio', 'experience', 'pricePerHour', 'isAvailable',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      provider[field] = req.body[field];
    }
  });

  await provider.save();

  res.status(200).json(
    new ApiResponse(200, { provider }, 'Profile updated.')
  );
});

// @desc    Get pending job requests for provider
// @route   GET /api/providers/requests
// @access  Private (Provider)
const getPendingRequests = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ userId: req.user._id });
  if (!provider) throw new ApiError(404, 'Provider profile not found.');

  const requests = await Booking.find({
    providerId: provider._id,
    status: 'pending',
  })
    .populate('userId', 'name email avatar phone')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, { requests }, 'Pending requests retrieved.')
  );
});

// @desc    Toggle provider availability
// @route   PUT /api/providers/availability
// @access  Private (Provider)
const toggleAvailability = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ userId: req.user._id });
  if (!provider) throw new ApiError(404, 'Provider profile not found.');

  const newStatus = !provider.isAvailable;
  provider.isAvailable = newStatus;
  await provider.save();

  // Cascade the availability to all services and tools
  await Promise.all([
    // Update all services
    Service.updateMany(
      { providerId: req.user._id },
      { $set: { isActive: newStatus } }
    ),
    // Update all tools (only toggle available/maintenance, don't touch rented ones)
    Tool.updateMany(
      { 
        ownerId: req.user._id,
        status: { $in: [TOOL_STATUS.AVAILABLE, TOOL_STATUS.MAINTENANCE] }
      },
      { $set: { status: newStatus ? TOOL_STATUS.AVAILABLE : TOOL_STATUS.MAINTENANCE } }
    )
  ]);

  res.status(200).json(
    new ApiResponse(200, { isAvailable: provider.isAvailable }, `Now ${provider.isAvailable ? 'accepting' : 'not accepting'} jobs. All services and tools updated.`)
  );
});

// @desc    Get provider dashboard stats
// @route   GET /api/providers/dashboard
// @access  Private (Provider)
const getDashboardStats = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ userId: req.user._id });
  if (!provider) throw new ApiError(404, 'Provider profile not found.');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const providerTools = await Tool.find({ ownerId: req.user._id }).select('_id');
  const toolIds = providerTools.map(t => t._id);

  const [
    todayBookings,
    todayRentals,
    pendingBookingRequests,
    pendingRentalRequests,
    weeklyBookingEarnings,
    weeklyRentalEarnings,
    totalBookingEarningsAgg,
    totalRentalEarningsAgg
  ] = await Promise.all([
    // Today's Bookings
    Booking.countDocuments({
      providerId: provider._id,
      $or: [
        { scheduledDate: { $gte: today, $lt: tomorrow } },
        { status: { $in: ['accepted', 'en_route', 'working'] } },
        { status: 'completed', updatedAt: { $gte: today, $lt: tomorrow } }
      ],
      status: { $nin: ['cancelled'] },
    }),
    // Today's Rentals (Delivery or Return scheduled for today, or active, or finished today)
    Rental.countDocuments({
      toolId: { $in: toolIds },
      $or: [
        { 'deliveryDetails.deliveryDate': { $gte: today, $lt: tomorrow } },
        { status: { $in: ['confirmed', 'delivered'] } },
        { status: 'returned', updatedAt: { $gte: today, $lt: tomorrow } }
      ],
      status: { $nin: ['cancelled'] },
    }),
    // Pending Bookings
    Booking.countDocuments({ providerId: provider._id, status: 'pending' }),
    // Pending Rentals
    Rental.countDocuments({ toolId: { $in: toolIds }, status: 'pending' }),
    // Weekly booking earnings
    Booking.aggregate([
      {
        $match: {
          providerId: provider._id,
          status: 'completed',
          updatedAt: { $gte: weekStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    // Weekly rental earnings
    Rental.aggregate([
      {
        $match: {
          toolId: { $in: toolIds },
          status: 'returned',
          updatedAt: { $gte: weekStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    // All-time total booking earnings
    Booking.aggregate([
      {
        $match: {
          providerId: provider._id,
          status: 'completed',
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    // All-time total rental earnings
    Rental.aggregate([
      {
        $match: {
          toolId: { $in: toolIds },
          status: 'returned',
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ]);

  const todayJobs = todayBookings + todayRentals;
  const pendingRequests = pendingBookingRequests + pendingRentalRequests;
  const weeklyEarnings = (weeklyBookingEarnings[0]?.total || 0) + (weeklyRentalEarnings[0]?.total || 0);
  const totalEarnings = (totalBookingEarningsAgg[0]?.total || 0) + (totalRentalEarningsAgg[0]?.total || 0);


  // Also count completed bookings directly for accuracy
  const totalCompleted = await Booking.countDocuments({
    providerId: provider._id,
    status: 'completed',
  });

  res.status(200).json(
    new ApiResponse(200, {
      isAvailable: provider.isAvailable,
      todayJobs,
      pendingRequests,
      weeklyEarnings,
      totalEarnings,
      rating: provider.rating,
      jobsCompleted: totalCompleted || provider.jobsCompleted || 0,
      completionRate: totalCompleted > 0 ? `${Math.min(98, Math.round((totalCompleted / (totalCompleted + (pendingRequests || 1))) * 100))}%` : '0%',
    }, 'Dashboard stats retrieved.')
  );
});

// @desc    Get provider's active jobs (accepted, en_route, working)
// @route   GET /api/providers/schedule
// @access  Private (Provider)
const getTodaySchedule = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ userId: req.user._id });
  if (!provider) throw new ApiError(404, 'Provider profile not found.');

  const schedule = await Booking.find({
    providerId: provider._id,
    status: { $in: ['accepted', 'en_route', 'working'] },
  })
    .select('-otp -completionOtp')
    .populate('userId', 'name phone')
    .sort({ scheduledDate: 1, scheduledTime: 1 });

  res.status(200).json(
    new ApiResponse(200, { schedule }, 'Schedule retrieved.')
  );
});

// @desc    Get provider earnings
// @route   GET /api/providers/earnings
// @access  Private (Provider)
const getEarnings = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ userId: req.user._id });
  if (!provider) throw new ApiError(404, 'Provider profile not found.');

  const { period = 'week' } = req.query;

  let startDate = new Date();
  if (period === 'week') startDate.setDate(startDate.getDate() - 7);
  else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
  else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

  const earnings = await Booking.aggregate([
    {
      $match: {
        providerId: provider._id,
        status: 'completed',
        updatedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalEarnings = earnings.reduce((sum, e) => sum + e.total, 0);

  res.status(200).json(
    new ApiResponse(200, { earnings, totalEarnings, period }, 'Earnings retrieved.')
  );
});

// @desc    Get provider onboarding/verification status
// @route   GET /api/providers/onboarding-status
// @access  Private (Provider)
const getOnboardingStatus = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ userId: req.user._id });
  if (!provider) throw new ApiError(404, 'Provider profile not found.');

  res.status(200).json(
    new ApiResponse(200, {
      verificationStatus: provider.verificationStatus,
      rejectionReason: provider.rejectionReason || '',
      businessType: provider.businessType,
      businessName: provider.businessName,
      primaryCategory: provider.primaryCategory || provider.category,
      appliedAt: provider.createdAt,
      approvedAt: provider.approvedAt,
    }, 'Onboarding status retrieved.')
  );
});

module.exports = {
  getAllProviders,
  getProvider,
  updateProviderProfile,
  getPendingRequests,
  toggleAvailability,
  getDashboardStats,
  getTodaySchedule,
  getEarnings,
  getOnboardingStatus,
};
