// Smart Ledger — Login View
const LoginView = (container, params) => {
  const countryCodes = Auth.getCountryCodes();
  let selectedCountry = countryCodes.find(c => c.iso === 'PK') || countryCodes[0];
  let otpGenerated = null;
  let phoneNumber = '';
  let step = params.step || 'phone'; // 'phone' | 'otp'

  const render = () => {
    container.innerHTML = `
      <div class="auth-screen">
        <div class="auth-header">
          <div class="auth-logo">
            <div class="logo-icon">📒</div>
            <h1 class="logo-title">Smart Ledger</h1>
            <p class="logo-subtitle">Your personal & business ledger</p>
          </div>
        </div>

        <div class="auth-card" id="auth-card">
          ${step === 'phone' ? renderPhoneStep() : renderOtpStep()}
        </div>

        <p class="auth-footer">By continuing, you agree to our Terms of Service</p>
      </div>
    `;
    attachListeners();
  };

  const renderPhoneStep = () => `
    <div class="step-header">
      <h2>Welcome back</h2>
      <p>Enter your phone number to continue</p>
    </div>
    <div class="phone-input-group">
      <button class="country-code-btn" id="cc-btn">
        <span class="cc-flag">${selectedCountry.flag}</span>
        <span class="cc-code">${selectedCountry.code}</span>
        <span class="cc-arrow">▾</span>
      </button>
      <input
        type="tel"
        id="phone-input"
        class="phone-input"
        placeholder="3001234567"
        inputmode="numeric"
        maxlength="15"
        autocomplete="tel"
        value="${phoneNumber}"
      />
    </div>
    <div id="cc-dropdown" class="cc-dropdown hidden"></div>
    <div id="auth-error" class="error-msg hidden"></div>
    <button class="btn-primary btn-large" id="send-otp-btn">
      <span>Continue</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>
  `;

  const renderOtpStep = () => `
    <div class="step-header">
      <button class="back-link" id="back-to-phone">← Change number</button>
      <h2>Verify your number</h2>
      <p>Enter the 6-digit code sent to <strong>${phoneNumber}</strong></p>
    </div>
    ${otpGenerated ? `<div class="otp-demo-banner">📱 Demo OTP: <strong>${otpGenerated}</strong></div>` : ''}
    <div class="otp-inputs" id="otp-inputs">
      ${[0,1,2,3,4,5].map(i => `<input type="tel" inputmode="numeric" maxlength="1" class="otp-digit" data-index="${i}" id="otp-${i}">`).join('')}
    </div>
    <div id="auth-error" class="error-msg hidden"></div>
    <button class="btn-primary btn-large" id="verify-otp-btn">
      <span>Verify & Login</span>
    </button>
    <button class="btn-text" id="resend-otp-btn">Resend code</button>
  `;

  const showError = (msg) => {
    const el = document.getElementById('auth-error');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  };

  const showCCDropdown = () => {
    const dd = document.getElementById('cc-dropdown');
    dd.innerHTML = `<div class="cc-search-wrap"><input type="text" placeholder="Search country..." class="cc-search" id="cc-search" autocomplete="off"></div>
    <div class="cc-list" id="cc-list">
      ${countryCodes.map(c => `<button class="cc-item" data-iso="${c.iso}">${c.flag} <span class="cc-name">${c.name}</span> <span class="cc-num">${c.code}</span></button>`).join('')}
    </div>`;
    dd.classList.remove('hidden');

    document.getElementById('cc-search').addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.cc-item').forEach(btn => {
        btn.style.display = btn.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });

    dd.querySelectorAll('.cc-item').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCountry = countryCodes.find(c => c.iso === btn.dataset.iso);
        dd.classList.add('hidden');
        render();
      });
    });

    document.addEventListener('click', (e) => {
      if (!dd.contains(e.target) && e.target.id !== 'cc-btn') dd.classList.add('hidden');
    }, { once: true });
  };

  const attachListeners = () => {
    if (step === 'phone') {
      document.getElementById('cc-btn').addEventListener('click', showCCDropdown);
      document.getElementById('phone-input').addEventListener('input', e => {
        phoneNumber = e.target.value.replace(/\D/g, '');
      });
      document.getElementById('send-otp-btn').addEventListener('click', async () => {
        phoneNumber = document.getElementById('phone-input').value.replace(/\D/g, '');
        if (phoneNumber.length < 7) { showError('Please enter a valid phone number'); return; }
        const fullPhone = Auth.formatPhone(selectedCountry.code, phoneNumber);
        const btn = document.getElementById('send-otp-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Sending...';
        const result = await Auth.sendOTP(fullPhone);
        if (result.success) {
          otpGenerated = result.otp;
          phoneNumber = fullPhone;
          step = 'otp';
          render();
        }
      });
    } else {
      // OTP digit auto-advance
      const digits = document.querySelectorAll('.otp-digit');
      digits.forEach((input, idx) => {
        input.addEventListener('input', e => {
          const val = e.target.value.replace(/\D/g, '');
          e.target.value = val ? val[0] : '';
          if (val && idx < 5) digits[idx + 1].focus();
        });
        input.addEventListener('keydown', e => {
          if (e.key === 'Backspace' && !e.target.value && idx > 0) digits[idx - 1].focus();
        });
        input.addEventListener('paste', e => {
          const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
          if (pasted.length === 6) {
            digits.forEach((d, i) => { d.value = pasted[i] || ''; });
            digits[5].focus();
          }
          e.preventDefault();
        });
      });
      digits[0].focus();

      document.getElementById('back-to-phone').addEventListener('click', () => {
        step = 'phone'; render();
      });

      document.getElementById('verify-otp-btn').addEventListener('click', async () => {
        const otp = Array.from(digits).map(d => d.value).join('');
        if (otp.length !== 6) { showError('Please enter all 6 digits'); return; }
        const btn = document.getElementById('verify-otp-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Verifying...';
        const result = await Auth.verifyOTP(phoneNumber, otp);
        if (result.success) {
          const user = DB.getUser();
          if (!user?.name) {
            Router.navigate('setup');
          } else {
            DB.seedDemo();
            Router.navigate('dashboard');
          }
        } else {
          btn.disabled = false;
          btn.innerHTML = 'Verify & Login';
          showError(result.error);
        }
      });

      document.getElementById('resend-otp-btn').addEventListener('click', async () => {
        const result = await Auth.sendOTP(phoneNumber);
        if (result.success) { otpGenerated = result.otp; render(); }
      });
    }
  };

  render();
};
