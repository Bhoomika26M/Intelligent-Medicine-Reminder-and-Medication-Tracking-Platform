# 💊 PillSync
## Intelligent Medicine Reminder and Medication Tracking Platform

### 📌 Overview

PillSync is an intelligent medicine reminder and medication tracking platform designed to help users manage their medicines, schedules, reminders, medication history, and adherence in one place.
The system combines a user-friendly React frontend with a Django REST Framework backend and PostgreSQL database, along with AI-powered features for prescription processing, medicine validation,
and refill prediction.

### 🎯 Objectives

- Simplify medicine and dosage management.
- Provide timely reminders for scheduled medicines.
- Track Taken and Missed doses.
- Monitor medicine quantity and refill requirements.
- Maintain medication history and adherence information.
- Assist users in extracting medicine details from prescriptions.
- Support caregivers in managing patient medications.
- Provide intelligent and secure medication management.

###  Key Features

-  User registration, login and JWT authentication
-  User profile and account management
-  Add, edit, view and delete medicines
-  Dosage, frequency and quantity management
-  Medicine schedules and reminders
-  Taken and Missed dose tracking
-  Automatic medicine quantity tracking
-  Medication history
-  Email medicine reminders and notifications
-  Prescription upload and OCR-based medicine extraction
-  AI-based medicine and disease validation
-  Refill prediction and medicine availability tracking
-  Caregiver and patient management
-  Dashboard and medication analytics
-  Calendar-based medication tracking
-  Notification management
-  Change password and forgot-password functionality

###  AI-Powered Features

PillSync integrates Google Gemini to provide intelligent healthcare-support features such as:

- Medicine name validation
- Disease and medical-condition validation
- Prescription image analysis
- Medicine name and dosage extraction
- Strength, frequency, duration and timing extraction
- AI-assisted prescription processing
- Refill prediction support

### 🛠️ Technology Stack

**Frontend:** React, Vite, JavaScript, HTML, CSS

**Backend:** Python, Django, Django REST Framework

**Database:** PostgreSQL

**Authentication:** JWT

**AI:** Google Gemini API and Gemini Vision

**Notifications:** Email / SMTP

### 📦 Project Modules

- Authentication & User Management
- Medicine Management
- Medicine Scheduling & Reminders
- Medication History
- Prescription Upload & OCR
- AI Medicine & Disease Validation
- Refill Prediction
- Caregiver Management
- Dashboard & Analytics
- Calendar
- Notifications
- Profile & Settings

### 📁 Project Structure

```text
PillSync/
│
├── backend/
│   ├── config/
│   ├── medication/
│   ├── users/
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md

## Security
Sensitive credentials such as the Django secret key, database password, email credentials and Gemini API key are stored using environment variables.
 The .env file is excluded from Git using .gitignore and is never committed to the repository.

## Project Outcome
PillSync provides a centralized platform for intelligent medication management, helping users organize their medicines, receive timely reminders, track adherence, monitor medicine availability,
 process prescriptions, and manage medication information efficiently.
