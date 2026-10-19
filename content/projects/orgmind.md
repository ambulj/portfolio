---
title: "OrgMind"
slug: "orgmind"
order: 3
summary: "A company knowledge graph with an agent on top. Every answer cites a source that exists in the graph and that the asker is allowed to see."
status: "prototype"
data_note: "A synthetic company (\"Northwind Labs\"), labelled as synthetic throughout the UI."
repo_url: "https://github.com/ambulj/OrgMind"
repo_private: false
demo_url: "[[PLACEHOLDER: demo URL]]"
demo_status: "none"
demo_note: null
diagram_verified: false
stack:
  Backend:
    - "Python 3.11+"
    - "FastAPI"
    - "SQLAlchemy"
    - "arq"
    - "Redis"
    - "PostgreSQL 16"
    - "FalkorDB"
    - "LiteLLM"
  Frontend:
    - "Next.js 14"
    - "React 18"
    - "TypeScript"
    - "Tailwind"
    - "Cytoscape.js"
  Quality:
    - "pytest (48 tests)"
    - "Ruff"
    - "Mypy"
    - "pre-commit"
  Ops:
    - "Docker Compose"
metrics:
  - measure: "Automated test suite"
    value: "48 tests"
    data: "Synthetic repository test suite"
    hardware: "CI container"
    method: "pytest automated execution"
    verified: true
  - measure: "Grounding benchmark"
    value: "[[PLACEHOLDER: publish scores]]"
    data: "24-question benchmark"
    hardware: "Laptop CPU"
    method: "Evaluation harness verification"
    verified: false
  - measure: "Documented endpoints"
    value: "24 endpoints"
    data: "FastAPI OpenAPI spec"
    hardware: "Local server"
    method: "OpenAPI 3.1 schema inspection"
    verified: true
changes:
  - "The graph runs on a synthetic company. I'd ingest a real, public corpus to test entity resolution on messy data."
  - "Slack, Drive, Jira and GitHub connectors are specified in the docs. I'd ship one end to end instead of four contracts."
  - "I'd publish the 24-question benchmark results so the grounding claims can be checked."
---

## Problem

Enterprise search and agentic question-answering hallucinate citations or leak privileged documents across organizational silos. An answer without an auditable, permissions-filtered source node in an active knowledge graph is merely a guess.

## How it works

The knowledge graph couples graph database queries with fine-grained access control and grounding checks:

1. **Ingestion pipeline:** Modular connector framework feeding an eight-stage retryable ingestion queue coordinated by arq workers and Redis.
2. **Dual persistence:** FalkorDB low-latency graph database operating over OpenCypher queries, synchronized with PostgreSQL 16 for identity, workspaces, execution jobs, and immutable audit logs.
3. **Grounded agent:** Provider-agnostic LiteLLM execution loop with strict grounding verification and allow-listed, parameterized Cypher tool execution.
4. **API and protocols:** FastAPI REST service and SSE event streams spanning 24 endpoints under OpenAPI 3.1, coupled with an MCP server exposing 11 query and analysis tools.
5. **Explorer UI:** Next.js 14 application featuring conversational question interface, Cytoscape graph visualization, decision lineage viewer, and peer reviews.
6. **Data governance:** Four authorization roles (admin, editor, viewer, auditor), untrusted-data delimiters neutralizing prompt injection vectors, two-phase role-gated mutations, and bitemporal record supersession instead of in-place deletion.
