const axios = require('axios');

/**
 * SMS Service for Seva Sarthi
 * Uses Fast2SMS API for Indian mobile numbers.
 * 
 * Setup:
 * 1. Go to https://www.fast2sms.com/ and create an account
 * 2. Get your API Key from Dashboard
 * 3. Add FAST2SMS_API_KEY=your_key to backend .env
 */

const sendSMS = async (phoneNumber, message) => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey || apiKey === 'your_fast2sms_api_key') {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 SMS (Fast2SMS not configured):');
    console.log('   To:', phoneNumber);
    console.log('   Message:', message);
    console.log('   ➜ Add FAST2SMS_API_KEY to .env for real SMS delivery');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { success: false, mode: 'no-sms-configured' };
  }

  try {
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: apiKey,
        message: message,
        language: 'english',
        route: 'q', // Quick SMS route (transactional)
        numbers: phoneNumber,
      },
      headers: {
        'cache-control': 'no-cache',
      },
    });

    if (response.data && response.data.return) {
      console.log(`✅ SMS sent to ${phoneNumber}`);
      return { success: true, mode: 'fast2sms' };
    } else {
      console.error('❌ SMS send failed:', response.data?.message || 'Unknown error');
      return { success: false, mode: 'fast2sms', error: response.data?.message };
    }
  } catch (error) {
    console.error('❌ SMS API error:', error.response?.data?.message || error.message);
    return { success: false, mode: 'fast2sms', error: error.message };
  }
};

/**
 * Send OTP via SMS
 * @param {string} phoneNumber - 10-digit Indian mobile number
 * @param {string} otp - 6-digit OTP
 */
const sendOtpSMS = async (phoneNumber, otp) => {
  const message = `Your Seva Sarthi verification code is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
  return sendSMS(phoneNumber, message);
};

module.exports = { sendSMS, sendOtpSMS };
