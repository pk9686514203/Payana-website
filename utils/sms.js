/**
 * Sends OTP via Twilio or Fast2SMS. If neither is configured, logs in non-production.
 */
export async function sendOtpSms(phone10, otp) {
  const body = `Your Namma Payana verification code is ${otp}. Valid for 10 minutes.`;

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    const twilio = (await import('twilio')).default;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const to = phone10.startsWith('+') ? phone10 : `+91${phone10}`;
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    return;
  }

  if (process.env.FAST2SMS_API_KEY) {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: process.env.FAST2SMS_ROUTE || 'otp',
        numbers: phone10,
        message: body,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Fast2SMS failed: ${text}`);
    }
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SMS stub] OTP for ${phone10}: ${otp}`);
    return;
  }

  throw new Error(
    'SMS is not configured. Set TWILIO_* or FAST2SMS_API_KEY on the server for production OTP delivery.'
  );
}

export async function sendBookingConfirmationSms(phone10, message) {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    const twilio = (await import('twilio')).default;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const to = phone10.startsWith('+') ? phone10 : `+91${phone10}`;
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
  }
}
