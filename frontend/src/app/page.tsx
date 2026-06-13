"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

const Map = dynamic(() => import("./components/Map"), { ssr: false });

interface NodeData {
  label: string;
  risk_level: string;
  type: string;
}

interface CustomNode {
  id: string;
  position: { x: number; y: number };
  data: NodeData;
  style?: React.CSSProperties;
}

interface CustomEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: React.CSSProperties;
}

interface LineageNode {
  id: string;
  label: string;
  type: string;
  risk_level: string;
}

interface LineageEdge {
  id: string;
  source: string;
  target: string;
  permission: string;
  risk_level: string;
}

interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

interface MapPlant {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  status: string;
  capacity_mw: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const MOCK_GRAPH: LineageGraph = {
  nodes: [
    { id: "bank_wells", label: "Wells Fargo", type: "Bank", risk_level: "Low" },
    { id: "bank_chase", label: "Chase Bank", type: "Bank", risk_level: "Low" },
    { id: "bank_citi", label: "CitiBank", type: "Bank", risk_level: "Low" },
    { id: "bank_bofa", label: "Bank of America", type: "Bank", risk_level: "Low" },
    { id: "agg_plaid", label: "Plaid", type: "Aggregator", risk_level: "Medium" },
    { id: "agg_yodlee", label: "Yodlee", type: "Aggregator", risk_level: "Medium" },
    { id: "app_mint", label: "Mint", type: "App", risk_level: "Low" },
    { id: "app_robinhood", label: "Robinhood", type: "App", risk_level: "Low" },
    { id: "broker_acxiom", label: "Acxiom", type: "Broker", risk_level: "High" },
    { id: "bureau_experian", label: "Experian", type: "Bureau", risk_level: "Medium" },
  ],
  edges: [
    { id: "e7", source: "bank_wells", target: "agg_plaid", permission: "Account Balances", risk_level: "Medium" },
    { id: "e1", source: "bank_chase", target: "agg_plaid", permission: "Full Transaction History", risk_level: "Medium" },
    { id: "e8", source: "bank_citi", target: "agg_yodlee", permission: "Transaction Feeds", risk_level: "Medium" },
    { id: "e2", source: "bank_bofa", target: "agg_yodlee", permission: "Identity + Transactions", risk_level: "Medium" },
    { id: "e3", source: "agg_plaid", target: "app_mint", permission: "Read-only Transactions", risk_level: "Low" },
    { id: "e4", source: "agg_yodlee", target: "app_robinhood", permission: "Identity Only", risk_level: "Low" },
    { id: "e5", source: "agg_plaid", target: "broker_acxiom", permission: "Anonymized Spends (Secondary)", risk_level: "High" },
    { id: "e6", source: "agg_yodlee", target: "bureau_experian", permission: "Credit Reporting", risk_level: "Medium" },
  ],
};

const NODE_COORDS: Record<string, { lat: number; lng: number }> = {
  bank_wells: { lat: 37.7749, lng: -122.4194 },
  bank_chase: { lat: 40.7128, lng: -74.006 },
  bank_citi: { lat: 40.756, lng: -73.969 },
  bank_bofa: { lat: 35.2271, lng: -80.8431 },
  agg_plaid: { lat: 37.7899, lng: -122.3969 },
  agg_yodlee: { lat: 37.4852, lng: -122.2364 },
  app_mint: { lat: 37.4529, lng: -122.1817 },
  app_robinhood: { lat: 37.4521, lng: -122.1787 },
  broker_acxiom: { lat: 35.0887, lng: -92.4421 },
  bureau_experian: { lat: 33.6633, lng: -117.8828 },
};

function riskBorderColor(riskLevel: string): string {
  if (riskLevel === "HIGH" || riskLevel === "High") return "#ef4444";
  if (riskLevel === "MEDIUM" || riskLevel === "Medium") return "#f59e0b";
  return "#3b82f6";
}

function riskToStatus(riskLevel: string): string {
  if (riskLevel === "HIGH" || riskLevel === "High") return "Offline";
  if (riskLevel === "MEDIUM" || riskLevel === "Medium") return "Maintenance";
  return "Operational";
}

function mapLineageToFlow(data: LineageGraph): { nodes: CustomNode[]; edges: CustomEdge[] } {
  const nodes = data.nodes.map((n, index) => ({
    id: n.id,
    position: { x: 100 + (index % 3) * 250, y: 50 + Math.floor(index / 3) * 150 },
    data: { label: `${n.type}:${n.label}`, risk_level: n.risk_level, type: n.type },
    style: {
      background: "#111827",
      color: "#fff",
      border: `1px solid ${riskBorderColor(n.risk_level)}`,
      padding: "10px",
      borderRadius: "4px",
      fontSize: "11px",
      fontFamily: "monospace",
    },
  }));

  const edges = data.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.permission,
    animated: true,
    style: { stroke: e.risk_level === "HIGH" || e.risk_level === "High" ? "#ef4444" : "#4b5563" },
  }));

  return { nodes, edges };
}

function mapNodesToPlants(nodes: LineageNode[]): MapPlant[] {
  return nodes.map((n) => {
    const coords = NODE_COORDS[n.id] ?? { lat: 38.0, lng: -97.0 };
    return {
      id: n.id,
      name: n.label,
      lat: coords.lat,
      lng: coords.lng,
      type: n.type,
      status: riskToStatus(n.risk_level),
      capacity_mw: 100,
    };
  });
}

function applyLineageData(
  data: LineageGraph,
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>,
  setEdges: React.Dispatch<React.SetStateAction<CustomEdge[]>>,
  setPlants: React.Dispatch<React.SetStateAction<MapPlant[]>>,
) {
  const { nodes, edges } = mapLineageToFlow(data);
  setNodes(nodes);
  setEdges(edges);
  setPlants(mapNodesToPlants(data.nodes));
}

export default function Dashboard() {
  const [nodes, setNodes] = useState<CustomNode[]>([]);
  const [edges, setEdges] = useState<CustomEdge[]>([]);
  const [plants, setPlants] = useState<MapPlant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("Live API");

  useEffect(() => {
    fetch(`${API_URL}/api/lineage`)
      .then((res) => {
        if (!res.ok) throw new Error(`API responded with ${res.status}`);
        return res.json();
      })
      .then((data: LineageGraph) => {
        applyLineageData(data, setNodes, setEdges, setPlants);
        setStatus("Live API");
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        applyLineageData(MOCK_GRAPH, setNodes, setEdges, setPlants);
        setStatus("Mock Data");
        setIsLoading(false);
      });
  }, []);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000', color: '#fff', fontFamily: 'monospace' }}>
      
      {/* LEFT SIDEBAR */}
      <div style={{ width: '400px', height: '100%', overflowY: 'auto', borderRight: '1px solid #1f2937', padding: '24px', backgroundColor: '#020813', boxSizing: 'border-box', zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px', color: '#3b82f6', margin: 0 }}>Infocreon Internship - Financial Data Broker Map</h1>
          <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>Phase 3</p>
          <div style={{ marginTop: '12px', display: 'inline-block', backgroundColor: '#111827', color: '#34d399', fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #065f46' }}>
            SYS_STATUS: {status}
          </div>
        </div>

        <hr style={{ borderColor: '#1f2937', margin: '24px 0' }} />

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 8px 0' }}>⚡ Risk Architecture</h2>
          <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
            <p style={{ color: '#60a5fa', margin: 0 }}>● STANDARD RAIL</p>
            <p style={{ color: '#fbbf24', margin: 0 }}>● MEDIUM RISK NODE</p>
            <p style={{ color: '#f87171', margin: 0 }}>● HIGH RISK RESELLER</p>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 4px 0' }}>📉 System Intelligence</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{nodes.length}</p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>ACTIVE NODES TRACKED</p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 4px 0' }}>ℹ️ Operational Impact</h2>
          <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', margin: 0 }}>
            Data is the New Collateral. If you lose control of your data, you lose control of your financial reputation.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 4px 0' }}>🗄️ Governance Framework</h2>
          <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', margin: 0 }}>
            The Consumer Financial Protection Bureau (CFPB), specifically through Section 1033 of the Dodd-Frank Act.
          </p>
        </div>
      </div>

      {/* RIGHT CANVAS AREA */}
      <div style={{ flex: 1, height: '100%', position: 'relative', backgroundColor: '#070e1e', display: 'flex', flexDirection: 'column' }}>
        {isLoading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#6b7280' }}>
            CONNECTING TO TELEMETRY LEDGER...
          </div>
        ) : (
          <>
            <div style={{ flex: '1 1 55%', minHeight: 0 }}>
              <ReactFlow nodes={nodes} edges={edges} fitView>
                <Background color="#222" gap={16} />
                <Controls />
                <MiniMap nodeColor={(n) => (n.style?.border as string) || '#333'} style={{ backgroundColor: '#000' }} />
              </ReactFlow>
            </div>
            <div style={{ flex: '1 1 45%', minHeight: 0, borderTop: '1px solid #1f2937' }}>
              <Map plants={plants} />
            </div>
          </>
        )}
      </div>

    </div>
  );
}
