from __future__ import annotations

import numpy as np
from fastapi import FastAPI

from .model import calculate_readiness, load_model
from .schemas import PredictInput, PredictResponse

app = FastAPI(title="Academic Check ML API", version="1.0.0")
model = load_model()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictInput) -> PredictResponse:
    features = np.array(
        [
            payload.academicScore,
            payload.skillsRating,
            payload.projectsCount,
            payload.internshipExperience,
            payload.communicationSkills,
        ],
        dtype=float,
    )

    employment_probability = float(np.clip(model.predict([features])[0], 0, 100))
    employment_probability = round(employment_probability, 2)
    readiness = calculate_readiness(features, employment_probability)

    explanation = (
        "Strong fundamentals with balanced academics and practical indicators."
        if employment_probability >= 70
        else "Improve projects, internships, and communication to improve placement confidence."
    )

    return PredictResponse(
        employment_probability=employment_probability,
        career_readiness_score=readiness,
        explanation=explanation,
    )
