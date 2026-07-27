# Candidate Evaluation Engine — API Testing Guide

This guide describes how to run automated unit tests and perform manual endpoint testing to verify compliance with the Product Requirements Document (PRD).

---

## ⚙️ Setup & Prerequisites

1. **Verify Backend Server is Running:**
   By default, the backend runs on `http://localhost:5000`. Ensure it is active.
   ```bash
   cd backend
   npm run dev
   ```

2. **Database Migration and Seeding:**
   Ensure database tables are initialized and seeded with mock candidate, evaluation, and note records:
   ```bash
   npm run seed
   ```

---

## 🧪 Automated Unit Tests

Unit tests cover the scoring algorithm and priority bucket assignment thresholds.

```bash
# Run from the backend directory
node --test tests/priorityEngine.test.js
```

---

## 📡 Endpoint Manual Testing

Since escaping nested JSON strings in Windows PowerShell and Command Prompt can be error-prone, **Node.js one-liners** are provided alongside standard **cURL** and **PowerShell** commands.

### 1. Health Check
* **Route:** `GET /api/health`
* **cURL:**
  ```bash
  curl.exe -s http://localhost:5000/api/health
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri 'http://localhost:5000/api/health'
  ```
* **Expected Response (200 OK):**
  ```json
  { "success": true, "message": "Candidate Engine API is running" }
  ```

---

### 2. Dashboard Summary
* **Route:** `GET /api/dashboard-summary`
* **cURL:**
  ```bash
  curl.exe -s http://localhost:5000/api/dashboard-summary
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri 'http://localhost:5000/api/dashboard-summary'
  ```
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "total_candidates": 100,
      "reviewed_count": 21,
      "shortlisted_count": 20,
      "pending_count": 59,
      "by_priority": {
        "P0": 0,
        "P1": 20,
        "P2": 80,
        "P3": 0
      }
    }
  }
  ```

---

### 3. List Candidates (with Pagination & Operators)
* **Route:** `GET /api/candidates`
* **cURL (Paginated & Filtered):**
  ```bash
  curl.exe -s "http://localhost:5000/api/candidates?page=1&page_size=2&assignment_score=>80"
  ```
* **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri 'http://localhost:5000/api/candidates?page=1&page_size=2&assignment_score=>80'
  ```
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Ankit Yadav",
        "college": "VIT",
        "assignment_score": "88.50",
        "video_score": "75.00",
        "ats_score": "82.00",
        "github_score": "90.00",
        "communication_score": "72.00",
        "priority_score": "82.48",
        "priority_bucket": "P1",
        "status": "pending",
        "created_at": "2026-07-27T10:33:46.452Z"
      }
      // ...
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "page_size": 2,
      "total_pages": 23,
      "has_more": true,
      "returned": 2
    }
  }
  ```

---

### 4. Create Candidate
* **Route:** `POST /api/candidates`
* **Node.js (Recommended for Windows):**
  ```bash
  node -e "fetch('http://localhost:5000/api/candidates', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:'Float Test Candidate', college:'IIT Delhi', assignment_score:85.5, video_score:72.3, ats_score:91.7, github_score:68.2, communication_score:55.9})}).then(r => r.json()).then(console.log)"
  ```
* **Expected Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "1 candidate(s) created",
    "data": {
      "id": 101,
      "name": "Float Test Candidate",
      "college": "IIT Delhi",
      "assignment_score": "85.50",
      "video_score": "72.30",
      "ats_score": "91.70",
      "github_score": "68.20",
      "communication_score": "55.90",
      "priority_score": "77.89",
      "priority_bucket": "P1",
      "status": "pending",
      "created_at": "2026-07-27T10:45:00.000Z"
    }
  }
  ```

---

### 5. Get Candidate Details (with Optional Embedding)
* **Route:** `GET /api/candidates/:id`
* **cURL (Without details embedded):**
  ```bash
  curl.exe -s http://localhost:5000/api/candidates/1
  ```
* **cURL (With evaluations and notes embedded):**
  ```bash
  curl.exe -s "http://localhost:5000/api/candidates/1?include=evaluations,notes"
  ```
* **Expected Response with Include (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Ankit Yadav",
      "college": "VIT",
      "assignment_score": "88.50",
      "video_score": "75.00",
      "evaluations": [ ... ],
      "notes": [ ... ]
    }
  }
  ```

---

### 6. Update Candidate
* **Route:** `PATCH /api/candidates/:id`
* **Node.js (Recommended for Windows):**
  ```bash
  node -e "fetch('http://localhost:5000/api/candidates/1', {method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'reviewed', assignment_score:95.4})}).then(r => r.json()).then(console.log)"
  ```

---

### 7. Submit Evaluation
* **Route:** `POST /api/evaluations/:candidate_id`
* **Node.js (Recommended for Windows):**
  ```bash
  node -e "fetch('http://localhost:5000/api/evaluations/1', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ui_quality:85, state_handling:90, edge_case_thinking:80, architecture_understanding:85, communication:90, confidence:88, accessibility_awareness:75})}).then(r => r.json()).then(console.log)"
  ```

---

### 8. Add Reviewer Note
* **Route:** `POST /api/candidates/:id/notes`
* **Node.js (Recommended for Windows):**
  ```bash
  node -e "fetch('http://localhost:5000/api/candidates/1/notes', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({reviewer:'Senior HR', note:'Candidate has strong architectural fundamentals.'})}).then(r => r.json()).then(console.log)"
  ```

---

### 9. Get Reviewer Notes
* **Route:** `GET /api/candidates/:id/notes`
* **cURL:**
  ```bash
  curl.exe -s http://localhost:5000/api/candidates/1/notes
  ```

---

### 10. Compare Candidates
* **Route:** `GET /api/compare?ids=1,2,3`
* **cURL:**
  ```bash
  curl.exe -s "http://localhost:5000/api/compare?ids=1,2,3"
  ```
* **Expected Response (200 OK):**
  Includes scores side-by-side along with the candidate's `latest_evaluation`.

---

## 🚫 Error Envelope Validation Tests

Verify that semantic and validation errors return the correct PRD structured format:
`{ "error": { "code", "message", "field" } }`

### Test A: Querying Rejected Status (Invalid status parameter)
* **Command:**
  ```bash
  curl.exe -s "http://localhost:5000/api/candidates?status=rejected"
  ```
* **Expected Response (400 Bad Request):**
  ```json
  {
    "error": {
      "code": "INVALID_INPUT",
      "message": "'status' must be one of: pending, reviewed, shortlisted",
      "field": "status"
    }
  }
  ```

### Test B: Querying Unknown Parameter
* **Command:**
  ```bash
  curl.exe -s "http://localhost:5000/api/candidates?invalid_field=abc"
  ```
* **Expected Response (400 Bad Request):**
  ```json
  {
    "error": {
      "code": "UNKNOWN_PARAM",
      "message": "Unknown query parameter: 'invalid_field'...",
      "field": "invalid_field"
    }
  }
  ```

### Test C: Missing Required Candidate Fields
* **Node.js command:**
  ```bash
  node -e "fetch('http://localhost:5000/api/candidates', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:'Test'})}).then(r => r.json()).then(console.log)"
  ```
* **Expected Response (400 Bad Request):**
  ```json
  {
    "error": {
      "code": "MISSING_FIELD",
      "message": "Missing required fields: assignment_score, video_score, ats_score, github_score, communication_score",
      "field": "assignment_score"
    }
  }
  ```
