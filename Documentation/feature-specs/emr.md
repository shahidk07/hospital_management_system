# Feature Specification: Electronic Medical Records (EMR)

**Module:** `emr/`  
**Owner:** Member 2  
**Version:** 1.0

---

## Overview

Manages upload, storage, retrieval, search, and categorization of medical records. Files are stored in Cloudinary; only URLs are stored in PostgreSQL.

---

## Features

### F-EMR-01: Upload Medical Record

- Doctor or admin uploads files for a patient
- Supported types: `PRESCRIPTION`, `LAB_REPORT`, `XRAY`, `MRI`, `OTHER`
- File uploaded to Cloudinary; URL and public_id stored in database
- Max file size: 10MB
- Supported formats: PDF, JPG, JPEG, PNG

### F-EMR-02: View Medical Records

- Patient views own records
- Doctor views records for assigned patients
- Admin views all records

### F-EMR-03: Download Medical Record

- Returns Cloudinary URL for direct download
- Access controlled by RBAC

### F-EMR-04: Search Medical Records

- Search by patient, type, title, date range
- `GET /api/emr/search?patientId=uuid&type=LAB_REPORT&query=blood`

### F-EMR-05: Delete Medical Record

- Admin only
- Deletes from Cloudinary and database

### F-EMR-06: Categorize Records

- Records categorized by `MedicalRecordType` enum
- UI displays records grouped by type

---

## User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-EMR-01 | Doctor | Upload lab reports for a patient | Records are digitally stored |
| US-EMR-02 | Patient | View and download my reports | I can access my medical history |
| US-EMR-03 | Doctor | Search patient records | I can find specific reports quickly |

---

## API Endpoints

See `api-contracts.md` — Section 5: EMR Module.

---

## Database Tables

- `medical_records`

---

## Cloudinary Integration

```javascript
// Upload flow
const result = await cloudinary.uploader.upload(file.path, {
  folder: `hospital/emr/${patientId}`,
  resource_type: 'auto',
  allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
});

// Store in database
await prisma.medicalRecord.create({
  data: {
    patientId,
    type,
    title,
    description,
    fileUrl: result.secure_url,
    filePublicId: result.public_id,
    uploadedBy: req.user.id
  }
});
```

---

## Notification Trigger

When a record of type `LAB_REPORT`, `XRAY`, or `MRI` is uploaded:

→ Notification: `REPORT_AVAILABLE` to patient

---

## RBAC Matrix

| Endpoint | ADMIN | DOCTOR | PATIENT |
|----------|-------|--------|---------|
| GET `/emr` | Yes (all) | Yes (assigned) | Yes (own) |
| GET `/emr/:id` | Yes | Yes (assigned) | Yes (own) |
| POST `/emr/upload` | Yes | Yes | No |
| DELETE `/emr/:id` | Yes | No | No |
| GET `/emr/search` | Yes | Yes | No |

---

## UI Screens

| Screen | Route | Access |
|--------|-------|--------|
| Patient Records | `/patient/records` | PATIENT |
| Upload Record | `/doctor/emr/upload` | DOCTOR |
| Record Viewer | `/shared/records/:id` | Role-based |
| EMR Search | `/doctor/emr/search` | DOCTOR |

---

## Acceptance Criteria

- [ ] Files upload to Cloudinary successfully
- [ ] Only URLs stored in database (no BLOB)
- [ ] Records categorized by type
- [ ] Patient can view and download own records
- [ ] Doctor can upload and search records
- [ ] Admin can delete records
- [ ] Notification sent when lab report/imaging uploaded
- [ ] File size and type validation enforced
- [ ] RBAC enforced on all endpoints
