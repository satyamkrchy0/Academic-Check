# Evaluating Academic & Employment Potential using ANN (MLP) with API Integration

This repository now contains a complete full-stack academic project aligned with:

- **Advanced Web Development**: Node.js, Express, MongoDB, PostgreSQL (Prisma), APIs, JWT auth, Socket.IO, deployment-ready setup, optional LLM integration.
- **Frontend Web Development**: HTML5, CSS3 (Flex/Grid), JavaScript (DOM/events/async-await/Fetch API).

## 1) Complete Project Folder Structure

```text
Academic-Check/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/{auth,errorHandler,notFound,validateRequest}.js
│   │   ├── models/{User,Prediction}.js
│   │   ├── routes/{healthRoutes,authRoutes,predictRoutes}.js
│   │   ├── services/{mlClient,predictionService}.js
│   │   ├── utils/jwt.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/predict.test.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── ml-service/
│   ├── app/{main.py,model.py,schemas.py}
│   ├── models/employment_mlp.joblib
│   ├── tests/test_api.py
│   ├── requirements.txt
│   └── train.py
├── docs/project-report.md
└── postman/Academic-Check.postman_collection.json
```

## 2) Step-by-step Implementation Plan

1. Train ANN model (`ml-service/train.py`) and run FastAPI model API.
2. Configure MongoDB + PostgreSQL and apply Prisma schema.
3. Start Express backend (`/api/v1` routes, JWT auth, middleware, validation).
4. Start frontend and submit prediction inputs.
5. Backend calls Python API and stores prediction history in MongoDB + PostgreSQL.
6. Observe live Socket.IO updates for new predictions.
7. Test endpoints via Postman collection and deploy services.

## 3) Machine Learning Model (ANN/MLP)

- Implemented in `ml-service/app/model.py` and `ml-service/train.py`.
- Uses `MLPRegressor` with preprocessing (`StandardScaler`) in a pipeline.
- Includes synthetic data generation, train/test split, evaluation (MAE/R²), parameterized architecture.

## 4) Node.js Backend (Express API, JWT, Middleware)

- Versioned REST API at `/api/v1/...`
- JWT auth (`/api/v1/auth/register`, `/api/v1/auth/login`)
- Prediction endpoint (`/api/v1/predict`) + history (`/api/v1/predict/history`)
- Middleware: `helmet`, `cors`, `morgan`, validation, not-found, error handling.
- Async/await used consistently.

## 5) Database Schema (MongoDB + PostgreSQL)

- MongoDB Mongoose models:
  - `User`: account details with password hash.
  - `Prediction`: request payload + output + PostgreSQL record reference.
- PostgreSQL Prisma model:
  - `PredictionRecord` for structured prediction analytics and audit data.

## 6) Frontend (HTML, CSS, JS)

- Semantic HTML sections and forms.
- Responsive CSS using Grid/Flex.
- JS handles DOM updates, event listeners, async Fetch API calls, auth token storage, and live socket events.

## 7) API Integration (Node ↔ Python)

- Implemented with Axios in `backend/src/services/mlClient.js`.
- Node backend sends feature payload to Python `/predict` and uses response in DB writes + API output.

## 8) Socket.IO Implementation

- Socket server in `backend/src/server.js` with JWT handshake auth.
- Authenticated users join a room by `userId`.
- New predictions emit `prediction:created` live event to that user.

## 9) Testing Strategy (Postman + Automated)

- Postman collection at `postman/Academic-Check.postman_collection.json`.
- Backend test: `backend/tests/predict.test.js` (auth and prediction API behavior).
- ML API test: `ml-service/tests/test_api.py`.

## 10) Deployment Guide

- **ML API (Render/Railway):** deploy `ml-service`, start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Backend (Render/Railway):** deploy `backend`, set env vars from `.env.example`, run `npm run prisma:generate` then `npm start`.
- **Frontend (Vercel/GitHub Pages):** deploy `frontend` static files; set API base URL in `app.js`.

## 11) Academic Project Report

Detailed report is available at `docs/project-report.md` with introduction, methodology, architecture, and result framing for submission.

## Quick Start

### ML Service

```bash
cd /home/runner/work/Academic-Check/Academic-Check/ml-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python train.py
uvicorn app.main:app --reload --port 8000
```

### Backend

```bash
cd /home/runner/work/Academic-Check/Academic-Check/backend
cp .env.example .env
npm install
npx prisma generate
npm run dev
```

### Frontend

Open `/home/runner/work/Academic-Check/Academic-Check/frontend/index.html` with a static server.

