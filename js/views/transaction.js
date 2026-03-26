// Smart Ledger — Add Transaction View
const TransactionView = (container, params) => {
  const { customerId } = params;
  const user = DB.getUser();
  const sym = user?.currencySymbol || '₨';
  const customer = DB.getCustomer(customerId);
  if (!customer) { Router.back(); return; }

  let selectedType = params.type || 'credit'; // 'credit' | 'payment'
  const today = new Date().toISOString().split('T')[0];

  const render = () => {
    container.innerHTML = `
      <div class="screen">
        <div class="page-header">
          <button class="back-btn" id="back-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h2 class="page-title">Add Entry</h2>
          <div></div>
        </div>

        <!-- Customer mini card -->
        <div class="mini-customer-card">
          <div class="mini-avatar">${customer.name[0].toUpperCase()}</div>
          <div>
            <div class="mini-name">${customer.name}</div>
            <div class="mini-bal ${customer.balance > 0 ? 'mini-bal-red' : customer.balance < 0 ? 'mini-bal-green' : ''}">
              Balance: ${sym} ${formatAmount(Math.abs(customer.balance))}
              ${customer.balance > 0 ? ' (owed)' : customer.balance < 0 ? ' (overpaid)' : ' (settled)'}
            </div>
          </div>
        </div>

        <!-- Type Toggle -->
        <div class="form-container">
          <div class="type-toggle" id="type-toggle">
            <button class="type-btn ${selectedType === 'credit' ? 'type-btn-active type-credit' : ''}" data-type="credit" id="credit-btn">
              <span class="type-icon">📤</span>
              <span class="type-label">Credit</span>
              <span class="type-desc">Customer owes</span>
            </button>
            <button class="type-btn ${selectedType === 'payment' ? 'type-btn-active type-payment' : ''}" data-type="payment" id="payment-btn">
              <span class="type-icon">📥</span>
              <span class="type-label">Payment</span>
              <span class="type-desc">Customer paid</span>
            </button>
          </div>

          <!-- Amount input -->
          <div class="form-group">
            <label class="form-label">Amount <span class="required">*</span></label>
            <div class="amount-input-wrap">
              <span class="amount-prefix">${sym}</span>
              <input
                type="number"
                id="txn-amount"
                class="input-field input-amount"
                placeholder="0.00"
                inputmode="decimal"
                min="0"
                step="0.01"
                autofocus
              >
            </div>
          </div>

          <!-- Note -->
          <div class="form-group">
            <label class="form-label">Note <span class="optional">(optional)</span></label>
            <input
              type="text"
              id="txn-note"
              class="input-field input-xl"
              placeholder="e.g. Grocery items, partial payment..."
              autocomplete="off"
            >
          </div>

          <!-- Date -->
          <div class="form-group">
            <label class="form-label">Date</label>
            <input
              type="date"
              id="txn-date"
              class="input-field input-xl"
              value="${today}"
            >
          </div>

          <!-- Quick note chips -->
          <div class="chips-row">
            ${['Grocery', 'Cloth', 'Electronics', 'Medicine', 'Cash', 'Full Payment', 'Partial'].map(chip => `
              <button class="chip" data-note="${chip}">${chip}</button>
            `).join('')}
          </div>

          <div class="form-actions">
            <button class="btn-primary btn-large btn-block ${selectedType === 'credit' ? 'btn-red' : 'btn-green'}" id="save-txn-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              Save ${selectedType === 'credit' ? 'Credit' : 'Payment'} Entry
            </button>
          </div>
        </div>
      </div>
    `;
    attachListeners();
  };

  const attachListeners = () => {
    document.getElementById('back-btn').addEventListener('click', () => Router.back());

    // Type toggle
    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedType = btn.dataset.type;
        render();
      });
    });

    // Quick note chips
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const noteInput = document.getElementById('txn-note');
        noteInput.value = chip.dataset.note;
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('chip-selected'));
        chip.classList.add('chip-selected');
      });
    });

    document.getElementById('save-txn-btn').addEventListener('click', () => {
      const amountStr = document.getElementById('txn-amount').value;
      const amount = parseFloat(amountStr);

      if (!amountStr || isNaN(amount) || amount <= 0) {
        App.showToast('Please enter a valid amount', 'error');
        return;
      }

      const note = document.getElementById('txn-note').value.trim();
      const date = document.getElementById('txn-date').value || today;

      const btn = document.getElementById('save-txn-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Saving...';

      DB.addTransaction({
        customerId,
        type: selectedType,
        amount,
        note,
        date,
        currency: user?.currency || 'PKR',
      });

      App.showToast(selectedType === 'credit' ? '📤 Credit added!' : '📥 Payment recorded!', 'success');
      Router.navigate('detail', { customerId }, true);
    });
  };

  render();
};
