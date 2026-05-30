# Nyaya AI Frontend Context

Nyaya AI is a document-centric legal accessibility platform for ordinary citizens in India. The frontend should help users upload or paste legal documents, understand them in plain language, save the matter as a case, and continue later through a chat + timeline interface.

Do not build a flashy landing page first. Build the usable app/dashboard first. The UI can be simple and clean for now; we will polish it later. max to max adapt to the design of the current hero section design language.

## Backend Testing Rule

During frontend development, run only the frontend locally.

Do not require the backend to run on localhost.

Use the deployed Railway backend for all API calls, even from local frontend:

```env
NEXT_PUBLIC_API_BASE_URL=https://nyaya-ai-production-2cff.up.railway.app
```

Replace the URL with the real Railway backend domain.

Frontend local dev should look like:

```text
Frontend: http://localhost:3000
Backend:  https://YOUR-RAILWAY-BACKEND.up.railway.app
```

Before wiring UI, test these backend URLs in the browser:

```text
https://nyaya-ai-production-2cff.up.railway.app/health
https://nyaya-ai-production-2cff.up.railway.app/health/ai
https://nyaya-ai-production-2cff.up.railway.app/docs
```

## Current Stack Direction

Frontend/database/auth/storage owns persistence:

- Next.js + React for UI.
- Better Auth for authentication.
- Prisma + NeonDB for database persistence.
- Cloudinary for original uploaded files.
- Railway FastAPI backend for AI/legal analysis only.

FastAPI should not be treated as the source of truth for cases. Prisma/NeonDB is the source of truth.

## Product Goal

The user should be able to:

1. Log in.
2. Create / open a legal case.
3. Paste text or upload a legal document.
4. Send that content to the deployed backend for analysis.
5. Save the backend response into NeonDB through Prisma.
6. See a simple analysis dashboard.
7. Continue later with follow-up files, pasted text, or chat questions.
8. View everything in a chat + timeline style case page.

## Backend API Contract

Base URL:

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
```

### Stateless Text Analysis

Use for quick testing without saving to a case:

```http
POST /api/v1/documents/analyze-text
```

Request:

```json
{
  "text": "Legal notice dated 12 May 2026...",
  "target_language": "en",
  "draft_type": "reply"
}
```

Response is an `AnalysisResponse`.

### Case Text Analysis

Use when user pastes text inside an existing case:

```http
POST /api/v1/cases/{caseId}/documents/analyze-text
```

Request:

```json
{
  "user_id": "USER_ID_FROM_BETTER_AUTH",
  "document_id": "OPTIONAL_PRISMA_DOCUMENT_ID",
  "file_url": null,
  "file_name": null,
  "text": "Eviction notice from landlord...",
  "target_language": "en",
  "draft_type": "reply"
}
```

Response:

```json
{
  "case_id": "case-id",
  "document_id": "optional-document-id",
  "analysis": {},
  "suggested_document": {},
  "suggested_events": [],
  "case_update": {}
}
```

Save `suggested_document` as a `CaseDocument`, `suggested_events` as `CaseEvent` rows, and patch `case_update` onto the `Case`.

### Case File Analysis

Use when user uploads a file.

Recommended frontend flow:

1. Upload original file to Cloudinary.
2. Get the Cloudinary `fileUrl`.
3. Send the same file to FastAPI for analysis.
4. Save FastAPI's returned suggestions in Prisma.

Endpoint:

```http
POST /api/v1/cases/{caseId}/documents/analyze
```

FormData:

```ts
formData.append("file", file);
formData.append("user_id", user.id);
formData.append("document_id", optionalDocumentId);
formData.append("file_url", cloudinaryFileUrl);
formData.append("target_language", "en");
formData.append("draft_type", "reply");
```

Response shape is the same as case text analysis.

### Case Chat Question

Use when user asks a follow-up question in a saved case.

Endpoint:

```http
POST /api/v1/cases/{caseId}/messages
```

Request:

```json
{
  "user_id": "USER_ID_FROM_BETTER_AUTH",
  "message": "What should I do now?",
  "documents": [],
  "messages": [],
  "events": []
}
```

Before calling this endpoint, fetch the case history from Prisma and pass real `documents`, `messages`, and `events` arrays. The backend uses that supplied history to answer.

Response:

```json
{
  "case_id": "case-id",
  "user_message": {},
  "assistant_message": {},
  "suggested_events": []
}
```

Save both messages and the events in Prisma.

## Analysis Response Fields To Render

The backend analysis object includes:

```ts
analysis.parsed
analysis.classification
analysis.extraction
analysis.explanation
analysis.knowledge
analysis.recommendations
analysis.defense
analysis.draft
analysis.translation
analysis.processing
analysis.disclaimer
```

Render these as simple dashboard sections:

- Summary card: document type, confidence, urgency.
- Key details: names, dates, deadlines, penalties, legal sections.
- Plain language explanation: summary and bullet points.
- Next steps: checklist from recommendations.
- Required documents: simple list or chips.
- Authorities/escalation paths.
- Possible procedural issues: defense section.
- Draft editor: editable textarea using `analysis.draft.body`.
- Translation panel if `analysis.translation` exists.
- Processing/debug badge: show whether output used `llm:gemini`, `api:sarvam`, `local_txt`, or fallbacks.
- Disclaimer at bottom.

Always show the disclaimer. Never claim the app replaces a lawyer.

## Prisma Models Expected

The frontend should have models equivalent to:

- `User`
- `Case`
- `CaseDocument`
- `CaseMessage`
- `CaseEvent`

Use camelCase in Prisma, but map data from backend snake_case:

```ts
source_type -> sourceType
file_url -> fileUrl
file_name -> fileName
extracted_text -> extractedText
analysis_json -> analysisJson
document_type -> documentType
event_type -> eventType
metadata_json -> metadataJson
case_type -> caseType
latest_urgency -> latestUrgency
```

## MVP Pages

Build only a practical MVP UI for now. Adapt to the design of the current hero section design language.

### `/`

If logged out:

- simple login prompt
- short product line: "Turn legal documents into clear next steps."

If logged in:

- redirect or link to `/cases`

### `/cases`

Show:

- list of user's cases from Prisma
- button to create new case
- each case row/card shows title, case type, latest urgency, updated time

### `/cases/[caseId]`

Main work screen.

Sections:

- case header: title, type, urgency, status
- upload file panel
- paste text panel
- analysis results area for latest document
- timeline feed using `CaseEvent`
- chat panel using `CaseMessage`

Keep the layout simple. Avoid over-designed decorative UI. Use readable cards/sections with clear spacing.

## Important UX Rules

- Frontend should call deployed Railway backend, not localhost backend.
- Store all case data in Prisma/NeonDB.
- Store original files in Cloudinary.
- Send legal content to FastAPI only for analysis.
- Use backend returned suggestions as data to save, not as already-saved records.
- Use document endpoints for new uploaded/pasted legal material.
- Use message endpoint only for questions about an existing case.
- Show loading states for analysis because AI calls may take time.
- Show clear error messages if Railway backend fails.
- Display `analysis.processing` somewhere small for debugging/demo confidence.
- Display `analysis.knowledge` or at least mention "Grounded with local legal knowledge" when `processing.rag === "local_txt"`.

## Quick Backend Test Payload

Use this from the frontend to verify the deployed backend:

```ts
await fetch(`${API_BASE_URL}/api/v1/documents/analyze-text`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "Legal notice dated 12 May 2026 from Advocate Ramesh Sharma. You are hereby called upon to pay Rs 50000 within 15 days, failing which civil and criminal proceedings may be initiated.",
    target_language: "hi",
    draft_type: "reply"
  })
});
```

Expected:

- HTTP 200
- `classification.document_type` is `legal_notice`
- `recommendations.urgency` is `high`
- `processing.rag` is `local_txt`
- `translation.language` is `Hindi` if translation succeeds

## Final Reminder

The first frontend version should be functional, not fancy. Build the workflow cleanly:

```text
Better Auth login -> Prisma case -> Cloudinary upload or pasted text -> Railway FastAPI analysis -> Prisma save -> dashboard/timeline/chat render
```
