import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { normalizeIndianPhone } from '../utils/phone.js';
import { setOtp, verifyOtp } from '../utils/otpStore.js';
import { sendOtpSms } from '../utils/sms.js';

const router = express.Router();

function randomOtp() {
  return String(crypto.randomInt(100000, 999999));
}

router.post('/send', async (req, res) => {
  try {
    const phone = normalizeIndianPhone(req.body.phone || '');
    if (phone.length !== 10) {
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
    }

    const otp = randomOtp();
    setOtp(phone, otp);
    await sendOtpSms(phone, otp);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ message: err.message || 'Failed to send OTP' });
  }
});

router.post('/verify', (req, res) => {
  try {
    const phone = normalizeIndianPhone(req.body.phone || '');
    const code = req.body.code ?? req.body.otp;
    if (phone.length !== 10 || !code) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const ok = verifyOtp(phone, String(code).trim());
    if (!ok) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Server misconfiguration' });
    }

    const phoneVerificationToken = jwt.sign(
      { purpose: 'phone_verify', phone },
      secret,
      { expiresIn: '15m' }
    );

    res.json({ success: true, phoneVerificationToken });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
});

export default router;
