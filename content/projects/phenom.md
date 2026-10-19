---
title: "phenom"
slug: "phenom"
order: 6
summary: "A local-first personal assistant: Flask and PyQt5 front ends over a local model served by Ollama, with a memory layer and a set of small service modules."
status: "prototype"
data_note: "An experiment in how far one assistant can stretch; the repository has about ninety flat files covering assistant, tracking and home-automation ideas."
repo_url: "https://github.com/Bloated11/phenom"
repo_private: false
demo_url: null
demo_status: "none"
demo_note: null
diagram_verified: false
stack:
  Interfaces:
    - "PyQt5"
    - "Flask"
  Local AI:
    - "Ollama"
    - "Local LLM"
  Storage:
    - "SQLite"
    - "JSON flat files"
metrics:
  - measure: "Local response latency"
    value: "Hardware dependent"
    data: "Local inference streams"
    hardware: "Local machine"
    method: "Ollama token stream"
    verified: false
changes:
  - "Split it into a small core with optional plugins, and delete what I don't use."
  - "An assistant that executes actions needs an explicit permission model, which I'd design and document."
---

## Problem

Cloud-based virtual assistants send everyday desktop context, notes, and commands to external servers. Exploring how much functionality can be driven purely locally tests privacy boundaries and offline machine-learning utility.

## How it works

The project is structured around local inference with modular desktop interfaces:

1. **Inference backend:** Ollama local model service executing quantized language models on personal hardware.
2. **Interfaces:** Dual desktop access through a PyQt5 graphical interface and a local Flask web dashboard.
3. **Memory system:** Local SQLite database and flat file memory store preserving conversations and state.
4. **Tool modules:** System automation routines, hardware monitoring hooks, and experimental automation scripts.
