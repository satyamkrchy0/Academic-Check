from pydantic import BaseModel, Field


class PredictInput(BaseModel):
    academicScore: float = Field(ge=0, le=100)
    skillsRating: float = Field(ge=0, le=10)
    projectsCount: int = Field(ge=0, le=20)
    internshipExperience: int = Field(ge=0, le=5)
    communicationSkills: float = Field(ge=0, le=10)


class PredictResponse(BaseModel):
    employment_probability: float
    career_readiness_score: float
    explanation: str
