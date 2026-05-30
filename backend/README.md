# Nyaya AI Backend

Free-first FastAPI backend for a document-centric Indian legal accessibility workflow.

This scaffold avoids paid model/API dependencies by default. It uses local parsing, OCR hooks, rule-based agents, and a small grounded knowledge base so you can test orchestration end to end.

## What Works Now

- Upload legal documents as `.txt`, `.pdf`, or image files.
- Analyze documents for persistent legal cases managed by the frontend/Prisma app.
- Return Prisma-saveable document, message, case update, and timeline event suggestions.
- Answer case-specific follow-up questions from case history supplied by the frontend.
- Extract text from text/PDF files.
- Optionally run local Tesseract OCR for images.
- Classify common legal document types.
- Extract names, dates, deadlines, legal sections, obligations, risks, and penalties.
- Generate plain-language explanations.
- Retrieve relevant procedural guidance from a local RAG-style knowledge base.
- Recommend next steps, authorities, documents, and escalation paths.
- Generate first-draft responses for complaints, RTIs, replies, affidavits, and summaries.
- Produce lightweight demo translations for Hindi, Bengali, and Tamil.
- Ground RAG context from a local TXT knowledge base at `app/data/legal_knowledge.txt`.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Open:

- API docs: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`
- AI config check: `http://127.0.0.1:8000/health/ai`
- Live Gemini check: `http://127.0.0.1:8000/health/ai?live=true`

## Test Orchestration

```powershell
pytest
```

## Follow-Up Case API

Cases, users, timeline rows, and file metadata are owned by the frontend stack:

- Better Auth for authentication.
- Prisma + Neon Postgres for database persistence.
- Cloudinary for original uploaded files.
- FastAPI for parsing, OCR hooks, AI analysis, drafting, translation, and grounded case answers.

Case-aware endpoints:

- `POST /api/v1/cases/{case_id}/documents/analyze`
- `POST /api/v1/cases/{case_id}/documents/analyze-text`
- `POST /api/v1/cases/{case_id}/messages`

The document endpoints return:

- `analysis`: the normal legal workflow output.
- `suggested_document`: fields the frontend can save as `CaseDocument`.
- `suggested_events`: timeline rows the frontend can save as `CaseEvent`.
- `case_update`: fields the frontend can patch onto `Case`.

The message endpoint accepts saved case history from Prisma and returns `user_message`, `assistant_message`, and `suggested_events` for the frontend to save.

For Gemini on Railway, set `GEMINI_API_KEY` and use `GEMINI_MODEL=gemini-2.5-flash` unless you intentionally choose another supported Gemini model. If analysis still falls back, open `/health/ai?live=true` to see the live Gemini status without exposing secrets.

## Local Knowledge Grounding

The RAG layer reads legal guidance from `app/data/legal_knowledge.txt` to reduce hallucination and make demo answers inspectable. Edit that TXT file to add more grounded snippets; each block uses `title`, `tags`, and `content`.

Or POST JSON:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/api/v1/documents/analyze-text `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"text":"Legal notice dated 12 May 2026. You must vacate within 15 days or pay Rs 50000 penalty.","target_language":"hi","draft_type":"reply"}'
```

## Free-First Design

Paid integrations are intentionally not required. For production quality, you can later add:

- Local LLM: Ollama, llama.cpp, or vLLM.
- Local embeddings: sentence-transformers.
- Local vector DB: Chroma or SQLite FTS.
- OCR: Tesseract for free local OCR.
- Translation: IndicTrans2, AI4Bharat models, or another self-hosted option.

This backend is a legal accessibility and first-level triage assistant. It does not replace lawyers.
