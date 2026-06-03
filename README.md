# Real Rails: Intelligence Dashboard & Data Sovereignty Map 
## Open Banking Data Lineage (PoC #20) & Infrastructure Intelligence

A production-grade, full-stack administrative dashboard designed under strict **Obsidian Black (`#030712`)** design parameters. This application serves a dual architectural purpose: visualizing complex transactional data sovereignty lineage paths within Open Banking frameworks, and tracking geographically-dispersed energy infrastructure assets in real time.

---

## 🚀 Key System Features & Code Architecture

### 1. Spec-Driven Core API Layer (`FastAPI` & `Pydantic`)
Powered by a high-performance Python backend managing structure validation and topological data serialization.
- **Dynamic Ingestion Endpoint:** Exposes a validated JSON payload via the `/api/lineage` route.
- **Strict Schema Enforcement:** Uses typed Pydantic models (`Node`, `Edge`, and `GraphData`) to categorize data entities into 5 industry segments (`Bank`, `Aggregator`, `App`, `Broker`, `Bureau`) with corresponding compliance risk tags (`Low`, `Medium`, `High`).
- **Resilient Fallback Middleware:** The React frontend automatically intercepts API connection timeouts or offline microservices, seamlessly downgrading to an internal static **Mock Data Engine** to prevent application crashes.

### 2. Relational Network Flow Layer (`React Flow`)
Occupies 70% of the primary dashboard canvas, rendering clear data provenance tracking.
- **Custom Backdrop Node Components:** Uses customized HTML injection handles (`#38BDF8`) wrapped in Tailwind glassmorphism effects to represent individual financial groups.
- **Live Risk Animation Vectoring:** Connections linked to `High Risk` secondary markets (such as data resellers or aggregators with excessive privilege scopes) are programmatically highlighted with **animated red connection vectors (`#ef4444`)** to alert compliance teams.
- **30% Telemetry Sidebar:** Features a sticky metric tracker indexing active node counts, consumer rights insights (CFPB Section 1033 / GDPR mandates), and dynamically mounts detailed risk logs whenever an operator clicks a node.

### 3. Geospatial Telemetry Visualizer (`React Leaflet`)
An enterprise-grade geographic map configured for zero-margin custom container overlays.
- **Adaptive Base Tiles:** Integrates a dark-mode geographical template leveraging CartoDB (`dark_all`).
- **Color-Coded Status Pins:** Uses a programmatic Leaflet `divIcon` layer to render asset markers based on active capacity and real-time operational state:
  - 🟢 **Green:** Renewable Energy Assets
  - 🟣 **Indigo:** Carbon-intensive Energy (Coal, Gas)
  - 🟡 **Yellow:** Assets undergoing System Maintenance
  - 🔴 **Red:** Critical Offline Infrastructure
- **Automated Viewports:** Features a custom `MapUpdater` child hook utilizing `latLngBounds` to automatically refocus and zoom the global canvas based on injected datasets.

---

## 🛠️ Complete Tech Stack & Dependencies

| Ecosystem | Technology / Package | Implementation Scope |
| :--- | :--- | :--- |
| **Backend Core** | Python 3.10+, FastAPI, Uvicorn | Routing, CORS Policy, JSON Serialization |
| **Data Logic** | Pydantic, pandas, networkx | Schema Guards, Advanced Relational Graph Mapping |
| **Frontend Core** | Next.js 16 (TypeScript), React | Root Layouts, Global Context Hooks |
| **Graph UI** | React Flow | Animated Node Connections & Lineage Graphs |
| **Map UI** | Leaflet, React Leaflet | Dark-theme Spatial Visualizations, Bounds Updaters |
| **Styling & Assets** | Tailwind CSS, Lucide React | Glassmorphic UI Components, Performance Vector Icons |

---

## ⚙️ Local Setup & Workspace Configuration

Ensure **Python 3.10+** and **Node.js (v18+)** are initialized on your native system architecture before running configurations.

### 1. Repository Cloning
```bash
git clone <repository-url>
cd real-rails