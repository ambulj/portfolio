---
title: "AI Threat Detection System"
slug: "threat-detection"
order: 4
summary: "A network-traffic anomaly detector that scores flows with an Isolation Forest, assigns a severity, and raises alerts on a live dashboard."
status: "prototype"
data_note: "Trained and evaluated on synthetic traffic (85% normal, 15% injected port scans, DDoS, exfiltration and brute force)."
repo_url: "https://github.com/Bloated11/AI-Enhanced-Threat-Detection-System"
repo_private: false
demo_url: "[[PLACEHOLDER: demo URL]]"
demo_status: "none"
demo_note: null
diagram_verified: false
stack:
  Technologies:
    - "Python"
    - "Flask"
    - "scikit-learn"
    - "Pandas"
    - "NumPy"
    - "Plotly"
    - "SQLite"
metrics:
  - measure: "Detection accuracy"
    value: "~92%"
    data: "Synthetic traffic split"
    hardware: "Laptop CPU"
    method: "[[VERIFY: for each, the dataset split, the rule-based baseline used, and the hardware.]]"
    verified: false
  - measure: "False-positive rate"
    value: "~3–5%"
    data: "Synthetic traffic split"
    hardware: "Laptop CPU"
    method: "[[VERIFY: baseline comparison]]"
    verified: false
  - measure: "Per-flow latency"
    value: "<1 ms"
    data: "Windowed network flows"
    hardware: "Laptop CPU"
    method: "Isolation Forest inference bench"
    verified: false
  - measure: "False positive reduction"
    value: "35% fewer"
    data: "Synthetic benchmark"
    hardware: "Laptop CPU"
    method: "Comparison against rule-based threshold baseline"
    verified: false
changes:
  - "It was trained and tested on synthetic traffic. I'd re-evaluate on CIC-IDS2017 or UNSW-NB15."
  - "I'd report precision, recall and F1 with PR curves instead of one accuracy figure, and document the rule-based baseline behind the false-positive claim."
  - "The repo carries three app versions and a README that lists already-built features as future work. I'd consolidate to one entry point."
authorship: "[[VERIFY: confirm this is solely Ambul's work; the README contains another person's local path.]]"
---

## Problem

Most attacks look normal until you measure them across multiple statistical dimensions. Rule-based intrusion detection systems miss novel scanning behaviors and generate overwhelming alert volumes when high-throughput network flows fluctuate.

## How it works

The pipeline processes continuous network packets into classified flow anomalies:

1. **Traffic ingestion:** Synthetic network event generator emitting realistic background packets alongside malicious injection vectors.
2. **Flow analyzer:** Windowed streaming buffer extracting seven continuous flow features: port distributions, protocol ratios, packet byte sizes, flow duration, transmission rates, entropy metrics, and total byte volumes.
3. **Anomaly scoring:** Scikit-learn Isolation Forest algorithm calculating multidimensional isolation depths across sliding flow windows.
4. **Severity engine:** Calibrated thresholds mapping isolation scores into actionable low, medium, high, and critical threat levels.
5. **Alert dispatcher:** Notification bus triggering structured security event alerts and incident tracking.
6. **Dashboard:** Flask web application rendering interactive Plotly telemetry, live event feeds, and JSON REST endpoints.
