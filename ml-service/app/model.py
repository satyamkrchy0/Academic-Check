from __future__ import annotations

from pathlib import Path
import joblib
import numpy as np
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

MODEL_DIR = Path(__file__).resolve().parents[1] / "models"
MODEL_PATH = MODEL_DIR / "employment_mlp.joblib"


def build_default_pipeline(random_state: int = 42) -> Pipeline:
    return Pipeline(
        [
            ("scaler", StandardScaler()),
            (
                "mlp",
                MLPRegressor(
                    hidden_layer_sizes=(16, 8),
                    activation="relu",
                    solver="adam",
                    learning_rate_init=0.01,
                    max_iter=2000,
                    random_state=random_state,
                ),
            ),
        ]
    )


def save_model(model: Pipeline) -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)


def load_model() -> Pipeline:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Model file not found. Run train.py first.")
    return joblib.load(MODEL_PATH)


def calculate_readiness(features: np.ndarray, employment_probability: float) -> float:
    normalized = np.array(
        [
            features[0] / 100.0,
            features[1] / 10.0,
            min(features[2], 10) / 10.0,
            min(features[3], 5) / 5.0,
            features[4] / 10.0,
        ]
    )
    weighted_score = np.dot(normalized, np.array([0.30, 0.25, 0.20, 0.10, 0.15])) * 100
    return float(round((weighted_score * 0.5) + (employment_probability * 0.5), 2))
