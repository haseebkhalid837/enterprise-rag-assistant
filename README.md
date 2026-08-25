# Enterprise RAG Knowledge Assistant

A full-stack "Talk to Your Documentation" application that lets users upload custom documents (PDF, Markdown, TXT) and ask natural-language questions, receiving accurate, **cited** answers grounded strictly in the uploaded content.

Built with **FastAPI**, **ChromaDB**, **Groq LLM**, and a **React (Vite)** frontend — fully containerized with Docker and deployed on Railway.

**🔗 Live Demo:** [powerful-vision-production-7f16.up.railway.app](https://powerful-vision-production-7f16.up.railway.app)

---

## ✨ Features

- 📄 **Multi-format document ingestion** — PDF, Markdown, and TXT support
- ✂️ **Smart chunking** — documents are split into semantically meaningful chunks before embedding
- 🔎 **Semantic + hybrid search** — combines vector similarity search with keyword-based (BM25) retrieval for more accurate results
- 💬 **Conversational memory** — maintains chat history per session for natural follow-up questions
- 📚 **Source-cited answers** — every response references the exact document chunks it was generated from, reducing hallucination
- 🔁 **Query rewriting** — reformulates user questions using conversation context before retrieval
- 🐳 **Fully containerized** — one-command startup with Docker Compose
- ☁️ **Cloud deployed** — live, publicly accessible instance on Railway

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React + Vite   │  HTTP   │     FastAPI       │         │    ChromaDB      │
│   Frontend (UI)   │ ──────▶ │     Backend       │ ──────▶ │  (Vector Store)  │
│                   │         │                    │         │                  │
└─────────────────┘         └────────┬───────────┘         └─────────────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │   Groq LLM API    │
                              │ (Answer Generation)│
                              └──────────────────┘
```

**Flow:** Document Upload → Parsing & Chunking → Embedding → ChromaDB Storage → User Query → Hybrid Retrieval → Prompt Augmentation → LLM Response with Citations

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Vector Database | ChromaDB |
| LLM Provider | Groq |
| Embeddings | Sentence-Transformers |
| Frontend | React + Vite |
| Containerization | Docker, Docker Compose |
| Deployment | Railway |

---

## 📁 Project Structure

```
enterprise-rag-assistant/
├── app/
│   ├── main.py                 # FastAPI entrypoint
│   ├── config.py                # Environment/config settings
│   ├── api/
│   │   ├── routes_documents.py  # Upload/document endpoints
│   │   └── routes_chat.py       # Query/chat endpoints
│   ├── ingestion/
│   │   ├── loaders.py           # PDF/Markdown/TXT parsers
│   │   ├── chunking.py          # Text splitting strategies
│   │   ├── embeddings.py        # Embedding generation
│   │   └── vector_store.py      # ChromaDB client
│   ├── rag/
│   │   ├── retriever.py         # Semantic search retrieval
│   │   ├── prompt_builder.py    # RAG system prompt + context injection
│   │   ├── llm_client.py        # Groq LLM API wrapper
│   │   ├── citation.py          # Source citation formatting
│   │   ├── hybrid_search.py     # Keyword + vector hybrid search
│   │   ├── keyword_search.py    # BM25 keyword search
│   │   └── query_rewriter.py    # Conversational query rewriting
│   ├── search/
│   │   └── memory.py            # Conversational memory/session handling
│   ├── models/
│   │   └── schemas.py           # Pydantic request/response models
│   └── frontend/                # React + Vite UI
├── Dockerfile                   # Backend container
├── app/frontend/Dockerfile      # Frontend container (Node build + nginx)
├── docker-compose.yml           # Local multi-container orchestration
├── requirements.txt
└── .env.example
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Docker & Docker Compose installed
- A [Groq API key](https://console.groq.com)

### 1. Clone the repository
```bash
git clone https://github.com/haseebkhalid837/enterprise-rag-assistant.git
cd enterprise-rag-assistant
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Then open `.env` and add your Groq API key:
```
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run with Docker Compose
```bash
docker-compose up --build
```

### 4. Access the app
- **Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend API docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📖 How It Works

1. **Upload** a document (PDF/Markdown/TXT) through the UI
2. The backend **parses and chunks** the document into manageable pieces
3. Each chunk is **embedded** and stored in **ChromaDB**
4. When a question is asked, the system performs **hybrid retrieval** (semantic + keyword) to find the most relevant chunks
5. Retrieved chunks are injected into a **structured system prompt** with strict grounding rules (no hallucination, citation-required)
6. The **Groq LLM** generates an answer, citing the exact source chunks used
7. The frontend displays the answer along with its **cited sources**

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | API key for Groq's LLM inference API |

---

## 📌 Notes

- Vector data is persisted via a Docker volume (`app/database`) so uploaded documents survive container restarts.
- The system prompt strictly instructs the LLM to answer only from provided context and to decline out-of-scope questions, minimizing hallucination.

---

## 📄 License

This project was built as part of a self-guided learning track and is available for educational/portfolio purposes.
