---
title: "RoadSaarthi"
slug: "roadsaarthi"
order: 5
summary: "A prototype road-condition platform: it generates road-sensor events, scores each road segment, clusters hotspots spatially, and shows them on a live map with work orders."
status: "prototype"
independent_prototype: true
data_note: "An independent prototype. It is not an official product of any government body, and its data is synthetic."
repo_url: "https://github.com/ambulj/roads"
repo_private: false
demo_url: "[[PLACEHOLDER: demo URL]]"
demo_status: "none"
demo_note: null
diagram_verified: false
stack:
  Backend:
    - "Python"
    - "FastAPI"
    - "SQLAlchemy 2"
    - "PostGIS"
  ML:
    - "scikit-learn (DBSCAN)"
  Frontend:
    - "React 18"
    - "TypeScript"
    - "Vite"
    - "Tailwind"
    - "MapLibre GL"
    - "ApexCharts"
metrics:
  - measure: "System benchmarks"
    value: "No measured results yet"
    data: "[[PLACEHOLDER: real, measured values or leave the table empty with the note 'No measured results yet']]"
    hardware: "Laptop / Server"
    method: "Pending benchmark run"
    verified: false
changes:
  - "I'd swap the synthetic data for open pothole and road-condition datasets."
  - "I'd show the edge-inference model itself, or drop the 'edge AI' label."
---

> An independent prototype. It is not an official product of any government body, and its data is synthetic.

## Problem

Infrastructure data only matters if someone acts on it. Raw telemetry from vehicle accelerometers and road cameras often ends up stranded in inspection logs rather than being prioritized, geolocated, and converted into dispatched municipal repair orders.

## How it works

The architecture translates continuous road roughness and pothole events into clustered municipal repairs:

1. **Event generator:** Synthetic telemetry generator emitting simulated accelerometer and GPS sensor hits every 300 seconds.
2. **Backend API:** FastAPI application utilizing SQLAlchemy 2 over PostgreSQL and PostGIS spatial indexing.
3. **Scoring engine:** Road Condition Index scoring module calculating localized segment degradation [[VERIFY: expand 'RPI']].
4. **Spatial clustering:** Scikit-learn DBSCAN algorithm grouping high-density surface defects into distinct spatial hotspots.
5. **Streaming bus:** WebSocket server broadcasting fresh incident clusters and severity recalculations.
6. **Command UI:** React and MapLibre GL mapping dashboard featuring seven operational views: command center, incident queue, road history, analytics, fleet inspection, work orders, and public reporting.
