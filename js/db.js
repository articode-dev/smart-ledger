// Smart Ledger — Data Layer (localStorage)
// Backend-ready: replace localStorage calls with API calls per method

const DB = (() => {
  const KEYS = {
    USER: 'sl_user',
    CUSTOMERS: 'sl_customers',
    TRANSACTIONS: 'sl_transactions',
    SESSION: 'sl_session',
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const uuid = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  const read = key => { try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; } };
  const write = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  // ── Session ───────────────────────────────────────────────────────────────
  const getSession = () => read(KEYS.SESSION);
  const setSession = (data) => write(KEYS.SESSION, data);
  const clearSession = () => localStorage.removeItem(KEYS.SESSION);

  // ── User ──────────────────────────────────────────────────────────────────
  const getUser = () => read(KEYS.USER);
  const saveUser = (user) => {
    const existing = getUser();
    const updated = { ...existing, ...user, id: existing?.id || uuid(), updatedAt: new Date().toISOString() };
    write(KEYS.USER, updated);
    return updated;
  };

  // ── Customers ─────────────────────────────────────────────────────────────
  const getCustomers = () => read(KEYS.CUSTOMERS) || [];
  const getCustomer = (id) => getCustomers().find(c => c.id === id) || null;

  const saveCustomer = (customer) => {
    const customers = getCustomers();
    const existing = customers.find(c => c.id === customer.id);
    if (existing) {
      const idx = customers.indexOf(existing);
      customers[idx] = { ...existing, ...customer, updatedAt: new Date().toISOString() };
    } else {
      customers.push({
        id: uuid(),
        balance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...customer
      });
    }
    write(KEYS.CUSTOMERS, customers);
    return customer.id ? customers.find(c => c.id === customer.id) : customers[customers.length - 1];
  };

  const deleteCustomer = (id) => {
    const customers = getCustomers().filter(c => c.id !== id);
    write(KEYS.CUSTOMERS, customers);
    // Also delete all transactions for this customer
    const txns = getTransactions().filter(t => t.customerId !== id);
    write(KEYS.TRANSACTIONS, txns);
  };

  // ── Transactions ──────────────────────────────────────────────────────────
  const getTransactions = (customerId) => {
    const all = read(KEYS.TRANSACTIONS) || [];
    return customerId ? all.filter(t => t.customerId === customerId) : all;
  };

  const addTransaction = (txn) => {
    const all = read(KEYS.TRANSACTIONS) || [];
    const newTxn = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      ...txn,
      date: txn.date || new Date().toISOString().split('T')[0]
    };
    all.push(newTxn);
    write(KEYS.TRANSACTIONS, all);
    recalculateBalance(txn.customerId);
    return newTxn;
  };

  const deleteTransaction = (txnId) => {
    const all = read(KEYS.TRANSACTIONS) || [];
    const txn = all.find(t => t.id === txnId);
    const filtered = all.filter(t => t.id !== txnId);
    write(KEYS.TRANSACTIONS, filtered);
    if (txn) recalculateBalance(txn.customerId);
  };

  // ── Balance Calculation ───────────────────────────────────────────────────
  // Credit = customer OWES (positive balance = you are owed money)
  // Payment = customer PAID (reduces balance)
  const recalculateBalance = (customerId) => {
    const txns = getTransactions(customerId);
    const balance = txns.reduce((acc, t) => {
      return acc + (t.type === 'credit' ? Number(t.amount) : -Number(t.amount));
    }, 0);
    const customers = getCustomers();
    const idx = customers.findIndex(c => c.id === customerId);
    if (idx !== -1) {
      customers[idx].balance = Math.round(balance * 100) / 100;
      write(KEYS.CUSTOMERS, customers);
    }
    return balance;
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const getStats = () => {
    const customers = getCustomers();
    const totalReceivable = customers.reduce((acc, c) => acc + Math.max(0, c.balance), 0);
    const totalOverpaid = customers.reduce((acc, c) => acc + Math.min(0, c.balance), 0);
    return {
      totalCustomers: customers.length,
      totalReceivable: Math.round(totalReceivable * 100) / 100,
      totalOverpaid: Math.round(Math.abs(totalOverpaid) * 100) / 100,
    };
  };

  // ── Seed Demo Data ────────────────────────────────────────────────────────
  const seedDemo = () => {
    if (getCustomers().length > 0) return;
    const c1 = saveCustomer({ name: 'Ahmed Khan', phone: '+923001234567', address: 'Shop 12, Allama Iqbal Road' });
    const c2 = saveCustomer({ name: 'Priya Sharma', phone: '+919876543210', address: 'Block B, Sector 5' });
    const c3 = saveCustomer({ name: 'Mohammed Ali', phone: '+971501234567', address: 'Al Barsha, Dubai' });
    // Re-read since saveCustomer returns stale data on first save
    const [a, b, c] = getCustomers();
    if (a) {
      addTransaction({ customerId: a.id, type: 'credit', amount: 5000, note: 'Grocery items', date: '2026-03-20' });
      addTransaction({ customerId: a.id, type: 'payment', amount: 2000, note: 'Partial payment', date: '2026-03-22' });
    }
    if (b) {
      addTransaction({ customerId: b.id, type: 'credit', amount: 1500, note: 'Cloth purchase', date: '2026-03-18' });
      addTransaction({ customerId: b.id, type: 'payment', amount: 1500, note: 'Full payment', date: '2026-03-24' });
      addTransaction({ customerId: b.id, type: 'credit', amount: 800, note: 'New order', date: '2026-03-25' });
    }
    if (c) {
      addTransaction({ customerId: c.id, type: 'credit', amount: 10000, note: 'Monthly account', date: '2026-03-01' });
    }
  };

  return {
    uuid, getSession, setSession, clearSession,
    getUser, saveUser,
    getCustomers, getCustomer, saveCustomer, deleteCustomer,
    getTransactions, addTransaction, deleteTransaction,
    recalculateBalance, getStats, seedDemo
  };
})();
