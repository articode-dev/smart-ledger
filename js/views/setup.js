// Smart Ledger — Setup View (First-time user onboarding)
const SetupView = (container, params) => {
  const CURRENCIES = [
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', flag: '🇵🇰' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦' },
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', flag: '🇧🇩' },
    { code: 'NPR', symbol: 'Rs', name: 'Nepali Rupee', flag: '🇳🇵' },
    { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', flag: '🇱🇰' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
    { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal', flag: '🇶🇦' },
    { code: 'OMR', symbol: '﷼', name: 'Omani Rial', flag: '🇴🇲' },
    { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
    { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', flag: '🇧🇭' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso', flag: '🇲🇽' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  ];

  const session = DB.getSession();
  let selectedCurrency = CURRENCIES[0];
  let selectedStep = 0;

  const render = () => {
    container.innerHTML = `
      <div class="setup-screen">
        <div class="setup-progress">
          <div class="progress-bar"><div class="progress-fill" style="width:${selectedStep === 0 ? 50 : 100}%"></div></div>
        </div>
        <div class="setup-content" id="setup-content">
          ${selectedStep === 0 ? renderNameStep() : renderCurrencyStep()}
        </div>
      </div>
    `;
    attachListeners();
  };

  const renderNameStep = () => `
    <div class="setup-icon">👤</div>
    <h2 class="setup-title">What's your name?</h2>
    <p class="setup-sub">This will appear on your ledger reports</p>
    <div class="form-group">
      <input type="text" id="user-name" class="input-field input-xl" placeholder="Your full name" autocomplete="name" autofocus>
    </div>
    <div class="form-group">
      <input type="text" id="business-name" class="input-field input-xl" placeholder="Business or Workspace name (optional)" autocomplete="organization">
    </div>
    <button class="btn-primary btn-large" id="step1-next">
      Next <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>
  `;

  const renderCurrencyStep = () => `
    <div class="setup-icon">💰</div>
    <h2 class="setup-title">Select your currency</h2>
    <p class="setup-sub">Used as default for all transactions</p>
    <div class="currency-search-wrap">
      <input type="text" id="currency-search" class="input-field" placeholder="🔍 Search currency..." autocomplete="off">
    </div>
    <div class="currency-list" id="currency-list">
      ${CURRENCIES.map(c => `
        <button class="currency-item ${c.code === selectedCurrency.code ? 'selected' : ''}" data-code="${c.code}">
          <span class="curr-flag">${c.flag}</span>
          <div class="curr-info">
            <span class="curr-name">${c.name}</span>
            <span class="curr-code">${c.code}</span>
          </div>
          <span class="curr-symbol">${c.symbol}</span>
          ${c.code === selectedCurrency.code ? '<span class="curr-check">✓</span>' : ''}
        </button>
      `).join('')}
    </div>
    <button class="btn-primary btn-large" id="step2-finish">
      Get Started 🚀
    </button>
  `;

  const attachListeners = () => {
    if (selectedStep === 0) {
      document.getElementById('step1-next').addEventListener('click', () => {
        const name = document.getElementById('user-name').value.trim();
        if (!name) { App.showToast('Please enter your name', 'error'); return; }
        const bizName = document.getElementById('business-name').value.trim();
        window._setupData = { name, businessName: bizName };
        selectedStep = 1;
        render();
      });
    } else {
      document.getElementById('currency-search').addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.currency-item').forEach(btn => {
          btn.style.display = btn.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
      document.querySelectorAll('.currency-item').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedCurrency = CURRENCIES.find(c => c.code === btn.dataset.code);
          document.querySelectorAll('.currency-item').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });
      document.getElementById('step2-finish').addEventListener('click', () => {
        const session = DB.getSession();
        DB.saveUser({
          name: window._setupData.name,
          businessName: window._setupData.businessName,
          phone: session?.phone || '',
          currency: selectedCurrency.code,
          currencySymbol: selectedCurrency.symbol,
        });
        DB.seedDemo();
        App.showToast('Welcome to Smart Ledger! 🎉', 'success');
        Router.navigate('dashboard');
      });
    }
  };

  render();
};
