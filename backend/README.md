# Nyaya AI Backend

Free-first FastAPI backend for a document-centric Indian legal accessibility workflow.

This scaffold avoids paid model/API dependencies by default. It uses local parsing, OCR hooks, rule-based agents, and a small grounded knowledge base so you can test orchestration end to end.

## What Works Now

- Upload legal documents as `.txt`, `.pdf`, or image files.
- Create persistent legal cases for follow-up timelines.
- Save uploaded/pasted documents under a case.
- Ask case-specific follow-up questions from saved case history.
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

## Test Orchestration

```powershell
pytest
```

## Follow-Up Case API

Create the Supabase tables and storage bucket from `supabase_schema.sql`, then set:

```powershell
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=case-documents
LOCAL_KNOWLEDGE_PATH=app/data/legal_knowledge.txt
```

Case-aware endpoints:

- `POST /api/v1/cases`
- `GET /api/v1/cases?user_id=...`
- `GET /api/v1/cases/{case_id}?user_id=...`
- `POST /api/v1/cases/{case_id}/documents/analyze`
- `POST /api/v1/cases/{case_id}/documents/analyze-text`
- `POST /api/v1/cases/{case_id}/messages`

If Supabase env vars are missing, the backend uses in-memory case storage for local tests only.

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
