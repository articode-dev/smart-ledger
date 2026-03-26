// Smart Ledger — Dashboard View
const DashboardView = (container, params) => {
  const user = DB.getUser();
  const sym = user?.currencySymbol || '₨';
  let searchQuery = '';
  let sortMode = 'balance'; // 'balance' | 'name' | 'recent'

  const getFilteredCustomers = () => {
    let customers = DB.getCustomers();
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
      );
    }
    if (sortMode === 'balance') customers.sort((a, b) => b.balance - a.balance);
    else if (sortMode === 'name') customers.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortMode === 'recent') customers.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return customers;
  };

  const render = () => {
    const stats = DB.getStats();
    const customers = getFilteredCustomers();

    container.innerHTML = `
      <div class="screen">
        <!-- Top Bar -->
        <div class="topbar">
          <div class="topbar-left">
            <div class="user-avatar" id="avatar-btn">${(user?.name || 'U')[0].toUpperCase()}</div>
            <div>
              <div class="topbar-title">${user?.businessName || user?.name || 'My Shop'}</div>
              <div class="topbar-sub">${user?.currency || 'PKR'} · Smart Ledger</div>
            </div>
          </div>
          <button class="icon-btn" id="settings-btn" title="Settings">⚙️</button>
        </div>

        <!-- Summary Card -->
        <div class="summary-card">
          <div class="summary-label">Total Receivable</div>
          <div class="summary-amount ${stats.totalReceivable > 0 ? 'amount-red' : 'amount-green'}">${sym} ${formatAmount(stats.totalReceivable)}</div>
          <div class="summary-meta">
            <span class="meta-chip">${stats.totalCustomers} customers</span>
            ${stats.totalOverpaid > 0 ? `<span class="meta-chip overpaid">Overpaid: ${sym} ${formatAmount(stats.totalOverpaid)}</span>` : ''}
          </div>
        </div>

        <!-- Search + Sort -->
        <div class="search-bar-wrap">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input
              type="search"
              id="search-input"
              class="search-input"
              placeholder="Search customers..."
              value="${searchQuery}"
              autocomplete="off"
            >
          </div>
          <select class="sort-select" id="sort-select">
            <option value="balance" ${sortMode === 'balance' ? 'selected' : ''}>By Balance</option>
            <option value="name" ${sortMode === 'name' ? 'selected' : ''}>By Name</option>
            <option value="recent" ${sortMode === 'recent' ? 'selected' : ''}>Recent</option>
          </select>
        </div>

        <!-- Customer List -->
        <div class="customer-list" id="customer-list">
          ${customers.length === 0 ? renderEmpty() : customers.map(renderCustomerCard).join('')}
        </div>

        <!-- FAB -->
        <button class="fab" id="add-customer-fab" title="Add Customer">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    `;

    attachListeners();
  };

  const renderEmpty = () => `
    <div class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>${searchQuery ? 'No customers found' : 'No customers yet'}</h3>
      <p>${searchQuery ? 'Try a different search term' : 'Tap + to add your first customer'}</p>
    </div>
  `;

  const renderCustomerCard = (c) => {
    const bal = c.balance;
    const isOwed = bal > 0;
    const isZero = bal === 0;
    const txnCount = DB.getTransactions(c.id).length;
    return `
      <div class="customer-card" data-id="${c.id}" role="button" tabindex="0">
        <div class="customer-avatar">${c.name[0].toUpperCase()}</div>
        <div class="customer-info">
          <div class="customer-name">${c.name}</div>
          <div class="customer-meta">${c.phone || ''} · ${txnCount} transaction${txnCount !== 1 ? 's' : ''}</div>
        </div>
        <div class="customer-balance ${isZero ? 'balance-zero' : isOwed ? 'balance-red' : 'balance-green'}">
          <div class="balance-amount">${sym} ${formatAmount(Math.abs(bal))}</div>
          <div class="balance-label">${isZero ? 'Settled' : isOwed ? 'Owed' : 'Overpaid'}</div>
        </div>
      </div>
    `;
  };

  const attachListeners = () => {
    document.getElementById('search-input').addEventListener('input', e => {
      searchQuery = e.target.value;
      refreshList();
    });

    document.getElementById('sort-select').addEventListener('change', e => {
      sortMode = e.target.value;
      refreshList();
    });

    document.querySelectorAll('.customer-card').forEach(card => {
      card.addEventListener('click', () => Router.navigate('detail', { customerId: card.dataset.id }));
      card.addEventListener('keydown', e => { if (e.key === 'Enter') card.click(); });
    });

    document.getElementById('add-customer-fab').addEventListener('click', () => Router.navigate('customer'));

    document.getElementById('settings-btn').addEventListener('click', () => showSettingsSheet());
    document.getElementById('avatar-btn').addEventListener('click', () => showSettingsSheet());
  };

  const refreshList = () => {
    const customers = getFilteredCustomers();
    const list = document.getElementById('customer-list');
    list.innerHTML = customers.length === 0 ? renderEmpty() : customers.map(renderCustomerCard).join('');
    list.querySelectorAll('.customer-card').forEach(card => {
      card.addEventListener('click', () => Router.navigate('detail', { customerId: card.dataset.id }));
    });
  };

  const showSettingsSheet = () => {
    const user = DB.getUser();
    const sheet = document.createElement('div');
    sheet.className = 'bottom-sheet-overlay';
    sheet.innerHTML = `
      <div class="bottom-sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <h3>Settings</h3>
          <button class="sheet-close" id="close-settings">✕</button>
        </div>
        <div class="sheet-body">
          <div class="settings-item">
            <span class="settings-icon">👤</span>
            <div>
              <div class="settings-label">Name</div>
              <div class="settings-value">${user?.name || '-'}</div>
            </div>
          </div>
          <div class="settings-item">
            <span class="settings-icon">📱</span>
            <div>
              <div class="settings-label">Phone</div>
              <div class="settings-value">${user?.phone || '-'}</div>
            </div>
          </div>
          <div class="settings-item">
            <span class="settings-icon">💱</span>
            <div>
              <div class="settings-label">Currency</div>
              <div class="settings-value">${user?.currency || 'PKR'}</div>
            </div>
          </div>
          <button class="btn-outline btn-block mt-2" id="export-btn">📤 Export All Data</button>
          <button class="btn-danger btn-block mt-1" id="logout-btn">🚪 Sign Out</button>
        </div>
      </div>
    `;
    document.body.appendChild(sheet);
    setTimeout(() => sheet.firstElementChild.classList.add('open'), 10);

    const closeSheet = () => {
      sheet.firstElementChild.classList.remove('open');
      setTimeout(() => sheet.remove(), 300);
    };
    sheet.querySelector('#close-settings').addEventListener('click', closeSheet);
    sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });
    sheet.querySelector('#logout-btn').addEventListener('click', () => {
      closeSheet();
      Auth.logout();
      Router.navigate('login');
    });
    sheet.querySelector('#export-btn').addEventListener('click', () => {
      App.exportData();
      closeSheet();
    });
  };

  render();
};
