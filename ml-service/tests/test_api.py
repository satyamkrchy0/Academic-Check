from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_health():
    response = client.get('/health')
    assert response.status_code == 200


def test_predict():
    payload = {
        'academicScore': 85,
        'skillsRating': 8,
        'projectsCount': 4,
        'internshipExperience': 1,
        'communicationSkills': 8,
    }
    response = client.post('/predict', json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0 <= data['employment_probability'] <= 100
