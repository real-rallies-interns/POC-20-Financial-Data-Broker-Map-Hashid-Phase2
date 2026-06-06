import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Real Rails Data Lineage API", version="1.0")

cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000")
cors_origins = [origin.strip() for origin in cors_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Node(BaseModel):
    id: str
    label: str
    type: str # Bank, Aggregator, App, Broker, Bureau
    risk_level: str # Low, Medium, High

class Edge(BaseModel):
    id: str
    source: str
    target: str
    permission: str
    risk_level: str # Low, Medium, High

class GraphData(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

@app.get("/api/lineage", response_model=GraphData)
def get_data_lineage():
    file_path = os.path.join(os.path.dirname(__file__), 'data.json')
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)
