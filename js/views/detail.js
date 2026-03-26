// Smart Ledger — Customer Detail View
const DetailView = (container, params) => {
  const { customerId } = params;
  const user = DB.getUser();
  const sym = user?.currencySymbol || '₨';

  const render = () => {
    const customer = DB.getCustomer(customerId);
    if (!customer) { Router.navigate('dashboard', {}, true); return; }

    const transactions = DB.getTransactions(customerId)
      .sort((a, b) => new Date(b.date + 'T' + (b.createdAt?.split('T')[1] || '00:00')) - new Date(a.date + 'T' + (a.createdAt?.split('T')[1] || '00:00')));

    const bal = customer.balance;
    const isOwed = bal > 0;
    const isZero = bal === 0;

    container.innerHTML = `
      <div class="screen">
        <!-- Header -->
        <div class="page-header page-header-transparent">
          <button class="back-btn" id="back-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h2 class="page-title">Ledger</h2>
          <button class="icon-btn" id="more-btn">⋮</button>
        </div>

        <!-- Customer Hero Card -->
        <div class="customer-hero ${isZero ? 'hero-zero' : isOwed ? 'hero-red' : 'hero-green'}">
          <div class="hero-avatar">${customer.name[0].toUpperCase()}</div>
          <h2 class="hero-name">${customer.name}</h2>
          ${customer.phone ? `<p class="hero-phone">${customer.phone}</p>` : ''}
          <div class="hero-balance-label">${isZero ? 'All Settled' : isOwed ? 'Gets Back' : 'Will Receive'}</div>
          <div class="hero-balance">${sym} ${formatAmount(Math.abs(bal))}</div>
          <div class="hero-actions">
            <button class="hero-action-btn" id="share-btn">
              <span>📱</span> Share
            </button>
            <button class="hero-action-btn" id="call-btn" ${!customer.phone ? 'disabled' : ''}>
              <span>📞</span> Call
            </button>
            <button class="hero-action-btn" id="edit-btn">
              <span>✏️</span> Edit
            </button>
          </div>
        </div>

        <!-- Transaction History -->
        <div class="section-header">
          <div class="section-title">Transaction History</div>
          <span class="section-count">${transactions.length} entries</span>
        </div>

        <div class="txn-list" id="txn-list">
          ${transactions.length === 0 ? renderEmptyTxn() : transactions.map(renderTxnItem).join('')}
        </div>

        <!-- Bottom padding for FAB -->
        <div style="height: 90px;"></div>

        <!-- FAB -->
        <button class="fab fab-multi" id="add-txn-fab" title="Add Transaction">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          <span>Add Entry</span>
        </button>
      </div>
    `;

    attachListeners(customer, transactions);
  };

  const renderEmptyTxn = () => `
    <div class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>No transactions yet</h3>
      <p>Tap "Add Entry" to record the first transaction</p>
    </div>
  `;

  const renderTxnItem = (t) => {
    const isCredit = t.type === 'credit';
    const date = formatDate(t.date);
    return `
      <div class="txn-item" data-id="${t.id}">
        <div class="txn-type-icon ${isCredit ? 'txn-credit' : 'txn-payment'}">
          ${isCredit ? '📤' : '📥'}
        </div>
        <div class="txn-info">
          <div class="txn-type-label">${isCredit ? 'Credit' : 'Payment'}</div>
          ${t.note ? `<div class="txn-note">${t.note}</div>` : ''}
          <div class="txn-date">${date}</div>
        </div>
        <div class="txn-amount ${isCredit ? 'txn-amount-red' : 'txn-amount-green'}">
          <span class="txn-sign">${isCredit ? '+' : '-'}</span>${sym} ${formatAmount(t.amount)}
        </div>
        <button class="txn-delete-btn" data-id="${t.id}" title="Delete">🗑️</button>
      </div>
    `;
  };

  const attachListeners = (customer, transactions) => {
    document.getElementById('back-btn').addEventListener('click', () => Router.back());

    document.getElementById('add-txn-fab').addEventListener('click', () => {
      Router.navigate('transaction', { customerId });
    });

    document.getElementById('edit-btn').addEventListener('click', () => {
      Router.navigate('customer', { customerId });
    });

    document.getElementById('share-btn').addEventListener('click', () => {
      App.shareWhatsApp(customer, transactions, sym);
    });

    if (customer.phone) {
      document.getElementById('call-btn').addEventListener('click', () => {
        window.location.href = `tel:${customer.phone}`;
      });
    }

    document.getElementById('more-btn').addEventListener('click', () => {
      showMoreMenu(customer);
    });

    document.querySelectorAll('.txn-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        App.showConfirm('Delete Entry', 'Remove this transaction entry?', () => {
          DB.deleteTransaction(btn.dataset.id);
          App.showToast('Entry deleted', 'info');
          render(); // re-render detail
        });
      });
    });
  };

  const showMoreMenu = (customer) => {
    const sheet = document.createElement('div');
    sheet.className = 'bottom-sheet-overlay';
    sheet.innerHTML = `
      <div class="bottom-sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-body">
          <button class="sheet-menu-item" id="menu-edit">✏️ Edit Customer</button>
          <button class="sheet-menu-item" id="menu-share">📱 Share on WhatsApp</button>
          <button class="sheet-menu-item" id="menu-export">📤 Export Ledger</button>
          <button class="sheet-menu-item danger" id="menu-delete">🗑️ Delete Customer</button>
        </div>
      </div>
    `;
    document.body.appendChild(sheet);
    setTimeout(() => sheet.firstElementChild.classList.add('open'), 10);

    const closeSheet = () => {
      sheet.firstElementChild.classList.remove('open');
      setTimeout(() => sheet.remove(), 300);
    };

    sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });
    sheet.querySelector('#menu-edit').addEventListener('click', () => {
      closeSheet(); Router.navigate('customer', { customerId });
    });
    sheet.querySelector('#menu-share').addEventListener('click', () => {
      closeSheet();
      const txns = DB.getTransactions(customerId).sort((a, b) => new Date(b.date) - new Date(a.date));
      App.shareWhatsApp(customer, txns, sym);
    });
    sheet.querySelector('#menu-export').addEventListener('click', () => {
      closeSheet();
      App.exportCustomer(customer, DB.getTransactions(customerId), sym);
    });
    sheet.querySelector('#menu-delete').addEventListener('click', () => {
      closeSheet();
      App.showConfirm('Delete Customer', `Delete ${customer.name} and all transactions?`, () => {
        DB.deleteCustomer(customerId);
        App.showToast('Customer deleted', 'info');
        Router.navigate('dashboard', {}, true);
      });
    });
  };

  render();
};
