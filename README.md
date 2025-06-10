# AI Note Summarizer

This project is a full-stack web application that allows users to upload notes, generate AI-powered summaries, and extract actionable items using OpenAI's API.

##  Tech Stack

- **Frontend:** React, Tailwind CSS, TypeScript
- **Backend:** FastAPI (Python)
- **Database:** SQLite (via SQLAlchemy)
- **AI Model:** OpenAI GPT-3.5 Turbo

---


### 1. Clone the repository

```bash
git clone https://github.com/yourusername/note-summarizer.git
cd note-summarizer
```

### 2. Setup Backend

```bash
cd backend
make setup
make run
```

### 3. Setup Frontend

Open a new terminal window and navigate to `note-summarizer` again
```bash
cd frontend
make install
make build
```

### 4. Configure OpenAI API key

Open a new terminal window and navigate to `note-summarizer` again
```bash
cd backend
cp .env.example .env
```
Open `.env` in any text editor and insert your API key

### Once both servers are running:
 - Frontend: http://localhost:5173
 - Backend API: http://localhost:8000