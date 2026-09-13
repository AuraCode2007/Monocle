# Graph Report - Monocle-2  (2026-09-13)

## Corpus Check
- 39 files · ~48,401 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: .bat 5, (none) 2, .css 2)

## Summary
- 270 nodes · 560 edges · 16 communities (13 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0457a5f0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.jsx
- crud.py
- package.json
- database.py
- auth.js
- README.md
- dependencies
- optimizer.py
- TrackRiskScorer
- RailwayAudioEngine
- .oxlintrc.json
- Railway Tunnel Background Image
- priority.py
- React + Vite

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 33 edges
2. `useRailwayStore` - 29 edges
3. `react` - 21 edges
4. `lucide-react` - 19 edges
5. `_get_control_room_row()` - 12 edges
6. `create_tms_request()` - 9 edges
7. `create_tdms_request()` - 9 edges
8. `create_smms_request()` - 9 edges
9. `get_db_connection()` - 9 edges
10. `App()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useLanguage()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/i18n.js
- `App()` --calls--> `useRailwayStore`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/store/useRailwayStore.js
- `CorridorMap()` --calls--> `useRailwayStore`  [EXTRACTED]
  frontend/src/components/CorridorMap.jsx → frontend/src/store/useRailwayStore.js
- `LoginPage()` --calls--> `useLanguage()`  [EXTRACTED]
  frontend/src/components/LoginPage.jsx → frontend/src/i18n.js
- `App()` --calls--> `canAccessTab()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/auth.js

## Import Cycles
- None detected.

## Communities (16 total, 1 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.10
Nodes (46): DEMO_STEPS, NAV_ACTIVE_CLASSES, NAV_GROUPS, NAV_ITEMS, ROLE_DEFAULT_TAB, ROLE_LAYOUTS, canApprovePTW(), canIssuePTW() (+38 more)

### Community 1 - "crud.py"
Cohesion: 0.13
Nodes (42): ControlRoomMaster, cancel_request(), create_smms_request(), create_tdms_request(), create_tms_request(), _crm_to_admin_dict(), generate_job_id(), get_control_room_request() (+34 more)

### Community 2 - "package.json"
Cohesion: 0.06
Nodes (34): devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/react, @types/react-dom, vite (+26 more)

### Community 3 - "database.py"
Cohesion: 0.14
Nodes (25): Connection, authenticate_user(), calculate_file_hash(), check_and_auto_sync(), create_department_job(), get_database_status(), get_db_connection(), get_department_jobs() (+17 more)

### Community 4 - "auth.js"
Cohesion: 0.15
Nodes (18): App(), AUTH_USERS, canAccessTab(), clearSession(), createMockJwt(), decodeBase64(), DEPARTMENTS, encodeBase64() (+10 more)

### Community 5 - "README.md"
Cohesion: 0.13
Nodes (14): 1. Backend Server (FastAPI + OR-Tools), 2. Frontend Command Center (React + Tailwind), AI-Powered Automatic Block Planning Engine for Indian Railways, 👥 Authors & Team Monocle, 📊 Evidence and Measurement Policy, 🌟 Executive Overview, Install Node packages, Install Python requirements (+6 more)

### Community 6 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, canvas-confetti, clsx, framer-motion, html2canvas, jspdf, leaflet, lucide-react (+6 more)

### Community 7 - "optimizer.py"
Cohesion: 0.39
Nodes (7): generate_railway_data(), Any, build_impact_summary(), evaluate_manual_schedule(), minutes_to_hhmm(), Any, solve_block_optimization()

### Community 8 - "TrackRiskScorer"
Cohesion: 0.28
Nodes (5): generate_synthetic_trc_data(), Monocle (RailSync-AI) - Machine Learning Track Defect & Derailment Risk Scorer…, Generates synthetic Track Recording Car (TRC) and TMS inspection logs…, Predicts Derailment Risk (0-100%) and returns categorized intervention urgency., TrackRiskScorer

### Community 10 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 11 - "Railway Tunnel Background Image"
Cohesion: 0.40
Nodes (4): Current Setup, Fallback, Instructions, Railway Tunnel Background Image

### Community 12 - "priority.py"
Cohesion: 0.70
Nodes (4): find_priority(), smms_priority(), tdms_priority(), tms_priority()

### Community 13 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **80 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `name` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 109 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `package.json`, `auth.js`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `App.jsx` to `package.json`, `auth.js`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09743589743589744 - nodes in this community are weakly interconnected._
- **Should `crud.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13399778516057587 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._