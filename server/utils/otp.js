const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const OTP_TTL_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const hashOtp = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

const compareOtp = (otp, hash) => bcrypt.compare(otp, hash);

const setOtp = async (user, purpose) => {
  const otp = generateOtp();
  user.otpHash = await hashOtp(otp);
  user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  user.otpPurpose = purpose;
  user.otpAttempts = 0;
  await user.save();
  return otp;
};

const assertOtp = async (user, otp, purpose) => {
  if (!user?.otpHash || user.otpPurpose !== purpose) {
    const error = new Error('Invalid or expired code');
    error.statusCode = 400;
    throw error;
  }

  if (!user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
    const error = new Error('Code expired. Request a new one.');
    error.statusCode = 400;
    throw error;
  }

  if ((user.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
    const error = new Error('Too many attempts. Request a new code.');
    error.statusCode = 429;
    throw error;
  }

  const matches = await compareOtp(String(otp || '').trim(), user.otpHash);
  user.otpAttempts = (user.otpAttempts || 0) + 1;
  await user.save();

  if (!matches) {
    const error = new Error('Invalid or expired code');
    error.statusCode = 400;
    throw error;
  }
};

const clearOtp = async (user) => {
  user.otpAttempts = 0;
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  user.otpPurpose = undefined;
  await user.save();
  await user.updateOne({ $unset: { otpHash: 1, otpExpiresAt: 1, otpPurpose: 1 } });
};

const canResendOtp = (user) => {
  if (!user.otpExpiresAt) return true;
  return user.otpExpiresAt.getTime() <= Date.now();
};

const remainingMs = (user) => {
  if (!user?.otpExpiresAt) return 0;
  return Math.max(0, user.otpExpiresAt.getTime() - Date.now());
};

module.exports = {
  OTP_TTL_MS,
  generateOtp,
  setOtp,
  assertOtp,
  clearOtp,
  canResendOtp,
  remainingMs,
};
