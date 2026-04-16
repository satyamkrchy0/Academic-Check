from __future__ import annotations

import numpy as np
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from app.model import build_default_pipeline, save_model


def synthesize_dataset(samples: int = 1200, seed: int = 42):
    rng = np.random.default_rng(seed)

    academic = rng.uniform(40, 100, samples)
    skills = rng.uniform(1, 10, samples)
    projects = rng.integers(0, 10, samples)
    internship = rng.integers(0, 5, samples)
    communication = rng.uniform(1, 10, samples)

    features = np.column_stack([academic, skills, projects, internship, communication])

    target = (
        academic * 0.35
        + skills * 4.5
        + projects * 2.8
        + internship * 4.0
        + communication * 3.2
        + rng.normal(0, 4, samples)
    )
    target = np.clip(target, 0, 100)

    return features, target


def train_model() -> dict[str, float]:
    X, y = synthesize_dataset()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = build_default_pipeline()
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    metrics = {
        "mae": float(round(mean_absolute_error(y_test, predictions), 4)),
        "r2": float(round(r2_score(y_test, predictions), 4)),
    }

    save_model(model)
    return metrics


if __name__ == "__main__":
    results = train_model()
    print(f"Training complete: {results}")
