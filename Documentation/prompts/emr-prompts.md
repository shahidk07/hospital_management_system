# Development Prompts: EMR

**Module:** `emr/`  
**Owner:** Dakshesh Jain

---

## Prompt: Implement EMR Module

```
Context: [Paste foundation-prompt.md]

Task: Implement the Electronic Medical Records module.

References:
- Feature spec: Documentation/feature-specs/emr.md
- API contract: Documentation/api-contracts.md (Section 5)
- Database: medical_records
- Notifications: REPORT_AVAILABLE trigger

Backend files:
- emr.routes.js
- emr.controller.js
- emr.service.js

Endpoints:
- GET /api/emr (role-filtered list)
- GET /api/emr/:id
- POST /api/emr/upload (multipart/form-data)
- DELETE /api/emr/:id (admin only)
- GET /api/emr/search

Cloudinary integration:
- Use multer for file upload middleware
- Upload to folder: hospital/emr/{patientId}
- Store fileUrl and filePublicId in database
- Max file size: 10MB
- Allowed formats: pdf, jpg, jpeg, png
- On delete: remove from Cloudinary AND database

Record types: PRESCRIPTION, LAB_REPORT, XRAY, MRI, OTHER

On upload of LAB_REPORT, XRAY, or MRI:
- Notify patient (REPORT_AVAILABLE)

RBAC:
- Patient: view/download own records
- Doctor: view/upload for assigned patients
- Admin: view/upload/delete all

Frontend:
- /patient/records — patient's record list grouped by type
- /doctor/emr/upload — upload form (select patient, type, file)
- /doctor/emr/search — search by patient, type, keyword
- /shared/records/:id — record viewer with download button

Do NOT:
- Store files as BLOB in PostgreSQL
- Allow patients to upload records
- Skip Cloudinary upload (no local file storage)
```
