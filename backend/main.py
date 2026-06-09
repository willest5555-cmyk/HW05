from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os

app = FastAPI(title="ML Algorithms API")

# Setup CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



from crisp_dm_engine import run_pipeline

class GenericParams(BaseModel):
    # Common
    n: int = 100
    noise: float = 0.1
    random_seed: int = 42
    
    # Linear Regression (Topic 1)
    a: float = 2.5
    b: float = 10.0
    var: float = 50.0
    
    # Classification / specific
    C: float = 1.0
    max_depth: int = 5
    n_estimators: int = 50
    n_neighbors: int = 5
    kernel: str = 'rbf'
    hidden_size: int = 50
    
    # K-Means (Topic 8)
    k: int = 3
    cluster_std: float = 1.0
    
    # PCA (Topic 9)
    n_components: int = 2

@app.post("/api/interactive/{topic_id}")
def interactive_algorithm(topic_id: str, params: GenericParams):
    try:
        # Convert pydantic model to dict
        result = run_pipeline(topic_id, params.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Welcome to ML Algorithms API"}
