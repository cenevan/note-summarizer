# AI Note Summarizer

This project is a full-stack web application that allows users to upload notes, generate AI-powered summaries, and extract actionable items using OpenAI's API.
Character recognition with Tesseract OCR allows multimodal support with images and rich text formats.

## Tech Stack

- **Frontend:** React, Tailwind CSS, TypeScript
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL (via SQLAlchemy), Alembic Database Migration
- **AI Integration:** OpenAI GPT-4.1 Nano, Vercel AI SDK, Tesseract OCR
- **Containerization:** Docker & Docker Compose

---

## Prerequisites

This project uses Docker for simplified setup and consistency across environments.

| Tool               | Purpose                          | How to Check                 |
|--------------------|----------------------------------|------------------------------|
| **Docker**         | Containerization engine          | `docker --version`           |
| **Docker Compose** | Manages multi-container setup    | `docker compose version`     |


---

## Setup with Docker

### 1. Clone the Repository

```bash
git clone https://github.com/cenevan/note-summarizer.git
cd note-summarizer
```

### 2. Copy .env file

```bash
cp backend/.env.example backend/.env
```

### 3. Start the App

Build and run all services:

```bash
docker-compose up --build
```

---

## Access the App

- **Frontend:** http://localhost:3000  
- **API Docs:** http://localhost:8000/docs

---

<details>
<summary>Local Setup (Non-Docker)</summary>

### Prerequisites

Before using manual setup, ensure the following tools are installed:

| Tool             | Purpose                                      | How to Check            |
|------------------|----------------------------------------------|-------------------------|
| **Python 3.x**   | Backend runtime & virtual environment         | `python3 --version`     |
| **pip**          | Install Python packages (`requirements.txt`) | `pip --version`         |
| **Node.js & npm**| Frontend package manager                     | `npm --version`         |
| **make**         | Runs setup/dev tasks via `Makefile`          | `make --version`        |

> Windows users can install `make` using [WSL](https://learn.microsoft.com/en-us/windows/wsl/) or Git Bash.

### Copy .env file

Follow step 2 from above.

### Backend Setup

```bash
cd backend
make setup
make run
```

### Frontend Setup

Open a new terminal window and run:

```bash
cd frontend
make install
make build
make start
```

---

## Access the App

- **Frontend:** http://localhost:5173  
- **API Docs:** http://localhost:8000/docs

---

</details>