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
    <div className={`px-5 py-3 rounded-xl border backdrop-blur-md ${data.risk_level === 'High' ? 'border-red-500/50 bg-[#0b1117]/90 shadow-[0_0_20px_rgba(239,68,68,0.3)]' :
      data.risk_level === 'Medium' ? 'border-amber-500/50 bg-[#0b1117]/90 shadow-[0_0_20px_rgba(245,158,11,0.3)]' :
        'border-blue-500/40 bg-[#0b1117]/90 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
      } transition-all duration-300 min-w-[150px] relative`}>
      
      <div className={`absolute inset-0 rounded-xl opacity-50 pointer-events-none ${data.risk_level === 'High' ? 'shadow-[inset_0_0_15px_rgba(239,68,68,0.4)]' :
        data.risk_level === 'Medium' ? 'shadow-[inset_0_0_15px_rgba(245,158,11,0.4)]' :
          'shadow-[inset_0_0_15px_rgba(56,189,248,0.4)]'
        }`} />

      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-[#38BDF8] !border-none shadow-[0_0_10px_#38BDF8]" />
      <div className="flex flex-col relative z-10">
        <span className={`text-[10px] font-extrabold uppercase tracking-[0.2em] ${data.risk_level === 'High' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]' :
          data.risk_level === 'Medium' ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' :
            'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]'
          }`}>{data.type}</span>
        <span className="text-sm font-black text-gray-100 mt-1 tracking-wide uppercase">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-[#38BDF8] !border-none shadow-[0_0_10px_#38BDF8]" />
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
      opacity: 0.8,
      filter: `drop-shadow(0 0 5px ${edge.risk_level === 'High' ? '#ef4444' : edge.risk_level === 'Medium' ? '#f59e0b' : '#38BDF8'})`
    },
    labelStyle: { fill: '#94a3b8', fontWeight: 700, fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase' },
    labelBgStyle: { fill: '#030712', fillOpacity: 0.95, stroke: '#1f2937', strokeWidth: 1 },
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
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
    <div className="flex h-screen w-full bg-[#02040a] text-gray-100 font-sans overflow-hidden selection:bg-blue-500/30">

      <div className="w-[70%] h-full relative border-r border-gray-800/80 shadow-[10px_0_30px_rgba(0,0,0,0.8)] z-0">

        <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none flex justify-between items-start">
          <div className="backdrop-blur-md bg-[#0b1117]/80 border border-gray-800 p-5 rounded-xl pointer-events-auto shadow-[0_0_20px_rgba(0,0,0,0.6)]">
            <h1 className="text-xl font-black tracking-[0.15em] bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              REAL RAILS
            </h1>
            <p className="text-gray-400 text-[10px] mt-2 uppercase tracking-[0.2em] font-bold">Financial Data Broker Map // Phase 2</p>
          </div>

          <div className="pointer-events-auto">
            <div className="flex items-center gap-3 backdrop-blur-md bg-[#0b1117]/80 border border-gray-800 px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest shadow-[0_0_20px_rgba(0,0,0,0.6)]">
              <span className={`w-2.5 h-2.5 rounded-full ${dataSource === 'Live API' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'}`}></span>
              <span className="text-gray-300 uppercase font-mono">SYS_STATUS: {dataSource}</span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-[#02040a]">
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
              className="bg-[#02040a]"
            >
              <Background color="#1f2937" gap={24} size={1.5} className="opacity-50" />
              <Controls className="!bg-[#0b1117]/90 !border-gray-800 !fill-gray-400 !rounded-lg overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md" />
            </ReactFlow>
          )}
        </div>

        <div className="absolute bottom-6 left-6 z-10 backdrop-blur-md bg-[#0b1117]/80 border border-gray-800 rounded-xl p-5 pointer-events-auto min-w-[220px] shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          <h3 className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em] border-b border-gray-800/80 pb-2">Risk Architecture</h3>
          <div className="space-y-3.5 text-[10px] font-bold tracking-widest">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#0b1117] border-[2px] border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
              <span className="text-gray-300 uppercase">STANDARD RAIL</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#0b1117] border-[2px] border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]"></div>
              <span className="text-gray-300 uppercase">MEDIUM RISK NODE</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#0b1117] border-[2px] border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
              <span className="text-gray-300 uppercase">HIGH RISK RESELLER</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[30%] h-full backdrop-blur-md bg-[#0b1117]/80 border-l border-gray-800 flex flex-col relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">

        <div className="p-7 pb-6 border-b border-gray-800/80 shrink-0">
          <h2 className="text-[10px] font-black text-blue-400 mb-2 uppercase tracking-[0.2em] flex items-center gap-2 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]">
            <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
            SYSTEM_INTELLIGENCE
          </h2>
          <div className="text-2xl font-black tracking-wider text-gray-100 uppercase">Lineage Metrics</div>
          <div className="flex items-end gap-3 mt-5 bg-[#030712]/80 border border-gray-800/80 p-5 rounded-xl shadow-[inset_0_4px_20px_rgba(0,0,0,0.4)]">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-mono tracking-tighter drop-shadow-lg">{nodes.length}</div>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-1.5">ACTIVE NODES TRACKED</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-7 flex flex-col gap-8">

          <div>
            <h3 className="text-[10px] font-black text-gray-400 mb-3 flex items-center gap-2.5 uppercase tracking-[0.2em]">
              <Info className="w-4 h-4 text-indigo-400" />
              OPERATIONAL IMPACT
            </h3>
            <div className="bg-[#030712]/60 rounded-xl p-5 border border-gray-800/60 shadow-inner">
              <p className="text-[11px] text-gray-300 leading-relaxed font-semibold tracking-wide">
                Data is the New Collateral. If you lose control of your data, you lose control of your financial reputation.
                Once consent is granted, data enters a complex web of Aggregators, Brokers, and Resellers. This "Data Sprawl" makes it nearly impossible to know who currently holds your sensitive financial history.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-gray-400 mb-3 flex items-center gap-2.5 uppercase tracking-[0.2em]">
              <Database className="w-4 h-4 text-indigo-400" />
              GOVERNANCE FRAMEWORK
            </h3>
            <div className="bg-[#030712]/60 rounded-xl p-5 border border-gray-800/60 shadow-inner">
              <p className="text-[11px] text-gray-300 leading-relaxed font-semibold tracking-wide">
                The Consumer Financial Protection Bureau (CFPB), specifically through Section 1033 of the Dodd-Frank Act, and GDPR/DPDP frameworks govern data portability, permission chains, and the fundamental right to deletion.
              </p>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-[10px] font-black text-gray-400 mb-3 flex items-center gap-2.5 uppercase tracking-[0.2em]">
              <AlertTriangle className="w-4 h-4 text-indigo-400" />
              ACTIVE NODE METADATA
            </h3>

            {selectedNode ? (
              <div className={`rounded-xl p-6 border transition-all duration-300 ${selectedNode.risk_level === 'High' ? 'bg-[#110c0c]/80 border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.2)]' :
                selectedNode.risk_level === 'Medium' ? 'bg-[#14120c]/80 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]' :
                  'bg-[#030712]/80 border-blue-500/40 shadow-[0_0_25px_rgba(56,189,248,0.15)]'
                }`}>
                <div className="flex justify-between items-start border-b border-gray-800/80 pb-4">
                  <div>
                    <h4 className="text-lg font-black text-gray-100 tracking-wide uppercase">{selectedNode.label}</h4>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mt-1 block">[{selectedNode.type} NODE]</span>
                  </div>
                  <span className={`px-3 py-1.5 text-[9px] font-black rounded-md tracking-[0.15em] ${selectedNode.risk_level === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
                    selectedNode.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.4)]' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                    }`}>
                    {selectedNode.risk_level} RISK
                  </span>
                </div>

                <div className="space-y-4 mt-5">
                  <div className="flex justify-between text-[11px] font-bold tracking-wide">
                    <span className="text-gray-500 uppercase">ACCESS SCOPE:</span>
                    <span className="text-gray-200 text-right uppercase">
                      {selectedNode.type === 'Bank' ? 'SOURCE OF TRUTH' :
                        selectedNode.type === 'Broker' ? 'ANONYMIZED TRACKING' :
                          'DELEGATED ACCESS'}
                    </span>
                  </div>
                  {selectedNode.risk_level === 'High' && (
                    <div className="mt-5 text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-950/40 p-4 rounded-lg border border-red-500/40 leading-relaxed shadow-[inset_0_0_10px_rgba(239,68,68,0.2)] flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>WARNING: SECONDARY CONSENT REQUIRED FOR DATA RESALE. CHECK GDPR COMPLIANCE.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-36 rounded-xl border border-dashed border-gray-700/60 flex items-center justify-center p-6 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-[#030712]/40 shadow-inner">
                SELECT AN ACTIVE TELEMETRY NODE TO INSPECT LIVE LEDGER INSIGHTS.
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800/80">
            <button className="w-full py-4 bg-[#0b1117] hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white border border-gray-700 hover:border-transparent text-gray-300 rounded-xl text-[10px] font-black tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300 uppercase">
              <Download className="w-4 h-4" />
              DOWNLOAD SYSTEM MANIFEST
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}