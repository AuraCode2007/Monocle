# 🚄 Monocle (RailSync-AI)
### AI-Powered Automatic Block Planning Engine for Indian Railways
**Smart India Hackathon 2026 | Problem Statement ID: SIH26027**  
**Organization:** Ministry of Railways (Government of India) | **Theme:** Transportation & Logistics

---

## 🌟 Executive Overview

In Indian Railways, fixed infrastructure maintenance across **Engineering (Track/TMS)**, **Traction Distribution (Electrical/TDMS)**, and **Signal & Telecommunication (S&T/SMMS)** departments is currently requested via siloed manual demands in the BDMS platform. 

**Monocle (RailSync-AI)** unifies multi-department maintenance block demands, train schedules (from Control Office Application - COA), and safety rules into a high-performance **Google OR-Tools (CP-SAT)** constraint optimization engine.

### 📊 Evidence and Measurement Policy
- **Scenario measurements:** Conflict count, delay minutes avoided, joint possessions, and availability change are returned by the CP-SAT solver for the active generated corridor scenario.
- **Network projections:** The National view scales those measured results only as an illustrative scenario using `68 divisions × 1 planning cycle/week × 52 weeks/year`.
- **Network structure:** The 17-zone / 68-division figure is treated as a Railway Board network fact and linked from the National view.
- **No unsupported rupee claim:** The application does not convert delay minutes into money until an official, citable cost-per-delay-minute methodology is provided.
- **Reproducibility:** Every displayed projection exposes its equation and assumptions in the National view's methodology panel.

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
`Bash
# Install Python requirements
pip install -r requirements.txt

# set up your own .env file and inside it write:
DATABASE_URL=postgesql://..... (Put in the actual database url here)

# (Optional): make your terminal able to display emojis by executing: $env:PYTHONIOENCODING="utf-8"

# Run the backend API server
python main.py
`
> API will start at http://127.0.0.1:8000  
> Interactive Swagger API docs: http://127.0.0.1:8000/docs

---

### 2. Frontend Command Center (React + Tailwind)
`bash
cd frontend

# Install Node packages
npm install

# Start the development server
npm run dev

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