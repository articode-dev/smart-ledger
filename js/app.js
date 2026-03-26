// Smart Ledger — App Core (utilities + init)

// ── Global Utilities ─────────────────────────────────────────────────────────
const formatAmount = (n) => {
  const num = Number(n) || 0;
  if (num >= 1e7) return (num / 1e7).toFixed(2) + ' Cr';
  if (num >= 1e5) return (num / 1e5).toFixed(2) + ' L';
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── App Module ────────────────────────────────────────────────────────────────
const App = (() => {
  // Toast notifications
  const showToast = (msg, type = 'info') => {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-visible'), 10);
    setTimeout(() => {
      toast.classList.remove('toast-visible');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Confirm dialog
  const showConfirm = (title, message, onConfirm) => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-dialog">
        <h3 class="confirm-title">${title}</h3>
        <p class="confirm-msg">${message}</p>
        <div class="confirm-actions">
          <button class="btn-ghost" id="confirm-cancel">Cancel</button>
          <button class="btn-danger" id="confirm-ok">Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('visible'), 10);

    const close = () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 200);
    };

    overlay.querySelector('#confirm-cancel').addEventListener('click', close);
    overlay.querySelector('#confirm-ok').addEventListener('click', () => {
      close();
      onConfirm();
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  };

  // WhatsApp Share
  const shareWhatsApp = (customer, transactions, sym) => {
    const bal = customer.balance;
    const isOwed = bal > 0;

    let text = `*Smart Ledger - ${customer.name}*\n`;
    text += `📅 Date: ${formatDate(new Date().toISOString().split('T')[0])}\n`;
    if (customer.phone) text += `📱 Phone: ${customer.phone}\n`;
    text += `\n*Balance: ${sym} ${formatAmount(Math.abs(bal))} ${isOwed ? '(Owed by customer)' : bal === 0 ? '(Settled)' : '(Overpaid)'}*\n`;
    text += `\n*Recent Transactions:*\n`;

    const recent = transactions.slice(0, 10);
    recent.forEach(t => {
      const sign = t.type === 'credit' ? '+' : '-';
      text += `${sign}${sym}${formatAmount(t.amount)} — ${t.note || (t.type === 'credit' ? 'Credit' : 'Payment')} — ${formatDate(t.date)}\n`;
    });

    if (transactions.length > 10) text += `...and ${transactions.length - 10} more entries\n`;
    text += `\n_Sent via Smart Ledger_`;

    const encoded = encodeURIComponent(text);
    const url = customer.phone
      ? `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(url, '_blank');
  };

  // Export customer data as CSV
  const exportCustomer = (customer, transactions, sym) => {
    let csv = 'Date,Type,Amount,Currency,Note\n';
    transactions.forEach(t => {
      csv += `"${t.date}","${t.type === 'credit' ? 'Credit' : 'Payment'}","${t.amount}","${t.currency || ''}","${(t.note || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customer.name.replace(/\s+/g, '_')}_ledger.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Ledger exported! 📤', 'success');
  };

  // Export all data
  const exportData = () => {
    const user = DB.getUser();
    const customers = DB.getCustomers();
    const sym = user?.currencySymbol || '₨';

    let csv = 'Customer,Phone,Balance,Date,Type,Amount,Note\n';
    customers.forEach(c => {
      const txns = DB.getTransactions(c.id);
      if (txns.length === 0) {
        csv += `"${c.name}","${c.phone || ''}","${c.balance}","","","",""\n`;
      } else {
        txns.forEach(t => {
          csv += `"${c.name}","${c.phone || ''}","${c.balance}","${t.date}","${t.type}","${t.amount}","${(t.note || '').replace(/"/g, '""')}"\n`;
        });
      }
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Smart_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported! 📤', 'success');
  };

  // ── Init ──────────────────────────────────────────────────────────────────
  const init = () => {
    // Register all views
    Router.register('login', LoginView);
    Router.register('setup', SetupView);
    Router.register('dashboard', DashboardView);
    Router.register('customer', CustomerView);
    Router.register('detail', DetailView);
    Router.register('transaction', TransactionView);

    // Decide starting view
    if (Auth.isLoggedIn()) {
      Router.navigate('dashboard', {}, true);
    } else {
      Router.navigate('login', {}, true);
    }
  };

  return { showToast, showConfirm, shareWhatsApp, exportCustomer, exportData, init };
})();

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', App.init);
