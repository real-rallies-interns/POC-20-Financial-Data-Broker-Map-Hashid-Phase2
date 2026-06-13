"use client";

import React, { useState, useEffect } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

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

export default function Dashboard() {
  const [nodes, setNodes] = useState<CustomNode[]>([]);
  const [edges, setEdges] = useState<CustomEdge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("Live API");

  useEffect(() => {
    fetch("http://localhost:8000/api/lineage")
      .then((res) => res.json())
      .then((data) => {
        const mappedNodes = data.nodes.map((n: any, index: number) => ({
          id: n.id,
          position: { x: 100 + (index % 3) * 250, y: 50 + Math.floor(index / 3) * 150 },
          data: { label: `${n.type}:${n.label}`, risk_level: n.risk_level, type: n.type },
          style: {
            background: "#111827",
            color: "#fff",
            border: `1px solid ${n.risk_level === "HIGH" ? "#ef4444" : n.risk_level === "MEDIUM" ? "#f59e0b" : "#3b82f6"}`,
            padding: "10px",
            borderRadius: "4px",
            fontSize: "11px",
            fontFamily: "monospace"
          }
        }));

        const mappedEdges = data.edges.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.permission,
          animated: true,
          style: { stroke: e.risk_level === "HIGH" ? "#ef4444" : "#4b5563" }
        }));

        setNodes(mappedNodes);
        setEdges(mappedEdges);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
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
      <div style={{ flex: 1, height: '100%', position: 'relative', backgroundColor: '#070e1e' }}>
        {isLoading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#6b7280' }}>
            CONNECTING TO TELEMETRY LEDGER...
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow nodes={nodes} edges={edges} fitView>
              <Background color="#222" gap={16} />
              <Controls />
              <MiniMap nodeColor={(n) => (n.style?.border as string) || '#333'} style={{ backgroundColor: '#000' }} />
            </ReactFlow>
          </div>
        )}
      </div>

    </div>
  );
}