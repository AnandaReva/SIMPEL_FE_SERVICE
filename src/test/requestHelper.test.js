const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

// Path sesuai struktur proyekmu
const requestHelper = require('../../src/utils/requestHelper');
const config = require('../../src/configs/config');

// Ambil fungsi dan URL base
const Auth_Process = requestHelper.Auth_Process;
const BASE_AUTH_URL = config.BASE_AUTH_URL || 'http://localhost:3000'; // default fallback

describe('Auth_Process Unit Test', () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  const testCases = [
    { path: '/login', desc: 'Login Handler' },
    { path: '/register', desc: 'Register Handler' },
    { path: '/logout', desc: 'Logout Handler' },
    { path: '/verify-token', desc: 'Verify Token Handler' },
    { path: '/register/verify-otp', desc: 'Register Verify OTP Handler' },
    { path: '/reset-password', desc: 'Reset Password Handler' },
    { path: '/reset-password/verify-url', desc: 'Reset Password Verify URL Handler' }
  ];

  testCases.forEach(({ path, desc }) => {
    it(`${desc} - success response`, async () => {
      mock.onPost(`${BASE_AUTH_URL}${path}`).reply(200, {
        ErrorCode: "000000",
        ErrorMessage: "",
        Payload: {
          full_nonce: "12345678wAbk2Csd",
          salt: "O07HoiEWKqelbTM8"
        }
      });

      const result = await Auth_Process(BASE_AUTH_URL, path, { dummy: "data" });

      expect(result).toEqual({
        error_code: "000",
        error_message: "",
        payload: {
          full_nonce: "12345678wAbk2Csd",
          salt: "O07HoiEWKqelbTM8"
        },
        status: "success"
      });
    });

    it(`${desc} - error response 401`, async () => {
      mock.onPost(`${BASE_AUTH_URL}${path}`).reply(401, {
        ErrorCode: "401000",
        ErrorMessage: "Unauthorized",
        Payload: {}
      });

      const result = await Auth_Process(BASE_AUTH_URL, path, { dummy: "data" });

      expect(result).toEqual({
        error_code: "401",
        error_message: "Unauthorized",
        payload: {},
        status: "error"
      });
    });

    it(`${desc} - network error`, async () => {
      mock.onPost(`${BASE_AUTH_URL}${path}`).networkError();

      const result = await Auth_Process(BASE_AUTH_URL, path, { dummy: "data" });

      expect(result).toEqual({
        error_code: "503",
        error_message: "Network Error",
        payload: {},
        status: "error"
      });
    });
  });
});
