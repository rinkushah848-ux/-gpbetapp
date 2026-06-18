export const ESEWA_CONFIG = {
  merchantId: process.env.ESEWA_MERCHANT_ID || '',
  secretKey: process.env.ESEWA_SECRET_KEY || '',
  testMode: process.env.ESEWA_TEST_MODE === 'true',
  get gatewayUrl() {
    return this.testMode
      ? 'https://rc.esewa.com.np/epay/main'
      : 'https://esewa.com.np/epay/main';
  },
  get verifyUrl() {
    return this.testMode
      ? 'https://rc.esewa.com.np/epay/transrec'
      : 'https://esewa.com.np/epay/transrec';
  },
  successUrl: process.env.ESEWA_SUCCESS_URL || 'http://localhost:5000/api/esewa/success',
  failureUrl: process.env.ESEWA_FAILURE_URL || 'http://localhost:3000/profile?deposit=failed',
};
