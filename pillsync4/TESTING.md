# PillSync — Testing & Validation Checklist

This document covers the manual testing steps for the PillSync college demonstration project.
Milestone 3 and Milestone 4 features are both covered here.

## How to run

### Frontend
```bash
npm install
npm run dev      # dev server
npm run build    # production build (verify it compiles)
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> The frontend works even without the backend running — it falls back to localStorage.
> OCR requires the backend (pytesseract + Tesseract engine installed on the OS).

## Validation checklist

### Authentication
- [ ] Register with name, email, password — redirects to Dashboard
- [ ] Register with an existing email — shows "Email already registered"
- [ ] Login with correct credentials — redirects to Dashboard
- [ ] Login with wrong password — shows error message
- [ ] Continue as Guest — creates a guest user, redirects to Dashboard
- [ ] Sign out — returns to Login page
- [ ] Protected pages redirect to Login when not signed in

### Medicine Management
- [ ] Add a medicine with all fields — appears in the list
- [ ] Edit a medicine — changes are saved
- [ ] Delete a medicine — removed from list, its history is also removed
- [ ] Set dosage, frequency, times of day (Morning/Afternoon/Night)
- [ ] Set reminder time
- [ ] Set start and end dates
- [ ] Set current stock
- [ ] Add notes

### OCR
- [ ] Upload a medicine label image in the Add form
- [ ] OCR extracts name, dosage, quantity (when backend is running)
- [ ] Extracted values auto-fill the form
- [ ] User can edit the auto-filled values before saving
- [ ] If OCR fails or backend is offline, user can still fill manually

### Reminders
- [ ] Set a reminder time on a medicine
- [ ] Browser notification permission is requested once
- [ ] "Trigger Now" button on medicine card shows a browser notification
- [ ] "Trigger" button on Dashboard upcoming reminder shows notification
- [ ] Notification displays medicine name, dosage, and time
- [ ] Background checker runs every minute (verified via ReminderWatcher)

### Medication History
- [ ] Mark a medicine as Taken — history record created
- [ ] Mark a medicine as Missed — history record created
- [ ] History page shows medicine, date, time, status
- [ ] Filter by All / Taken / Missed works
- [ ] Filter by Today / Last 7 Days / All Time works
- [ ] Summary cards (Total, Taken, Missed, Adherence) update correctly
- [ ] Delete a history record

### Adherence Analytics
- [ ] Adherence % = Taken / (Taken + Missed) × 100
- [ ] Adherence updates after marking Taken or Missed
- [ ] Adherence visualization shows circular progress + breakdown bars
- [ ] Taken / Missed / Total counts are correct
- [ ] 7-day trend shows bars when data exists
- [ ] 7-day trend shows "Not enough historical data yet" when empty

### Refill Prediction
- [ ] Remaining days = Current Stock / Daily Consumption
- [ ] Status "Normal" when remaining > 5
- [ ] Status "Refill Soon" when remaining <= 5
- [ ] Status "Out of Stock" when stock = 0
- [ ] Refill visualization shows per-medicine cards with progress bars
- [ ] Refill overview shows totals (sufficient, requiring refill, out of stock, avg days)
- [ ] Stock decreases by 1 when a dose is marked Taken (local mode)

### Low Stock
- [ ] Medicines with stock < 5 show "Low Stock" badge
- [ ] Low stock medicines highlighted on medicine card
- [ ] Low stock list appears on Dashboard and Analytics

### Dashboard Analytics (Milestone 4)
- [ ] Total Medicines card matches medicine count
- [ ] Active Medicines card matches medicines with times or reminders
- [ ] Doses Taken / Doses Missed match history records
- [ ] Overall Adherence matches calculated percentage
- [ ] Low on Stock / Requiring Refill / Out of Stock counts are correct
- [ ] Upcoming Reminders count matches medicines with reminder times
- [ ] Adherence overview bar shows taken vs missed proportion
- [ ] All numbers update after adding/editing/deleting medicines or marking doses

### Data Validation & Empty States
- [ ] No medicines — dashboard shows 0, empty states display correctly
- [ ] No history — adherence shows 0%, "Not enough data" message
- [ ] No reminders — "No upcoming reminders" message
- [ ] Stock = 0 — "Out of Stock" status, no division errors
- [ ] No times selected — daily consumption defaults to 1
- [ ] No NaN, undefined, null, Infinity, or negative percentages shown anywhere

### Build & Runtime
- [ ] `npm run build` completes with no errors
- [ ] No console errors on any page
- [ ] No broken routes
- [ ] No missing imports
- [ ] Backend starts with `uvicorn main:app` without errors
- [ ] TinyDB JSON files persist data after restart
