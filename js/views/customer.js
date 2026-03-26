// Smart Ledger — Add/Edit Customer View
const CustomerView = (container, params) => {
  const existingCustomer = params.customerId ? DB.getCustomer(params.customerId) : null;
  const isEdit = !!existingCustomer;

  const render = () => {
    container.innerHTML = `
      <div class="screen">
        <div class="page-header">
          <button class="back-btn" id="back-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h2 class="page-title">${isEdit ? 'Edit Customer' : 'New Customer'}</h2>
          ${isEdit ? `<button class="icon-btn icon-btn-danger" id="delete-customer-btn" title="Delete">🗑️</button>` : '<div></div>'}
        </div>

        <div class="form-container">
          <div class="form-section">
            <div class="form-section-title">Customer Details</div>

            <div class="form-group">
              <label class="form-label">Full Name <span class="required">*</span></label>
              <input
                type="text"
                id="cust-name"
                class="input-field input-xl"
                placeholder="e.g. Ahmed Khan"
                value="${existingCustomer?.name || ''}"
                autocomplete="name"
                autofocus
              >
            </div>

            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input
                type="tel"
                id="cust-phone"
                class="input-field input-xl"
                placeholder="e.g. +923001234567"
                value="${existingCustomer?.phone || ''}"
                autocomplete="tel"
                inputmode="tel"
              >
            </div>

            <div class="form-group">
              <label class="form-label">Address <span class="optional">(optional)</span></label>
              <textarea
                id="cust-address"
                class="input-field textarea-field"
                placeholder="Address or area"
                rows="3"
              >${existingCustomer?.address || ''}</textarea>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-primary btn-large btn-block" id="save-customer-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              ${isEdit ? 'Save Changes' : 'Add Customer'}
            </button>
            <button class="btn-ghost btn-block" id="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    `;
    attachListeners();
  };

  const attachListeners = () => {
    document.getElementById('back-btn').addEventListener('click', () => Router.back());
    document.getElementById('cancel-btn').addEventListener('click', () => Router.back());

    document.getElementById('save-customer-btn').addEventListener('click', () => {
      const name = document.getElementById('cust-name').value.trim();
      if (!name) { App.showToast('Please enter customer name', 'error'); return; }
      const phone = document.getElementById('cust-phone').value.trim();
      const address = document.getElementById('cust-address').value.trim();

      const customer = {
        ...(existingCustomer || {}),
        name, phone, address
      };

      DB.saveCustomer(customer);
      App.showToast(isEdit ? 'Customer updated!' : 'Customer added! 👤', 'success');

      if (isEdit) {
        Router.back();
      } else {
        const all = DB.getCustomers();
        const newCust = all[all.length - 1];
        Router.navigate('detail', { customerId: newCust.id }, true);
      }
    });

    if (isEdit) {
      document.getElementById('delete-customer-btn').addEventListener('click', () => {
        App.showConfirm(
          'Delete Customer',
          `Delete ${existingCustomer.name} and all their transactions? This cannot be undone.`,
          () => {
            DB.deleteCustomer(existingCustomer.id);
            App.showToast('Customer deleted', 'info');
            Router.navigate('dashboard', {}, true);
          }
        );
      });
    }
  };

  render();
};
