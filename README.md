# AI Note Summarizer

This project is a full-stack web application that allows users to upload notes, generate AI-powered summaries, and extract actionable items using OpenAI's API.

## Tech Stack

- **Frontend:** React, Tailwind CSS, TypeScript
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL (via SQLAlchemy)
- **AI Model:** OpenAI GPT-3.5 Turbo
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

### 2. Add OpenAI API Key

Copy the example environment file and set your OpenAI key:

```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` in a text editor and replace the placeholder with your actual API key:

```
OPENAI_API_KEY=your_real_key_here
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

### Add OpenAI API Key

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