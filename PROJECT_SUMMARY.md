# SETU-ROUTE: Complete Project Summary & Feature Catalog

**Smart India Hackathon 2026** | **Problem Statement ID:** 26002  
**Ministry / Organization:** Ministry of Development of North Eastern Region (MDoNER), Government of India  
**Tagline:** *See the road before you send the vehicle.*  

---

## 1. Executive Summary & Problem Context

The North Eastern Region (NER) of India comprises 8 states (**Assam, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal Pradesh, and Sikkim**) connected to mainland India and each other through narrow, vulnerable mountain corridors (most notably the Siliguri Corridor and NH-6 / NH-27 arteries). 

During monsoons and seismic events, these lifeline corridors routinely suffer from:
* **Severe Landslides & Rockfalls:** Blocking NH-6 (e.g., Sonapur Tunnel/Valley), cutting off southern Assam, Mizoram, and Tripura.
* **Flash Floods & Cloudbursts:** Waterlogging critical low-lying bridges and highways across the Brahmaputra and Barak basins.
* **Total Connectivity Blackouts:** Stranded supply convoys carrying emergency medicines, FCI grain supplies, and fuel with zero connectivity for real-time reporting.

**SETU-ROUTE** is a production-grade AI-powered logistics intelligence and road accessibility command platform built to solve these critical bottlenecks through a closed-loop automated pipeline.

---

## 2. Ground Truth Data Context & Local Case Studies

To ensure SETU-ROUTE is built for the harsh realities of the NER, the system incorporates localized vulnerability parameters, referencing specific historical failures and topography:

### A. Specific Highway Bottlenecks & Vulnerable Districts
*   **NH-6 (East Jaintia Hills, Meghalaya - Cachar, Assam):** The *Sonapur Tunnel* and surrounding valley sections are notorious sinking zones. Landslides here routinely sever the **only** heavy-motorable link to Southern Assam, Tripura, and Mizoram.
*   **NH-27 (Dima Hasao, Assam):** The Lumding-Badarpur-Silchar segment experiences severe subgrade erosion. The *Haflong* sinking zones frequently wash away entire highway sections during peak monsoons.
*   **NH-10 (Mangan & Pakyong Districts, Sikkim):** The Teesta river valley gorge route. Susceptible to Glacial Lake Outburst Floods (GLOFs) which can wash out bridges overnight, entirely disconnecting Gangtok and northern defense outposts.
*   **NH-29 (Dimapur - Kohima, Nagaland):** Prone to rockfalls and mudslides disrupting supply chains into Manipur (via NH-2).

### B. Local Case Studies Driving the ML & Routing Models
1.  **The May 2022 Dima Hasao Floods (Assam):** Unprecedented rainfall washed out portions of NH-27 and the railway line, isolating the Barak Valley and Tripura for weeks. *SETU-ROUTE addresses this by incorporating cumulative 6-hour rainfall saturation limits in its predictive model, automatically identifying bypasses (e.g., via Meghalaya) before complete collapse.*
2.  **The October 2023 South Lhonak Lake GLOF (Sikkim):** A flash flood down the Teesta River basin destroyed multiple bridges on NH-10. *SETU-ROUTE’s Incident Reporting PWA and real-time rerouting engine are designed exactly for immediate, catastrophic infrastructure loss, instantly calculating alternative lower-tier state highways.*

---

## 3. The 6-Stage Closed-Loop Intelligence Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      THE SETU-ROUTE INTELLIGENCE LOOP                       │
│                                                                             │
│  [1. SENSE]                                                                 │
│  GPS Fleet Telemetry + IMD Cloudburst Sensors + Offline Field PWA Reports   │
│        │                                                                    │
│        ▼                                                                    │
│  [2. UNDERSTAND]                                                            │
│  Corridor Accessibility Map (8 Corridors) + District Vulnerability Scores   │
│        │                                                                    │
│        ▼                                                                    │
│  [3. PREDICT]                                                               │
│  Disruption Risk ML Engine (Gradient Boosting Classifier: 0-100 Score)      │
│        │                                                                    │
│        ▼                                                                    │
│  [4. DECIDE]                                                                │
│  Multi-Criteria Graph Solver (Generates 4 candidate routes with rationales) │
│        │                                                                    │
│        ▼                                                                    │
│  [5. ACT]                                                                   │
│  Dynamic Rerouting + Physics-Aware ETA Recalibration + 4-Part Alerts        │
│        │                                                                    │
│        ▼                                                                    │
│  [6. VERIFY & AUDIT]                                                        │
│  Live WebSocket Broadcasts + Outbox Sync + Immutable Audit Trail            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Comprehensive Feature Catalog

### 🏢 Module 1: MDoNER Operational Landing Portal (`/landing`)
* **Authoritative Government Interface:** Clean, high-impact overview tailored for senior administrators and MDoNER officials.
* **Regional Health Indicators:** Live accessibility summary cards for all 8 North Eastern states and 8 primary highway corridors.
* **Mission Overview & Quick Launch:** Direct entry points to Command Center, GIS Map, Route Planner, and Live Scenario Demonstrator.

### 🎛️ Module 2: Interactive Real-Time Command Center (`/`)
* **High-Level KPI Summary:** Real-time metrics on Total Active Vehicles, Open Lifeline Corridors, Active Weather Disruption Warnings, and Critical Field Incidents.
* **High-Risk Corridor Grid:** Live status tags (`ACCESSIBLE`, `RESTRICTED`, `BLOCKED`) with live hazard probability indicators.
* **Instant Incident Triage:** Immediate access to unverified field reports with single-click verification and broadcast.
* **Live Fleet Stream:** Monitored vehicle cards with dynamic speed, cargo priority, and risk classification.

### 🗺️ Module 3: Live GIS Interactive Geospatial Map (`/map`)
* **PostGIS / GeoJSON Viewport Filtering:** High-performance bounding box spatial queries.
* **Dynamic Corridor Color Grading:** 
  * 🟢 **Green (`ACCESSIBLE`):** Normal mountain transit speeds.
  * 🟡 **Yellow (`RESTRICTED`):** Heavy rain, single-lane alternating traffic, or elevated risk.
  * 🔴 **Red (`BLOCKED`):** Complete carriageway obstruction (debris/flood).
* **Multi-Layer Map Controls:** Toggleable layers for Highway Corridors, Field Incidents, Fleet Telemetry, District Risk Polygons, and IMD Weather Overlays.
* **Rich Entity Popovers:** Deep-dive cards displaying vehicle cargo, sensor data, and road blockage details.

### 🛣️ Module 4: Multi-Criteria Graph Route Optimizer (`/routes`)
* **Dijkstra Topographic Solver:** Evaluates 4 simultaneous candidate paths:
  1. **Recommended Path:** Optimal balance between transit duration and disruption risk.
  2. **Fastest Path:** Lowest raw drive time regardless of weather hazard.
  3. **Lowest-Risk Path:** Maximum detour avoiding any precipitation or landslide zones.
  4. **Alternative Bypass Path:** Secondary state highway bypass routing.
* **"Why this Route?" Explainability:** Human-readable operational rationale explaining road grades, weather risks, and estimated delays for each path.
* **Interactive Waypoint Selector:** Pre-populated North Eastern hubs (Guwahati, Shillong, Silchar, Agartala, Imphal, Aizawl, Dimapur, Itanagar).

### ⚡ Module 5: Closed-Loop Dynamic Rerouting & ETA Physics Engine
* **One-Click Operator Rerouting:** Automatically reroutes affected vehicles when a corridor is blocked.
* **Physics-Aware ETA Calibration:** Applies multi-factor terrain and weather multipliers:
  $$\text{ETA Multiplier} = \text{Base Time} \times \text{Surface Factor} \times \text{Rainfall Factor} \times \text{Gradient Penalty} + \text{Queue Delay}$$
  * *Surface degradation factor:* Waterlogged (0.45x speed), Muddy (0.65x speed).
  * *Cloudburst rainfall factor:* Heavy monsoon downpours reduce average mountain speed by 40%.
  * *Elevation gain factor:* Steeper hill climbs (>800m ascent) account for heavy cargo vehicle crawl speeds.
  * *Bottleneck delay diagnosis:* Adds clearance queue time (+45 mins per clearance sector).

### 📱 Module 6: Offline-First Field Reporting PWA (`/reports`)
* **Service Worker Asset Caching:** Runs completely offline during mountain valley telecom blackouts.
* **IndexedDB Outbox Persistence:** Stores incident submissions, photos (base64 compressed), and auto-detected GPS coordinates locally.
* **Network State Awareness:** Real-time 4-state indicator (`ONLINE`, `DEGRADED`, `OFFLINE`, `SYNCING`) with millisecond ping checks.
* **Idempotent Store-and-Forward Sync:** Employs client-generated UUID idempotency keys to guarantee zero duplicate reports when connectivity restores.

### 🚨 Module 7: Strategic 4-Part Actionable Alert System (`/alerts`)
Every alert generated by the system is formatted into an actionable 4-part operational protocol:
1. **WHAT HAPPENED:** Exact hazard type, road marker, and blockage severity (e.g., *200m landslide debris on NH-6 KM-142*).
2. **WHY IT MATTERS:** Direct threat to cargo integrity or lifeline transit (e.g., *Threatens temperature-sensitive vaccine consignment NER-MED-2026-084*).
3. **WHO IS AFFECTED:** Specific vehicle registration, driver, and destination hospital/depot.
4. **RECOMMENDED ACTION:** Specific tactical instruction (e.g., *Execute immediate detour via Western Meghalaya SH-12; staging at Mawryngkneng toll plaza*).
* **Notification Center:** Filterable by *Unread*, *Critical*, and *All* with 1-click bulk acknowledgment.

### 🎬 Module 8: Guided 11-Step Demonstration Scenario Runner
An interactive simulation engine built specifically for evaluator demonstration:
* **Step 1:** Consignment `NER-MED-2026-084` departs Guwahati for Silchar on NH-6.
* **Step 2:** IMD sensor records heavy cloudburst downpour (48.5 mm/h) in East Jaintia Hills.
* **Step 3:** Disruption Risk ML Model predicts critical hazard score (82/100).
* **Step 4:** Landslide strikes Sonapur Valley KM-142; NH-6 status changes to `BLOCKED`.
* **Step 5:** System flags vehicle `AS-01-GC-4482` in danger zone.
* **Step 6:** Graph solver computes alternate detour via Western Meghalaya Bypass.
* **Step 7:** Operator reviews *"Why this Route?"* explainability breakdown.
* **Step 8:** Dynamic reroute command dispatched; waypoints updated.
* **Step 9:** Physics-aware ETA recalculated (+47 min delay diagnosed).
* **Step 10:** 4-part actionable alert `ALT-DEL-8924` generated and broadcast.
* **Step 11:** Audit log entry written to immutable system register.

### 🛡️ Module 9: System Observability & Audit Trail (`/admin`)
* **Live Subsystem Health Matrix:** Real-time health, latency, and status monitoring for:
  * FastAPI ASGI Backend Engine
  * SQLite / PostGIS Spatial Database
  * Redis Pub/Sub & Telemetry Cache
  * IMD Weather Ingestion Feed
  * GPS Telemetry Stream
  * Offline Sync Queue Manager
* **Immutable Audit Trail:** Chronological log of all rerouting decisions, clearance authorizations, and incident verifications with operator attribution and timestamps.

### 🌐 Module 10: Quad-Language Multilingual Localization Engine
Comprehensive, typed internationalization across 4 official regional languages:
* 🇬🇧 **English (`en`)**: Primary National Operational Command interface.
* 🇮🇳 **Hindi (`hi`)**: National Union administrative standard.
* 🌿 **Assamese (`as`)**: Regional administrative language for Assam & lower Brahmaputra.
* 🌊 **Bengali (`bn`)**: Regional administrative language for Barak Valley & Tripura.
* *Seamless instant language switching without layout shifts or missing string fallbacks.*

### 🔍 Module 11: Global Instant Categorized Search (`Ctrl+K` / `Cmd+K`)
* Global keyboard shortcut modal available on every page.
* Grouped instant search indexing:
  * **Corridors & Highways** (e.g., NH-6, NH-27, NH-10)
  * **Districts & Hubs** (e.g., Cachar, East Jaintia Hills, Kamrup Metro)
  * **Fleet Vehicles** (e.g., AS-01-GC-4482)
  * **Consignments & Deliveries** (e.g., NER-MED-2026-084)
  * **Incidents & Hazards** (e.g., INC-2026-001)

### 🔐 Module 12: Role-Based Access Control (RBAC) & Persona Credentials
Pre-configured, authenticated user profiles representing the full operational hierarchy:

| Role | Email | Password | Scope & Responsibilities |
|---|---|---|---|
| **Super Admin (MDoNER HQ)** | `admin@neroute.gov.in` | `admin123` | Full National Control, System Health & Audit Logs |
| **Command Dispatcher** | `regional.assam@neroute.gov.in` | `admin123` | Road Clearance, Incident Verification & Dynamic Reroutes |
| **Field Officer (Cachar)** | `field.cachar@neroute.gov.in` | `field123` | Offline Mobile Field Incident & Road Hazard Reporting |
| **Fleet Driver** | `driver.biren@neroute.gov.in` | `driver123` | Vehicle Navigation Portal & Telemetry GPS Breadcrumbs |
| **Public Viewer** | `viewer@neroute.gov.in` | `viewer123` | Read-only Regional Corridor Accessibility Kiosk |

### 📊 Module 13: Statistics, Operational Analytics & Management Reporting (`/statistics`)
Dedicated ministerial logistics intelligence suite presenting aggregated operational impact:
* **MDoNER Executive KPIs**: Route Efficiency Gains (+22.8%), Average ETA Saved (34.2 mins), Network Accessibility (87.4%), Manual Interventions Avoidance (-68.0%), Risk Exposure Reduction (-37.7%), Delivery Reliability (92.4%), and Cost Savings (₹84,600 projected).
* **Consolidated Impact Score**: 88/100 multi-dimensional scoring across safety, efficiency, reliability, decision speed, automation, corridor resilience, and incident response.
* **Before vs. After Comparative Matrix**: Direct quantitative benchmarks demonstrating operational modernization across 8 key logistical workflows.
* **Cost Optimization & AI Disruption Predictor Analytics**: Breakdown of fuel avoidance, overtime reduction, vehicle wear mitigation, and pharmaceutical cold-chain preservation.
* **Corridor Health & Regional Accessibility Matrix**: Live ranking and reliability ratings for all 8 NER highway arteries and 8 North Eastern states.
* **Management Impact Report Export**: One-click printable ministerial briefing report with executive AI narrative and areas requiring intervention.

---

## 5. Technical Architecture & Technology Stack

```
                                  FRONTEND CLIENTS
         ┌────────────────────────────────┬────────────────────────────────┐
         │     Next.js 14 Web Command     │    Offline-First Field PWA     │
         │ (Tailwind CSS, Zustand, Lucide)│ (Service Worker, IndexedDB Outbox)
         └────────────────┬───────────────┴────────────────┬───────────────┘
                          │                                │
                          ▼                                ▼
       ┌────────────────────────────────────────────────────────────────────────┐
       │                   FASTAPI HIGH-PERFORMANCE BACKEND                     │
       │                   (Python 3.11, ASGI, Pydantic V2)                     │
       ├────────────────────────────────────┬───────────────────────────────────┤
       │   ROUTING & INTELLIGENCE ENGINES   │     SERVICES & INFRASTRUCTURE     │
       │  • ML Gradient Boosting Predictor  │  • WebSocket Realtime Gateway     │
       │  • Dijkstra Graph Solver           │  • JWT Authentication & RBAC      │
       │  • Physics-Aware ETA Multiplier    │  • Idempotent Sync Manager        │
       │  • 4-Part Alert Rule Engine        │  • Immutable Audit Trail Log      │
       └──────────────────┬─────────────────┴───────────────────┬───────────────┘
                          │                                     │
                          ▼                                     ▼
       ┌────────────────────────────────────┐ ┌─────────────────────────────────┐
       │    STORAGE & PERSISTENCE LAYER     │ │     CACHING & PUB/SUB LAYER     │
       │ SQLAlchemy 2.0 Async / SQLite /    │ │ Redis 7 Pub/Sub & Fleet         │
       │ PostGIS 16 Geospatial Tables       │ │ Telemetry Memory Cache          │
       └────────────────────────────────────┘ └─────────────────────────────────┘
```

### Technology Matrix

| Layer | Technologies Used |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, MapLibre GL / Leaflet, Zustand, TanStack React Query, Lucide Icons |
| **Offline Architecture** | Service Worker (`sw.js`), IndexedDB API, Client-Side Image Compression, Idempotency UUIDs |
| **Backend API** | Python 3.11, FastAPI, Uvicorn ASGI, Pydantic V2, WebSockets |
| **Database & GIS** | SQLAlchemy 2.0 Async ORM, SQLite (WAL mode) / PostgreSQL 16 + PostGIS, GeoJSON |
| **Machine Learning** | Scikit-Learn (Gradient Boosting Classifier), NumPy, Pandas |
| **Routing Algorithm** | Custom Multi-Criteria Directed Topological Graph Engine (Dijkstra + Risk Weights) |
| **Testing & QA** | pytest (26 Unit, Integration, Intelligence & Scenario Tests), Custom Concurrency Load Benchmark Suite |

---

## 6. Seeded North Eastern Lifeline Corridors

The system comes pre-configured with the 8 primary logistical lifelines of the North Eastern Region:

1. **NH-6 (Guwahati – Shillong – Silchar – Agartala):** Primary artery to southern Assam, Tripura, and Mizoram; vulnerable to Sonapur landslides.
2. **NH-27 (Siliguri Corridor – Guwahati):** The vital Chicken's Neck lifeline connecting NER to mainland India.
3. **NH-29 (Dimapur – Kohima):** Mountain pass connecting Nagaland and Manipur.
4. **NH-10 (Siliguri – Gangtok):** Teesta River gorge corridor; critical for Sikkim connectivity.
5. **NH-102 (Imphal – Moreh):** Critical Indo-Myanmar border trade corridor.
6. **NH-515 (Pasighat – Dhemaji):** Upper Assam and Arunachal Pradesh Himalayan foothills artery.
7. **NH-54 (Silchar – Aizawl):** Mountain supply lifeline for Mizoram.
8. **NH-715 (Jorhat – Kaziranga – Guwahati):** Central Assam flood-prone highway.

---

## 7. Verification, Testing & Quality Assurance

* **Automated Unit & Integration Tests:** 26 comprehensive tests covering authentication, spatial features, Dijkstra routing calculations, ML risk predictions, idempotent offline sync, scenario simulations, and statistics/analytics intelligence.
  ```bash
  cd apps/api
  python -m pytest tests/ -v
  # 26 passed in 3.21s (100% PASS RATE)
  ```
* **High-Concurrency Load Testing:** Validated with custom asynchronous load testing simulating concurrent telemetry feeds and map queries.
* **Database Reliability:** SQLite WAL mode with full thread-safety and instant failover schema for PostGIS 16.

---

## 8. Local Execution & Active Ports

| Service | Address | Purpose |
|---|---|---|
| **Frontend Web Command Center** | `http://localhost:3000` | Full GUI, Command Center, Map, Reports, Alerts |
| **Executive Statistics & Analytics** | `http://localhost:3000/statistics` | Operational impact KPIs, benchmarks, MDoNER reporting |
| **MDoNER Operational Portal** | `http://localhost:3000/landing` | Public & ministerial landing overview |
| **FastAPI Backend Service** | `http://localhost:8008` | REST API, WebSocket streams, ML engine |
| **FastAPI Swagger Documentation** | `http://localhost:8008/docs` | Interactive API sandbox & schema explorer |
| **System Readiness Check** | `http://localhost:8008/ready` | Live DB & ML model verification probe |
