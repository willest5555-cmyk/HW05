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

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Mount static images
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# Load data
DATA_FILE = os.path.join(BASE_DIR, "data.json")
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        db = json.load(f)
else:
    db = {"general": [], "topics": []}

@app.get("/api/general")
def get_general_content():
    return db["general"]

@app.get("/api/topics")
def get_topics():
    # Return just the id and title for the sidebar
    return [{"id": t["id"], "title": t["title"]} for t in db["topics"]]

@app.get("/api/topics/{topic_id}")
def get_topic(topic_id: str):
    for t in db["topics"]:
        if t["id"] == topic_id:
            return t
    raise HTTPException(status_code=404, detail="Topic not found")

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
