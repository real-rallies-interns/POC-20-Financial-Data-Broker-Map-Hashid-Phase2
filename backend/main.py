from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Real Rails Data Lineage API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

def generate_synthetic_lineage() -> dict:
    nodes = [
        {"id": "bank_wells", "label": "Wells Fargo", "type": "Bank", "risk_level": "Low"},
        {"id": "bank_chase", "label": "Chase Bank", "type": "Bank", "risk_level": "Low"},
        {"id": "bank_citi", "label": "CitiBank", "type": "Bank", "risk_level": "Low"},
        {"id": "bank_bofa", "label": "Bank of America", "type": "Bank", "risk_level": "Low"},
        {"id": "agg_plaid", "label": "Plaid", "type": "Aggregator", "risk_level": "Medium"},
        {"id": "agg_yodlee", "label": "Yodlee", "type": "Aggregator", "risk_level": "Medium"},
        {"id": "app_mint", "label": "Mint", "type": "App", "risk_level": "Low"},
        {"id": "app_robinhood", "label": "Robinhood", "type": "App", "risk_level": "Low"},
        {"id": "broker_acxiom", "label": "Acxiom", "type": "Broker", "risk_level": "High"},
        {"id": "bureau_experian", "label": "Experian", "type": "Bureau", "risk_level": "Medium"},
    ]
    
    edges = [
        {"id": "e7", "source": "bank_wells", "target": "agg_plaid", "permission": "Account Balances", "risk_level": "Medium"},
        {"id": "e1", "source": "bank_chase", "target": "agg_plaid", "permission": "Full Transaction History", "risk_level": "Medium"},
        {"id": "e8", "source": "bank_citi", "target": "agg_yodlee", "permission": "Transaction Feeds", "risk_level": "Medium"},
        {"id": "e2", "source": "bank_bofa", "target": "agg_yodlee", "permission": "Identity + Transactions", "risk_level": "Medium"},
        {"id": "e3", "source": "agg_plaid", "target": "app_mint", "permission": "Read-only Transactions", "risk_level": "Low"},
        {"id": "e4", "source": "agg_yodlee", "target": "app_robinhood", "permission": "Identity Only", "risk_level": "Low"},
        {"id": "e5", "source": "agg_plaid", "target": "broker_acxiom", "permission": "Anonymized Spends (Secondary)", "risk_level": "High"},
        {"id": "e6", "source": "agg_yodlee", "target": "bureau_experian", "permission": "Credit Reporting", "risk_level": "Medium"},
    ]
    
    return {"nodes": nodes, "edges": edges}

@app.get("/api/lineage", response_model=GraphData)
def get_data_lineage():
    return generate_synthetic_lineage()
