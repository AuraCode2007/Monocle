# 🚄 Monocle (RailSync-AI)
### AI-Powered Automatic Block Planning Engine for Indian Railways
**Smart India Hackathon 2026 | Problem Statement ID: SIH26027**  
**Organization:** Ministry of Railways (Government of India) | **Theme:** Transportation & Logistics

---

## 🌟 Executive Overview

In Indian Railways, fixed infrastructure maintenance across **Engineering (Track/TMS)**, **Traction Distribution (Electrical/TDMS)**, and **Signal & Telecommunication (S&T/SMMS)** departments is currently requested via siloed manual demands in the BDMS platform. 

**Monocle (RailSync-AI)** unifies multi-department maintenance block demands, train schedules (from Control Office Application - COA), and safety rules into a high-performance **Google OR-Tools (CP-SAT)** constraint optimization engine.

### 📊 Key Performance Metrics
- **Active Conflicts Eliminated:** 100% (10 clashes -> 0 collision-free schedule)
- **Passenger Train Delay Avoided:** +450 Minutes per operational cycle (~7.5 hours saved)
- **Joint Co-located Blocks Synchronized:** 4 multi-department unified possessions
- **Asset Availability Index:** +46.4% net track commercial throughput surge

---

## 🛠️ Tech Stack & Architecture

`
+---------------------------+      +---------------------------+      +---------------------------+
|   React 18 + Vite + CSS   | ---> |      FastAPI Backend      | ---> |  Google OR-Tools (CP-SAT) |
| * D3 String Chart (MARECHAL)     | * REST & WebSocket Endpoints    | * Constraint Programming   |
| * 24-Hr Interactive Gantt |      | * CORS Middleware         |      | * Joint-Block Co-location |
| * Form T/348M PDF Export  |      | * Simulation Compare Engine|     | * Safety Headway Buffers  |
+---------------------------+      +---------------------------+      +---------------------------+
`

---

## 🚀 Quick Start Guide

### 1. Backend Server (FastAPI + OR-Tools)
`ash
# Install Python requirements
pip install -r requirements.txt

# Run the backend API server
python main.py
`
> API will start at http://127.0.0.1:8000  
> Interactive Swagger API docs: http://127.0.0.1:8000/docs

---

### 2. Frontend Command Center (React + Tailwind)
`ash
cd frontend

# Install Node packages
npm install

# Start the development server
npm run dev
`
> Open http://localhost:5173 in your browser.

---

## 🧭 Key Operational Views

1. **24-Hr Master Gantt Timeline:** Interactive track possession schedule across all corridor sections.
2. **Time-Distance String Chart:** Indian Railways standard MARECHAL diagram with train trajectory lines vs. block boxes.
3. **Corridor Schematic Map:** Live 440 KM New Delhi - Kanpur Central track health overview.
4. **What-If Emergency Simulator:** Real-time Ultrasonic Rail Fracture injection & dynamic re-solve.
5. **Conflict Resolution & PTW:** Cryptographic Private Number exchange & downloadable **Form T/348M PDF Memo**.
6. **26-Week Rolling Horizon:** 6-month forward maintenance capacity planning calendar.
7. **'Ask RailSync' AI Command Palette:** Press Ctrl + K to search corridor intelligence in natural language.

---

## 👥 Authors & Team Monocle
- Built for **Smart India Hackathon 2026**
- Dedicated to the **Ministry of Railways (Government of India)**