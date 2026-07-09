
# AIVOA AI-First HCP CRM

An AI-first Customer Relationship Management module designed for life-sciences field representatives to log, modify, enrich, and save Healthcare Professional (HCP) interactions through natural-language conversation.

The application combines a React and Redux interface with a FastAPI backend, a LangGraph agent, Groq-hosted LLM inference, and MySQL persistence.

The core design principle is simple:

> The user describes an HCP interaction naturally, while the AI agent determines the appropriate action and synchronizes the structured CRM form.

---

## Overview

Traditional CRM interaction logging requires field representatives to manually complete multiple structured fields after meeting a Healthcare Professional.

This project explores an AI-first workflow where natural-language conversation becomes the primary interaction layer.

A field representative can describe a meeting such as:

> "Today I met Dr. Smith and discussed Product X efficacy. The sentiment was positive and I shared a brochure."

The LangGraph agent interprets the request, selects the appropriate tool, extracts structured information using the LLM, and updates the CRM form through Redux state.

The agent also supports contextual corrections, material additions, follow-up scheduling, and explicit database persistence.

---

## Key Features

- AI-controlled HCP interaction form
- Natural-language interaction logging
- Context-aware interaction editing
- Automatic structured data extraction
- Material tracking
- Follow-up action scheduling
- Deterministic relative-date resolution
- Explicit interaction persistence
- Conversational multi-turn workflow
- Redux-based frontend state management
- MySQL database persistence
- FastAPI REST API
- Interactive Swagger API documentation

---

## LangGraph Agent Tools

The AI agent uses five specialized tools.

### 1. `log_interaction`

Extracts structured CRM information from a natural-language interaction description.

Supported information includes:

- HCP name
- interaction type
- date and time
- attendees
- topics discussed
- materials shared
- samples distributed
- HCP sentiment
- outcomes
- follow-up actions

### 2. `edit_interaction`

Updates only the fields explicitly corrected by the user while preserving the remaining interaction state.

Example:

> "The HCP was actually Dr. John and the sentiment was negative."

### 3. `add_material`

Adds additional materials to the current interaction without overwriting previously recorded materials.

Example:

> "Also add the Phase III clinical study report."

### 4. `schedule_follow_up`

Creates follow-up actions from natural-language requests.

Relative dates such as `today`, `tomorrow`, and `next Monday` are resolved using deterministic Python date logic to avoid relying exclusively on LLM calendar calculations.

Example:

> "Schedule a follow-up meeting next Monday to discuss treatment outcomes."

### 5. `save_interaction`

Persists the completed interaction to the MySQL database only after an explicit save request.

Example:

> "Everything looks correct. Save this interaction."

---

## Architecture

```text
User
  |
  v
React Chat Interface
  |
  v
Redux Toolkit State
  |
  v
FastAPI REST API
  |
  v
LangGraph Agent
  |
  +--------------------------+
  |                          |
  v                          v
Groq LLM              Deterministic Logic
Intent Recognition     Relative Date Handling
Entity Extraction
Tool Selection
  |
  v
LangGraph Tools
  |
  +--> log_interaction
  +--> edit_interaction
  +--> add_material
  +--> schedule_follow_up
  +--> save_interaction
  |
  v
MySQL Database
