# Academic Project Report

## Title
Evaluating Academic & Employment Potential using Artificial Neural Networks (MLP) with API Integration

## 1. Introduction
The project predicts employment potential and career readiness from student academic and skill inputs. It integrates web engineering and machine learning into a deployable full-stack system.

## 2. Objectives
- Collect structured student profile features.
- Predict employability using ANN/MLP.
- Present results through a responsive frontend.
- Persist records in MongoDB and PostgreSQL.
- Provide real-time updates using Socket.IO.

## 3. Methodology
1. User submits profile data from web UI.
2. Node.js validates input, authenticates user (JWT), and forwards payload to ML API.
3. FastAPI serves MLP prediction outputs.
4. Backend stores prediction in MongoDB + PostgreSQL.
5. Frontend fetches and displays results; sockets broadcast live updates.

## 4. Architecture
- **Frontend:** HTML/CSS/JS.
- **Backend:** Express REST API + middleware + JWT + Socket.IO.
- **ML Service:** Python FastAPI with scikit-learn MLP model.
- **Databases:** MongoDB (document history), PostgreSQL via Prisma (structured records).

## 5. Model Details
- Features: academic score, skills rating, project count, internship experience, communication skills.
- Algorithm: MLPRegressor (ANN).
- Preprocessing: StandardScaler.
- Evaluation: MAE and R² on held-out test set.

## 6. Results
Outputs include:
- Employment Probability (0–100%)
- Career Readiness Score
- Optional LLM-assisted explanation/career suggestions.

## 7. Syllabus Mapping
- **Advanced Web Dev:** Node.js/Express, APIs, JWT, MongoDB, PostgreSQL, deployment, LLM integration.
- **Frontend Dev:** semantic HTML, responsive CSS, JS async programming, DOM handling.

## 8. Conclusion
The system demonstrates a complete and practical academic-to-industry pipeline combining full-stack engineering and ANN-based prediction, suitable for major project evaluation.
