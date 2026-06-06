"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Shield, AlertTriangle, Download, Info, Database, Activity } from 'lucide-react';

const MOCK_DATA = {
  nodes: [
    { "id": "bank_wells", "label": "Wells Fargo", "type": "Bank", "risk_level": "Low" },
    { "id": "bank_chase", "label": "Chase Bank", "type": "Bank", "risk_level": "Low" },
    { "id": "bank_citi", "label": "CitiBank", "type": "Bank", "risk_level": "Low" },
    { "id": "bank_bofa", "label": "Bank of America", "type": "Bank", "risk_level": "Low" },
    { "id": "agg_plaid", "label": "Plaid", "type": "Aggregator", "risk_level": "Medium" },
    { "id": "agg_yodlee", "label": "Yodlee", "type": "Aggregator", "risk_level": "Medium" },
    { "id": "app_mint", "label": "Mint", "type": "App", "risk_level": "Low" },
    { "id": "app_robinhood", "label": "Robinhood", "type": "App", "risk_level": "Low" },
    { "id": "broker_acxiom", "label": "Acxiom", "type": "Broker", "risk_level": "High" },
    { "id": "bureau_experian", "label": "Experian", "type": "Bureau", "risk_level": "Medium" }
  ],
  edges: [
    { "id": "e1", "source": "bank_chase", "target": "agg_plaid", "permission": "Full Transaction History", "risk_level": "Medium" },
    { "id": "e2", "source": "bank_bofa", "target": "agg_yodlee", "permission": "Identity + Transactions", "risk_level": "Medium" },
    { "id": "e3", "source": "agg_plaid", "target": "app_mint", "permission": "Read-only Transactions", "risk_level": "Low" },
    { "id": "e4", "source": "agg_yodlee", "target": "app_robinhood", "permission": "Identity Only", "risk_level": "Low" },
    { "id": "e5", "source": "agg_plaid", "target": "broker_acxiom", "permission": "Anonymized Spends (Secondary)", "risk_level": "High" },
    { "id": "e6", "source": "agg_yodlee", "target": "bureau_experian", "permission": "Credit Reporting", "risk_level": "Medium" },
    { "id": "e7", "source": "bank_wells", "target": "agg_plaid", "permission": "Account Balances", "risk_level": "Low" },
    { "id": "e8", "source": "bank_citi", "target": "agg_yodlee", "permission": "Transaction Feeds", "risk_level": "Medium" }
  ]
};

const CustomNode = ({ data }: any) => {
  return (
    <div className={`px-5 py-3 shadow-2xl rounded-xl border backdrop-blur-xl ${data.risk_level === 'High' ? 'border-red-500/40 bg-gradient-to-b from-[#110c0c] to-[#030712] shadow-[0_0_25px_rgba(239,68,68,0.15)]' :
      data.risk_level === 'Medium' ? 'border-amber-500/40 bg-gradient-to-b from-[#14120c] to-[#030712] shadow-[0_0_25px_rgba(245,158,11,0.1)]' :
        'border-blue-500/30 bg-gradient-to-b from-[#0c1017] to-[#030712] hover:shadow-[0_0_25px_rgba(56,189,248,0.15)]'
      } transition-all duration-300 min-w-[150px]`}>
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-[#38BDF8] !border-none" />
      <div className="flex flex-col">
        <span className={`text-[9px] font-extrabold uppercase tracking-widest ${data.risk_level === 'High' ? 'text-red-400' :
          data.risk_level === 'Medium' ? 'text-amber-400' :
            'text-blue-400'
          }`}>{data.type}</span>
        <span className="text-sm font-bold text-gray-100 mt-0.5">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-[#38BDF8] !border-none" />
    </div>
  );
};

const getLayoutedElements = (data: any) => {
  const positions: Record<string, { x: number, y: number }> = {
    'bank_wells': { x: 50, y: 0 },
    'bank_chase': { x: 50, y: 120 },
    'bank_citi': { x: 50, y: 240 },
    'bank_bofa': { x: 50, y: 360 },
    'agg_plaid': { x: 380, y: 100 },
    'agg_yodlee': { x: 380, y: 300 },
    'app_mint': { x: 720, y: 20 },
    'broker_acxiom': { x: 720, y: 180 },
    'app_robinhood': { x: 720, y: 300 },
    'bureau_experian': { x: 720, y: 420 },
  };

  const layoutedNodes = data.nodes.map((node: any) => ({
    id: node.id,
    type: 'custom',
    data: node,
    position: positions[node.id] || { x: Math.random() * 500, y: Math.random() * 500 }
  }));

  const layoutedEdges = data.edges.map((edge: any) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.permission,
    animated: edge.risk_level === 'High' || edge.risk_level === 'Medium',
    style: {
      stroke: edge.risk_level === 'High' ? '#ef4444' : edge.risk_level === 'Medium' ? '#f59e0b' : '#38BDF8',
      strokeWidth: 2,
      opacity: 0.8
    },
    labelStyle: { fill: '#94a3b8', fontWeight: 600, fontSize: 10, letterSpacing: '0.5px' },
    labelBgStyle: { fill: '#030712', fillOpacity: 0.95, stroke: '#1f2937', strokeWidth: 1 },
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 6,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: edge.risk_level === 'High' ? '#ef4444' : edge.risk_level === 'Medium' ? '#f59e0b' : '#38BDF8',
    },
  }));

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

export default function FinancialDataBrokerMap() {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState('Loading...');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiBase}/api/lineage`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(data);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setDataSource('Live API');
      } catch (error) {
        console.log('Falling back to mock data due to:', error);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(MOCK_DATA);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setDataSource('Mock Data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback((event: any, node: any) => {
    setSelectedNode(node.data);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#030712] text-gray-100 font-sans overflow-hidden">

      <div className="w-[70%] h-full relative border-r border-gray-800/60">

        <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none flex justify-between items-start">
          <div className="cinematic-card p-4 rounded-xl pointer-events-auto">
            <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-blue-500" />
              REAL RAILS
            </h1>
            <p className="text-gray-400 text-[11px] mt-1 uppercase tracking-widest font-medium">Financial Data Broker Map // Phase 2</p>
          </div>

          <div className="pointer-events-auto">
            <div className="flex items-center gap-2.5 cinematic-card px-4 py-2 rounded-xl text-xs font-bold tracking-wide">
              <span className={`w-2 h-2 rounded-full ${dataSource === 'Live API' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-gray-300 uppercase font-mono">SYS_STATUS: {dataSource}</span>
            </div>
          </div>
        </div>

        <div className="w-full h-full bg-[#030712]">
          {!isLoading && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onPaneClick={handlePaneClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-[#030712]"
            >
              <Background color="#1f2937" gap={20} size={1} className="opacity-40" />
              <Controls className="!bg-[#0b1117]/90 !border-gray-800 !fill-gray-400 !rounded-lg overflow-hidden shadow-2xl" />
            </ReactFlow>
          )}
        </div>

        <div className="absolute bottom-6 left-6 z-10 cinematic-card rounded-xl p-5 pointer-events-auto min-w-[200px]">
          <h3 className="text-[10px] font-black text-gray-400 mb-3.5 uppercase tracking-widest border-b border-gray-800 pb-1.5">Risk Architecture</h3>
          <div className="space-y-2.5 text-xs font-medium">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500/20 border border-blue-500/50"></div>
              <span className="text-gray-300">Standard Rail</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
              <span className="text-gray-300">Medium Risk Node</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <span className="text-gray-300">High Risk Reseller</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[30%] h-full bg-[#0b1117]/40 flex flex-col relative overflow-hidden backdrop-blur-md">

        <div className="p-6 pb-5 border-b border-gray-800/60 bg-[#0b1117]/80 shrink-0 z-10 shadow-xl">
          <h2 className="text-[10px] font-black text-blue-400 mb-1 uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            SYSTEM_INTELLIGENCE
          </h2>
          <div className="text-2xl font-black tracking-tight text-gray-100">Lineage Metrics</div>
          <div className="flex items-end gap-3 mt-4 bg-[#030712]/60 border border-gray-800/50 p-4 rounded-xl">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-mono tracking-tighter">{nodes.length}</div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Nodes Tracked</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          <div>
            <h3 className="text-[10px] font-black text-gray-400 mb-2.5 flex items-center gap-2 uppercase tracking-widest">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              Operational Impact
            </h3>
            <div className="bg-[#030712]/50 rounded-xl p-4 border border-gray-800/40">
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                Data is the New Collateral. If you lose control of your data, you lose control of your financial reputation.
                Once consent is granted, data enters a complex web of Aggregators, Brokers, and Resellers. This "Data Sprawl" makes it nearly impossible to know who currently holds your sensitive financial history.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-gray-400 mb-2.5 flex items-center gap-2 uppercase tracking-widest">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Governance Framework
            </h3>
            <div className="bg-[#030712]/50 rounded-xl p-4 border border-gray-800/40">
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                The Consumer Financial Protection Bureau (CFPB), specifically through Section 1033 of the Dodd-Frank Act, and GDPR/DPDP frameworks govern data portability, permission chains, and the fundamental right to deletion.
              </p>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-[10px] font-black text-gray-400 mb-2.5 flex items-center gap-2 uppercase tracking-widest">
              <AlertTriangle className="w-3.5 h-3.5 text-indigo-400" />
              Active Node Metadata
            </h3>

            {selectedNode ? (
              <div className={`rounded-xl p-5 border transition-all duration-300 ${selectedNode.risk_level === 'High' ? 'bg-red-950/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.05)]' :
                selectedNode.risk_level === 'Medium' ? 'bg-amber-950/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]' :
                  'bg-[#030712]/60 border-gray-800/80 shadow-inner'
                }`}>
                <div className="flex justify-between items-start border-b border-gray-800/60 pb-3">
                  <div>
                    <h4 className="text-base font-black text-gray-100">{selectedNode.label}</h4>
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">{selectedNode.type} Node</span>
                  </div>
                  <span className={`px-2.5 py-1 text-[9px] font-black rounded-md tracking-wider ${selectedNode.risk_level === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    selectedNode.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                    {selectedNode.risk_level} RISK
                  </span>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-500">Access Scope:</span>
                    <span className="text-gray-300 font-bold text-right">
                      {selectedNode.type === 'Bank' ? 'Source of Truth' :
                        selectedNode.type === 'Broker' ? 'Anonymized Tracking' :
                          'Delegated Access'}
                    </span>
                  </div>
                  {selectedNode.risk_level === 'High' && (
                    <div className="mt-4 text-[11px] font-semibold text-red-400 bg-red-950/20 p-3 rounded-lg border border-red-500/20 leading-relaxed animate-pulse">
                      Warning: Secondary consent required for data resale. Check GDPR compliance.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-32 rounded-xl border border-dashed border-gray-800 flex items-center justify-center p-4 text-center text-xs text-gray-500 font-medium">
                Select an active telemetry node to inspect live ledger insights.
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800/60">
            <button className="w-full py-3.5 bg-gray-800/80 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white border border-gray-700/50 hover:border-none text-gray-200 rounded-xl text-xs font-black tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all duration-300">
              <Download className="w-4 h-4" />
              DOWNLOAD SYSTEM MANIFEST
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}