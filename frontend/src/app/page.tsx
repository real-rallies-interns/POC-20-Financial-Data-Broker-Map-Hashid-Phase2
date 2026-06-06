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
import { Shield, AlertTriangle, Download, Info, Database } from 'lucide-react';

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
    <div className={`px-4 py-2 shadow-lg rounded-md border backdrop-blur-md ${data.risk_level === 'High' ? 'border-red-500/50 bg-[#0B1117]/80 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
      data.risk_level === 'Medium' ? 'border-yellow-500/50 bg-[#0B1117]/80' :
        'border-[#1F2937] bg-[#0B1117]/80 hover:shadow-[0_0_10px_rgba(56,189,248,0.2)]'
      } transition-all duration-300`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-[#38BDF8]" />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{data.type}</span>
        <span className="text-sm font-semibold text-white">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-[#38BDF8]" />
    </div>
  );
};


const getLayoutedElements = (data: any) => {
  const positions: Record<string, { x: number, y: number }> = {
    'bank_wells': { x: 50, y: 0 },
    'bank_chase': { x: 50, y: 100 },
    'bank_citi': { x: 50, y: 200 },
    'bank_bofa': { x: 50, y: 300 },
    'agg_plaid': { x: 350, y: 100 },
    'agg_yodlee': { x: 350, y: 300 },
    'app_mint': { x: 700, y: 20 },
    'broker_acxiom': { x: 700, y: 180 },
    'app_robinhood': { x: 700, y: 280 },
    'bureau_experian': { x: 700, y: 400 },
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
    animated: edge.risk_level === 'High',
    style: { stroke: edge.risk_level === 'High' ? '#ef4444' : '#38BDF8', strokeWidth: 2 },
    labelStyle: { fill: '#818CF8', fontWeight: 600, fontSize: 11, letterSpacing: '0.5px' },
    labelBgStyle: { fill: '#0B1117', fillOpacity: 0.9, stroke: '#1F2937' },
    labelBgPadding: [4, 4],
    labelBgBorderRadius: 4,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: edge.risk_level === 'High' ? '#ef4444' : '#38BDF8',
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
    <div className="flex h-screen w-full bg-[#030712] text-white font-sans overflow-hidden">

      {/* MAIN STAGE (70%) */}
      <div className="w-[70%] h-full relative border-r border-[#1F2937]">
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#38BDF8]" />
              Real Rails: Financial Data Broker Map
            </h1>
            <p className="text-slate-400 text-sm mt-1">Tracking Financial Data Lineage & Permissions</p>
          </div>
          <div className="pointer-events-auto">
            <div className="flex items-center gap-2 bg-[#0B1117] border border-[#1F2937] px-3 py-1.5 rounded-full text-xs font-semibold">
              <span className={`w-2 h-2 rounded-full ${dataSource === 'Live API' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
              <span className="text-slate-300">Data: {dataSource}</span>
            </div>
          </div>
        </div>

        {/* Graph Area */}
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
              <Background color="#1F2937" gap={16} size={1} />
              <Controls className="!bg-[#0B1117] !border-[#1F2937] !fill-slate-400" />
            </ReactFlow>
          )}
        </div>

        {/* Interactive Legend */}
        <div className="absolute bottom-6 left-6 z-10 bg-[#0B1117]/80 backdrop-blur-md border border-[#1F2937] rounded-lg p-4 pointer-events-auto">
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Risk Legend</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#0B1117] border border-[#1F2937]"></div><span className="text-slate-300">Standard Node</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-950/50 border border-yellow-500/50"></div><span className="text-slate-300">Medium Risk (Aggregator)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-950/50 border border-red-500/50"></div><span className="text-slate-300">High Risk (Reseller/Broker)</span></div>
          </div>
        </div>
      </div>

      {/* INTELLIGENCE SIDEBAR (30%) */}
      <div className="w-[30%] h-full bg-[#0B1117] flex flex-col relative overflow-hidden">

        {/* Section A: Title & High-level Metric (Sticky Header) */}
        <div className="p-6 pb-4 border-b border-[#1F2937] bg-[#0B1117] shrink-0 z-10 shadow-md">
          <h2 className="text-xs font-bold text-[#38BDF8] mb-2 uppercase tracking-widest">Intelligence Summary</h2>
          <div className="text-3xl font-light tracking-tight mb-2">Financial Data Broker Map</div>
          <div className="flex items-end gap-3 mt-4">
            <div className="text-5xl font-bold text-white">{nodes.length}</div>
            <div className="text-sm text-slate-400 mb-1">Active Vendor Nodes in Lineage</div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">

          {/* Section B: "Why This Matters" */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#818CF8]" />
              WHY THIS MATTERS
            </h3>
            <div className="bg-[#030712] rounded-lg p-4 border border-[#1F2937]">
              <p className="text-sm text-slate-300 leading-relaxed">
                Data is the New Collateral. If you lose control of your data, you lose control of your financial reputation.
                Once consent is granted, data enters a complex web of Aggregators, Brokers, and Resellers. This "Data Sprawl" makes it nearly impossible to know who currently holds your sensitive financial history.
              </p>
            </div>
          </div>

          {/* Section C: "Who Controls the Rail" */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#818CF8]" />
              WHO CONTROLS THE RAIL
            </h3>
            <div className="bg-[#030712] rounded-lg p-4 border border-[#1F2937]">
              <p className="text-sm text-slate-300 leading-relaxed">
                The Consumer Financial Protection Bureau (CFPB), specifically through Section 1033 of the Dodd-Frank Act, and GDPR/DPDP frameworks govern data portability, permission chains, and the fundamental right to deletion.
              </p>
            </div>
          </div>

          {/* Section D: Functional Filters / Selected Node Insights */}
          <div className="mb-auto flex-1">
            <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#818CF8]" />
              NODE INSIGHTS
            </h3>

            {selectedNode ? (
              <div className={`rounded-lg p-4 border ${selectedNode.risk_level === 'High' ? 'bg-red-950/10 border-red-500/30' : 'bg-[#030712] border-[#1F2937]'
                }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-white">{selectedNode.label}</h4>
                    <span className="text-xs text-[#38BDF8]">{selectedNode.type} Node</span>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded ${selectedNode.risk_level === 'High' ? 'bg-red-500/20 text-red-400' :
                    selectedNode.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                    {selectedNode.risk_level} RISK
                  </span>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Access Scope:</span>
                    <span className="text-slate-300 font-medium text-right">
                      {selectedNode.type === 'Bank' ? 'Source of Truth' :
                        selectedNode.type === 'Broker' ? 'Anonymized Tracking' :
                          'Delegated Access'}
                    </span>
                  </div>
                  {selectedNode.risk_level === 'High' && (
                    <div className="mt-4 text-xs text-red-400 bg-red-950/20 p-2 rounded border border-red-500/20">
                      Warning: Secondary consent required for data resale. Check GDPR compliance.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-32 rounded-lg border border-dashed border-[#1F2937] flex items-center justify-center text-sm text-slate-500">
                Select a node in the map to view lineage details.
              </div>
            )}
          </div>

          {/* Section E: Download Sample Data */}
          <div className="mt-6 pt-6 border-t border-[#1F2937]">
            <button className="w-full py-3 bg-[#1F2937] hover:bg-[#38BDF8] hover:text-[#030712] text-white rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300">
              <Download className="w-4 h-4" />
              DOWNLOAD SAMPLE DATA
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
