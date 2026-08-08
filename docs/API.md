# MCC Management Platform — API Specification

Detailed REST API specification for Microsoft Campus Club (MCC) Management Platform serverless backend running on **Azure Functions**.

## Base URL
`https://<app-name>.azurewebsites.net/api` or `/.auth` for SWA Auth.

---

## 1. Authentication Endpoints (§11 - §17)

### `POST /api/auth/register`
Creates a new MCC Student Account.
- **Request Body**:
  ```json
  {
    "fullName": "Rahul Sharma",
    "email": "student@marwadiuniversity.ac.in",
    "enrollmentNumber": "92100103045",
    "college": "Marwadi University",
    "department": "Computer Engineering",
    "year": "3rd Year",
    "division": "A",
    "phone": "+91 9876543210",
    "password": "Password123!"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "studentId": "MCC-2026-00042",
      "userId": "usr_1723145600",
      "email": "student@marwadiuniversity.ac.in",
      "status": "active"
    },
    "message": "Account created successfully!"
  }
  ```

### `POST /api/auth/login`
Authenticates a student using MCC Student ID or Email.
- **Request Body**:
  ```json
  {
    "identifier": "MCC-2026-00042",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK`

---

## 2. Events & Registrations Endpoints (§29, §31, §33)

### `GET /api/events`
Returns list of all active and upcoming club events.

### `POST /api/registrations/submit`
Submits a dynamic registration form payload for an event. Automatically calculates remaining capacity and waitlist placement. Generates secure verification token for QR pass.

---

## 3. Attendance Verification Endpoints (§33, §34)

### `POST /api/attendance/scan`
Server-side QR verification & duplicate check endpoint.
- **Request Body**:
  ```json
  {
    "eventId": "evt_azure_bootcamp_2026",
    "qrToken": "MCC-AZ-2026-REG8801-VERIFIED"
  }
  ```

---

## 4. Certificates & Winners Endpoints (§37, §38, §39)

### `POST /api/certificates/generate`
Batch generates PDF certificates using vector `pdf-lib` rendering.

### `GET /api/certificates/verify/:verificationId`
Public certificate verification endpoint.
