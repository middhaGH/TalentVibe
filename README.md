# TalentVibe

**TalentVibe** is an AI-powered platform for resume analysis, job matching, and interview management. Instantly score candidate fit, organize interviews, and streamline hiring—all in one collaborative web app.

---

## Features

- **AI Resume Analysis:** Instantly analyze resumes and get fit scores, buckets, and reasoning.
- **Job & Candidate Management:** Upload jobs and resumes, view fit scores, and manage candidate pipelines.
- **Interview Scheduling:** Schedule interviews and track feedback in a unified dashboard.
- **Real-Time Updates:** Live progress and results via WebSockets.
- **Modern UI:** Built with React for a fast, intuitive experience.

## Tech Stack

- **Frontend:** React (Create React App)
- **Backend:** Flask, Celery (synchronous for dev), SQLAlchemy, Socket.IO
- **Database:** SQLite (dev)
- **AI Integration:** OpenAI (or compatible LLM)
- **Containerization:** Docker & Docker Compose

## Quick Start

1. **Clone the repo:**
   ```sh
   git clone https://github.com/middhaGH/TalentVibe.git
   cd TalentVibe
   ```
2. **Install backend dependencies:**
   ```sh
   cd backend
   pip install -r requirements.txt
   cd ..
   ```
3. **Install frontend dependencies:**
   ```sh
   cd frontend
   npm install
   cd ..
   ```
4. **Start the backend:**
   ```sh
   python -m backend
   ```
5. **Start the frontend:**
   ```sh
   cd frontend
   npm start
   ```

For full setup, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) and [DOCKER_README.md](./DOCKER_README.md).

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE) (add your license file if needed)

---

_Empower your team to make faster, smarter talent decisions with TalentVibe._
