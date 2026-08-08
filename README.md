# 💊 PillSync - Intelligent Medicine Reminder and Medication Tracking Platform

## 📖 Project Description

PillSync is a comprehensive healthcare platform that assists users in managing their medicine schedules, monitoring dosage adherence, predicting refill requirements, and maintaining medication history using AI-powered tracking and smart notifications.

---

## ❗ Problem Statement

Non-adherence to medication schedules is a critical issue in healthcare, often leading to severe health complications. PillSync mitigates this by providing an intelligent, automated solution for personal healthcare management, family medication tracking, and caregiver monitoring.

---

## 🎯 Project Objectives

- Provide secure authentication and role-based access control (Patient, Caregiver, Admin).
- Build medicine upload and intelligent medication scheduling workflows.
- Integrate OCR-based medicine recognition for prescriptions.
- Implement AI-powered refill prediction and low-stock alert mechanisms.
- Deliver real-time push, email, and SMS notifications for medication reminders.
- Deploy a production-ready application using Docker and modern cloud practices.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management / API**: Context API / Axios
- **UI Components**: React Hook Form, Custom Premium Design System

### Backend
- **Framework**: FastAPI (Python)
- **Database ORM**: SQLAlchemy
- **Authentication**: JWT & OAuth2
- **Validation**: Pydantic
- **Background Tasks**: APScheduler (cron jobs)

### Database
- **Engine**: PostgreSQL 15

### AI & Integrations
- **OCR Engine**: Tesseract OCR
- **Notifications**: Firebase Cloud Messaging (FCM), Twilio SMS, Email

### Deployment
- **Containerization**: Docker & Docker Compose

---

## 🚀 Running the Project (Docker)

To run the complete PillSync stack locally using Docker:

1. Clone the repository and navigate to the root directory.
2. Ensure you have Docker and Docker Compose installed.
3. Run the following command:

```bash
docker-compose up --build -d
```

4. The platform will be available at:
   - **Frontend**: http://localhost:5173 (or port 80 depending on Docker setup)
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs

---

## 🔮 Core Features Implemented (Milestones 1-3)

### Milestone 1: Authentication & Profiles
- JWT Authentication & OAuth2 Login
- Role Management (Patient, Caregiver, Admin)
- Full User Profile & Settings Management

### Milestone 2: Medication & Reminders
- Complete Medicine CRUD (Add, Edit, View, Delete)
- Dosage Scheduling (Morning, Afternoon, Night, Custom)
- Reminder System with Push Notifications
- Medication History Tracking (Taken, Missed, Snoozed)
- Analytics Dashboard with Adherence Reports

### Milestone 3: AI & OCR
- OCR Medicine Recognition (Image to Data)
- AI Refill Prediction Engine
- Low Stock Alerts & Caregiver Notifications
- Advanced Prediction Dashboard

---

## 👩‍💻 Author

**Name:** Mounika  
**Project:** PillSync - Intelligent Medicine Reminder and Medication Tracking Platform