---
title: "AegisZ"
slug: "aegisz"
order: 2
summary: "A zero-knowledge AI gateway for clinical and public-welfare records: it strips and tokenises personal data before any model sees it, adds calibrated noise, and records every decision in a tamper-evident, post-quantum-signed ledger."
context: "Built for the IBM Z Datathon, Track 1: Security, Privacy and Responsible AI by Design. Result: [[PLACEHOLDER: outcome, or delete this line]]."
status: "prototype"
data_note: "Synthetic records only."
repo_url: "https://github.com/ambulj/AegisZ"
repo_private: false
demo_url: "[[PLACEHOLDER: demo URL]]"
demo_status: "none"
demo_note: null
diagram_verified: false
stack:
  Backend:
    - "Python 3.11"
    - "FastAPI"
    - "ONNX Runtime"
  Security:
    - "HMAC-SHA3-256"
    - "Laplace DP"
    - "ML-DSA-65"
    - "ML-KEM-768"
    - "CycloneDX"
  Frontend:
    - "React"
    - "Tailwind"
    - "WebSockets"
  Ops:
    - "Docker"
    - "multi-arch images"
    - "pytest"
metrics:
  - measure: "Inference latency"
    value: "~380 µs"
    data: "Synthetic records"
    hardware: "[[VERIFY: measured on what hardware? State if it ran on a laptop CPU with ONNX Runtime rather than IBM Z.]]"
    method: "ONNX Runtime single inference"
    verified: false
  - measure: "Privacy parameter epsilon"
    value: "0.1–5.0"
    data: "Synthetic records"
    hardware: "Laptop CPU"
    method: "Laplace mechanism configuration"
    verified: false
  - measure: "Requirement checks"
    value: "7 verified"
    data: "Automated test harness"
    hardware: "CI container"
    method: "[[VERIFY: link each to a test.]]"
    verified: false
changes:
  - "The ~380 µs figure is the IBM Z target unless I've measured it there. I'd publish a measured number with the hardware and method."
  - "Triage was checked on synthetic records. I'd evaluate on a public synthetic clinical set such as Synthea and report calibration, not only accuracy."
  - "I'd make the differential-privacy budget cumulative across a session, if it isn't already, so repeated queries can't quietly erode it."
---

## Problem

Clinical and welfare triage models need personal data to make decisions, but sending raw identifiers to external inference services breaks privacy commitments and exposes systems to extraction attacks. Privacy must be an architectural property of the system rather than an afterthought.

## How it works

The gateway guarantees mathematical privacy and post-quantum integrity at every processing stage:

1. **Ingress:** Handles clinical records, social welfare applications, and HL7/EDI payloads through an authenticated interface.
2. **Threat detector:** ONNX Runtime engine (combining Isolation Forest and gradient boosting) screening for prompt injection, RBAC privilege escalation, anomalous velocity, and insider abuse before quarantine or dispatch.
3. **PII vault:** HMAC-SHA3-256 format-preserving pseudonymization coupled with Laplace differential privacy injecting calibrated noise (ε between 0.1 and 5.0).
4. **Isolated triage:** Domain inference models process strictly anonymized and sanitized feature tensors.
5. **Audit ledger:** Cryptographic SHA3-512 Merkle hash chain sealed with ML-DSA-65 post-quantum digital signatures (FIPS 204), ML-KEM-768 key encapsulation metadata (FIPS 203), and a public verification endpoint.
6. **CBOM scanner:** CycloneDX 1.6 Cryptographic Bill of Materials scanner auditing dependencies and flagging classical keys vulnerable to harvest-now-decrypt-later vectors.
7. **Command center:** React web UI streaming live audit logs over WebSockets; multi-architecture container images supporting x86_64 and linux/s390x.
