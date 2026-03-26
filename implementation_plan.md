# Smart Ledger — Mobile-First Digital Khata App

A fully offline-capable, mobile-first ledger application for small businesses built with HTML, CSS, and vanilla JavaScript using localStorage.

## Proposed Changes

### Architecture

Single-page application (SPA) with view-based routing:
- All state in `localStorage` with a clean data access layer
- No backend — offline-first, backend-ready structure
- Pure HTML/CSS/JS — no dependencies, fast load on low-end devices

---

### File Structure

```
project/
├── index.html          — App shell, all views rendered here
├── css/
│   └── app.css         — Full design system + component styles
└── js/
    ├── db.js           — localStorage data layer (Users, Customers, Transactions)
    ├── auth.js         — OTP simulation and session management
    ├── router.js       — View routing system
    ├── views/
    │   ├── login.js    — Phone + OTP login screen
    │   ├── setup.js    — First-time user setup (name, country, currency)
    │   ├── dashboard.js— Main dashboard (totals, search, customer list)
    │   ├── customer.js — Add/edit customer form
    │   ├── detail.js   — Customer detail + transaction history
    │   └── transaction.js — Add transaction form
    └── app.js          — App init, global utilities (WhatsApp share, export)
```

---

### Views

#### [NEW] index.html
App shell with all view containers and icon assets.

#### [NEW] css/app.css
- CSS variables for colors, typography, spacing
- Dark/light mode aware
- Mobile-first breakpoints
- Glass morphism cards
- Animated transitions between views
- Large touch targets (min 48px)
- Color system: Red for credit/owed, Green for payment/settled

#### [NEW] js/db.js
Data layer with methods:
- `DB.getUser()`, `DB.saveUser()`
- `DB.getCustomers()`, `DB.saveCustomer()`, `DB.deleteCustomer()`
- `DB.getTransactions(customerId)`, `DB.addTransaction()`, `DB.deleteTransaction()`
- `DB.recalculateBalance(customerId)`

#### [NEW] js/auth.js
- Simulated OTP (shows in UI for demo — backend-ready interface)
- Session stored in localStorage
- International phone format validation

#### [NEW] js/router.js
- Hash-based routing `#dashboard`, `#customer/:id`, etc.
- View stack with back navigation
- Page transition animations

#### [NEW] js/views/login.js
- Phone number input with country code picker
- OTP input with auto-advance digits
- Smooth animated entry

#### [NEW] js/views/setup.js
- Name input
- Country selector (with flag emojis)
- Currency selector (USD, PKR, INR, AED, EUR, GBP, BDT, NPR, LKR, NGN, KES, etc.)

#### [NEW] js/views/dashboard.js
- Summary card: Total receivable highlighted
- Search bar (filters by name/phone)
- Sorted customer list (by balance desc)
- FAB button to add customer

#### [NEW] js/views/customer.js
- Add/edit customer form (name, phone, address)

#### [NEW] js/views/detail.js
- Customer header with balance
- Transaction history (chronological, color-coded)
- FAB to add transaction
- Share via WhatsApp button
- Edit/delete customer

#### [NEW] js/views/transaction.js
- Credit / Payment toggle (large, tap-friendly)
- Amount input (numeric keyboard)
- Date picker (defaults today)
- Note textarea
- Currency display (from user settings)

#### [NEW] js/app.js
- WhatsApp share text generator
- CSV/text export
- Reminder logic (localStorage timestamps)
- App initialization

## Verification Plan

### Manual Verification
- Complete user flow: signup → add customer → add transaction → view balance
- Balance math: credit increases, payment decreases
- Search functionality
- WhatsApp share text generation
- Currency formatting
- Data persistence after page refresh
