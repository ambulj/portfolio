---
title: "Inferyx"
slug: "inferyx"
order: 1
summary: "An AutoML studio that keeps going after training: it profiles and repairs data, trains with live telemetry, explains the winner, watches for drift, and exports signed models."
status: "prototype"
data_note: "[[PLACEHOLDER: which datasets were used for the demo and benchmarks]]"
repo_url: null
repo_private: true
demo_url: "[[PLACEHOLDER: Hugging Face Space URL]]"
demo_status: "slow-start"
demo_note: "Runs full workflows on free infrastructure, so the first load can be slow."
diagram_verified: false
stack:
  Backend:
    - "Python 3.11"
    - "FastAPI"
    - "Celery"
    - "Redis"
    - "SQLAlchemy"
  Data and ML:
    - "Polars"
    - "PyArrow"
    - "scikit-learn"
    - "LightGBM"
    - "XGBoost"
    - "Optuna"
    - "SHAP"
    - "ONNX"
    - "Safetensors"
  Frontend:
    - "React 19"
    - "esbuild"
    - "Vitest"
  Ops:
    - "Docker"
    - "Docker Compose"
metrics:
  - measure: "Test count"
    value: "[[PLACEHOLDER: test count]]"
    data: "Unit and integration suite"
    hardware: "CI container"
    method: "pytest automated execution"
    verified: false
  - measure: "Profiling time"
    value: "[[PLACEHOLDER: profiling time on a named dataset]]"
    data: "Benchmark tabular set"
    hardware: "Laptop CPU"
    method: "Polars single-pass scan"
    verified: false
  - measure: "Training duration"
    value: "[[PLACEHOLDER: training time]]"
    data: "Tabular benchmark"
    hardware: "Laptop CPU"
    method: "Optuna 50-trial search"
    verified: false
  - measure: "Drift alert latency"
    value: "[[PLACEHOLDER: drift-alert latency]]"
    data: "Synthetic drift stream"
    hardware: "Laptop CPU"
    method: "PSI threshold evaluation"
    verified: false
changes:
  - "I'd benchmark it against FLAML or AutoGluon on OpenML datasets, so 'AutoML studio' comes with comparative numbers."
  - "Authentication is off by default and a default admin key ships with the config. I'd require a configured secret at startup and use separate keys for tokens and for model signing."
  - "Model bundles still include signed joblib files. I'd make ONNX or Safetensors the default and drop pickle by default."
hardening_status: "[[VERIFY: fixed | in progress | not started]]"
---

## Problem

Building the model is not the hard part. Understanding it, trusting it, monitoring it and knowing when it breaks is. Most tools stop once weights are saved; production systems fail after deployment when distribution shifts or unvalidated artifacts run unchecked.

## How it works

The studio guides tabular data from initial ingestion through live inference packaging and production telemetry:

1. **Studio interface:** React 19 single-page studio across seven views (Overview, Data, Training, Results, Tracking, Monitoring, Tools) managed by four dedicated state contexts.
2. **API gateway:** FastAPI backend providing role-based access control with optional JWT tokens, API keys, and three permission tiers (viewer, editor, admin).
3. **Data engine:** Polars and PyArrow engine executing multi-format ingestion and parallel schema profiling in a single vectorized pass.
4. **Feature engineering:** Leak-free temporal rolling features, calendar extraction, lag generation, and strict TimeSeriesSplit evaluation.
5. **Execution worker:** Dual-mode worker dispatching via Celery and Redis when broker is reachable, falling back to an in-process thread pool with an automatic startup reaper for interrupted jobs.
6. **Training engine:** Optuna Bayesian hyperparameter search streaming real-time metrics over WebSockets to the UI with automatic HTTP polling fallback.
7. **Explainability:** SHAP summary values, permutation feature importances, threshold tuning curves, and comparative model leaderboard.
8. **Signed export:** Standalone bundle secured with HMAC-SHA256 signatures, packaging ONNX, Safetensors, and signed joblib files with a dedicated FastAPI inference service and Dockerfile.
9. **Monitoring:** Continuous PSI (Population Stability Index) and Kolmogorov-Smirnov statistical drift tests dispatching webhook notifications on distribution decay.
