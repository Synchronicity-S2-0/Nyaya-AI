Nyaya AI is an AI-powered legal accessibility and workflow platform focused on simplifying legal understanding for ordinary citizens in India. It is not a generic chatbot. The system follows a structured multi-agent legal processing pipeline.

Core workflow:
User uploads legal documents(PDF/image/text) such as FIRs, legal notices, contracts, eviction notices, employment agreements, summons, complaints, RTI drafts, affidavits etc.
System performs OCR and document parsing.
AI classifies document type.
Extraction agent extracts entities:
-names
-dates
-deadlines
-legal sections
-obligations
-risks
-penalties
Legal reasoning agent explains the document in simple language.
Action recommendation agent suggests next procedural steps, required documents, escalation paths and authorities.
Drafting agent generates responses like complaints, replies, affidavits, RTIs and summaries.
Translation agent converts outputs into regional languages(Hindi,Bengali,Tamil,etc).

Primary objective:
Transform complex legal documents into actionable multilingual guidance.

Key differentiation:
-structured workflow instead of open-ended chat
-multi-agent architecture
-procedural intelligence
-RAG grounded outputs
-multilingual accessibility
-first-level legal triage system
-document-centric reasoning
-actionable outputs instead of generic answers

Tech stack:
Frontend:
-Next.js
-React
-TailwindCSS
-shadcn/ui
-Framer Motion

Backend:
-FastAPI(Python)

AI Layer:
-OpenAI GPT-4.1/GPT-4o
-LangChain(optional lightweight orchestration)
-RAG pipeline
-Vector DB(Pinecone/Chroma)

OCR:
-Google Vision API or Tesseract OCR

Database/Auth/Storage:
-Supabase(PostgreSQL/Auth/Storage)

Deployment:
-Vercel(frontend)
-Render or Railway(backend)

System architecture:
Frontend→Upload API→OCR→Document Parser→Classification Agent→Extraction Agent→Reasoning Agent→RAG Retrieval→Action Recommendation→Draft Generation→Translation→Frontend Dashboard

Frontend pages:
-Landing page
-Upload dashboard
-Analysis dashboard
-Generated draft editor
-Multilingual explanation panel

UI goals:
-clean startup-style design
-fast upload
-card-based analysis
-human-readable summaries
-mobile responsive
-low-friction UX

Core features:
-document upload
-OCR extraction
-legal entity extraction
-plain-language explanation
-risk/deadline detection
-next-step recommendations
-draft generation
-multilingual translation

Optional features:
-voice input/output
-lawyer escalation
-WhatsApp integration
-risk severity scoring

Constraints:
-System must avoid claiming to replace lawyers.
-Acts as legal accessibility and first-level triage assistant.
-Must reduce hallucinations using RAG and structured extraction.
-Responses should be explainable and procedural.
-Focus on Indian legal accessibility and multilingual support.

Coding priorities:
-modular architecture
-separate services for OCR,agents,RAG,drafting
-clean API structure
-scalable async backend
-reusable UI components
-environment variable based configuration
-file upload pipeline
-streamed AI responses if possible
-error handling and fallback responses
-minimal latency for demo readiness

Target users:
-common citizens
-low legal literacy users
-regional language users
-people receiving legal notices or contracts
-first-time legal process participants

Pitch:
“Nyaya AI transforms legal confusion into procedural clarity using agentic AI workflows.”
