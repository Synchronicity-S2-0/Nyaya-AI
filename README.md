# ⚖️ Nyaya-AI

> **Nyaya** *(Sanskrit: न्याय)* — Justice, logic, and reasoning.  
> An intelligent legal assistant designed to synthesize case laws, analyze complex documentation, and deliver structured judicial reasoning.

---

### ✨ Core Features

* 📄 **Document Synthesis** — High-precision summarization & key clause risk mapping.
* 💬 **Nyaya Assistant** — Conversational AI for rapid retrieval of legal precedents & legal queries.
* ✍️ **Smarter Drafting** — Dynamic templates and legal draft generation.
* 🔍 **Precedent Search** — Semantic & vector-based exploration of court rulings.

---

### 🏗️ Workspace Overview

```
Nyaya-AI/
├── 🐍 backend/      # FastAPI-powered Python service (Logical Core)
└── ⚡ frontend/     # Next.js 16 + Tailwind v4 App (Interface Layer)
```

---

### 🛠️ Tech Stack

* **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Prisma (ORM), Supabase
* **Backend**: FastAPI, Python, Uvicorn

---

### ⚡ Quick Start

```bash
# Run Backend (Port 8000)
cd backend && uvicorn main:app --reload

# Run Frontend (Port 3000)
cd frontend && pnpm dev
```