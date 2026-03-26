// Smart Ledger — Auth Module
// Simulated OTP for demo. Replace sendOTP/verifyOTP with real API calls.

const Auth = (() => {
  let pendingOTP = null;
  let pendingPhone = null;

  // Country codes list for picker
  const COUNTRY_CODES = [
    { code: '+1', flag: '🇺🇸', name: 'United States', iso: 'US' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom', iso: 'GB' },
    { code: '+92', flag: '🇵🇰', name: 'Pakistan', iso: 'PK' },
    { code: '+91', flag: '🇮🇳', name: 'India', iso: 'IN' },
    { code: '+971', flag: '🇦🇪', name: 'UAE', iso: 'AE' },
    { code: '+880', flag: '🇧🇩', name: 'Bangladesh', iso: 'BD' },
    { code: '+94', flag: '🇱🇰', name: 'Sri Lanka', iso: 'LK' },
    { code: '+977', flag: '🇳🇵', name: 'Nepal', iso: 'NP' },
    { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', iso: 'SA' },
    { code: '+974', flag: '🇶🇦', name: 'Qatar', iso: 'QA' },
    { code: '+968', flag: '🇴🇲', name: 'Oman', iso: 'OM' },
    { code: '+965', flag: '🇰🇼', name: 'Kuwait', iso: 'KW' },
    { code: '+973', flag: '🇧🇭', name: 'Bahrain', iso: 'BH' },
    { code: '+234', flag: '🇳🇬', name: 'Nigeria', iso: 'NG' },
    { code: '+254', flag: '🇰🇪', name: 'Kenya', iso: 'KE' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa', iso: 'ZA' },
    { code: '+49', flag: '🇩🇪', name: 'Germany', iso: 'DE' },
    { code: '+33', flag: '🇫🇷', name: 'France', iso: 'FR' },
    { code: '+7', flag: '🇷🇺', name: 'Russia', iso: 'RU' },
    { code: '+86', flag: '🇨🇳', name: 'China', iso: 'CN' },
    { code: '+81', flag: '🇯🇵', name: 'Japan', iso: 'JP' },
    { code: '+82', flag: '🇰🇷', name: 'South Korea', iso: 'KR' },
    { code: '+55', flag: '🇧🇷', name: 'Brazil', iso: 'BR' },
    { code: '+52', flag: '🇲🇽', name: 'Mexico', iso: 'MX' },
    { code: '+61', flag: '🇦🇺', name: 'Australia', iso: 'AU' },
  ];

  const sendOTP = (phone) => {
    return new Promise((resolve) => {
      pendingPhone = phone;
      // Generate 6-digit OTP
      pendingOTP = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`[Smart Ledger Demo] OTP for ${phone}: ${pendingOTP}`);
      // Simulate network delay
      setTimeout(() => {
        resolve({ success: true, otp: pendingOTP }); // In production, don't return OTP!
      }, 1200);
    });
  };

  const verifyOTP = (phone, otp) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (otp === pendingOTP && phone === pendingPhone) {
          pendingOTP = null;
          pendingPhone = null;
          const session = { phone, verifiedAt: new Date().toISOString() };
          DB.setSession(session);
          resolve({ success: true });
        } else {
          resolve({ success: false, error: 'Invalid OTP. Please try again.' });
        }
      }, 800);
    });
  };

  const isLoggedIn = () => {
    return !!DB.getSession() && !!DB.getUser()?.name;
  };

  const logout = () => {
    DB.clearSession();
  };

  const getCountryCodes = () => COUNTRY_CODES;

  const formatPhone = (countryCode, number) => `${countryCode}${number.replace(/^0+/, '')}`;

  return { sendOTP, verifyOTP, isLoggedIn, logout, getCountryCodes, formatPhone };
})();
