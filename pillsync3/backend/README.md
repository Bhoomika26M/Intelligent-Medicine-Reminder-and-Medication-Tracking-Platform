# PillSync Backend (FastAPI + TinyDB)

Local backend for the PillSync demo. Run it with Python.

## Setup

```bash
cd backend
pip install -r requirements.txt

# pytesseract also needs the Tesseract OCR engine installed on your OS:
#   Ubuntu/Debian:  sudo apt install tesseract-ocr
#   macOS (brew):   brew install tesseract
#   Windows:        https://github.com/UB-Mannheim/tesseract/wiki

uvicorn main:app --reload --port 8000
```

The API runs at `http://localhost:8000`. All data is stored as JSON files inside `backend/data/`.

## Collections

- **Users** – registered + guest accounts (passwords hashed with bcrypt)
- **Medicines** – one record per medicine, owned by a user
- **MedicationHistory** – Taken / Missed records
- **Reminders** – derived from each medicine's reminder time

## Auth

JWT is signed server-side and returned to the client, which stores it in `localStorage`. Guest login creates a throwaway account with no password.

## Notes

This backend is for a college demonstration only. It is intentionally simple and not production-hardened.
