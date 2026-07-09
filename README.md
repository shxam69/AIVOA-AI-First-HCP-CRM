Author

Shyam A

Full Stack Developer

Built as a technical assignment demonstrating an AI-first HCP CRM workflow using React, Redux, FastAPI, LangGraph, Groq, and MySQL.
_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
## LLM Model Compatibility Note

The original assignment specification references Groq's `gemma2-9b-it` model and also mentions `llama-3.3-70b-versatile` for context.

During development, `gemma2-9b-it` was tested directly through the Groq API. Groq returned a `model_decommissioned` response, confirming that the specified model is no longer supported by the platform.

To maintain a fully functional implementation using the required Groq and LangGraph stack, this project uses `llama-3.3-70b-versatile`, which is also referenced in the assignment specification.

The application continues to use the LLM for natural-language understanding, structured data extraction, contextual interaction updates, and LangGraph tool selection. Deterministic application logic is used only where predictable computation is required, such as relative-date resolution.
_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________


------------------------------- AIVOA AI-First HCP CRM -------------------------------

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
```

####Tech Stack####

>>>>> Frontend <<<<<

> React
> Vite
> Redux Toolkit
> React Redux
> Axios
> Lucide React
> Google Inter


>>>>> Backend <<<<<

> Python
> FastAPI
> Uvicorn
> Pydantic
> SQLAlchemy
> PyMySQL

 
 >>>>> AI Agent <<<<<

> LangGraph
> LangChain
> Groq
`llama-3.3-70b-versatile`
> LLM tool calling
> Deterministic relative-date resolution

>>>>> Database <<<<<

> MySQL

>>> AI Agent Workflow <<<
```
Natural-language request
        |
        v
Groq LLM
        |
        v
Intent and entity understanding
        |
        v
LangGraph tool selection
        |
        v
Selected tool execution
        |
        v
Interaction state update
        |
        v
Redux synchronizes the CRM form
        |
        v
Explicit save request
        |
        v
MySQL persistence
```
The LLM is responsible for natural-language understanding, structured extraction, and tool selection.

Deterministic application logic is used where predictable computation is preferable, such as resolving relative calendar dates.

PROJECT STRUCTURE:
```
AIVOA-HCP-CRM/
|
|-- backend/
|   |-- app/
|   |   |-- agents/
|   |   |   |-- graph.py
|   |   |   `-- state.py
|   |   |
|   |   |-- api/
|   |   |   `-- routes.py
|   |   |
|   |   |-- database/
|   |   |   |-- database.py
|   |   |   `-- models.py
|   |   |
|   |   |-- schemas/
|   |   |   `-- interaction.py
|   |   |
|   |   |-- tools/
|   |   |   `-- interaction_tools.py
|   |   |
|   |   `-- main.py
|   |
|   `-- requirements.txt
|
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |   |-- AIAssistant.jsx
|   |   |   `-- InteractionForm.jsx
|   |   |
|   |   |-- services/
|   |   |   `-- api.js
|   |   |
|   |   |-- store/
|   |   |   |-- interactionSlice.js
|   |   |   `-- store.js
|   |   |
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |
|   |-- package.json
|   `-- vite.config.js
|
|-- .gitignore
`-- README.md
```

## Local Setup ##
Prerequisites

Ensure the following are installed:

> Node.js
> Python 3.12+
> MySQL
> Git

>>>>>>> Backend Setup <<<<<<<

Navigate to the backend directory:
```
cd backend
```
Create a Python virtual environment:
```
python -m venv venv
```
Activate it.

Windows:
```
venv\Scripts\activate
```
Install dependencies:
```
pip install -r requirements.txt
```
Create a .env file inside the backend directory.
```
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

DATABASE_URL=mysql+pymysql://username:password@localhost:3306/aivoa_hcp_crm
````
Start the backend:
```
uvicorn app.main:app --reload

The API runs on port 8000.

Interactive API documentation is available at /docs.
```
>>>>>>> Frontend Setup <<<<<<<

Navigate to the frontend directory:
```
cd frontend
```
Install dependencies:
```
npm install
```
Start the development server:
```
npm run dev
```
The frontend runs on port 5173 by default.

#### Example End-to-End Interaction ####

--> Step 1 — Log Interaction

"Had a meeting with Dr. Ananya Rao today along with Mr. Karthik. We discussed CardioX safety concerns and dosage adherence. The sentiment was positive and I shared a product brochure and Phase III clinical study report."

--> Step 2 — Edit Interaction

"The HCP was actually Dr. Ananya Reddy and the sentiment was neutral. Keep everything else unchanged."

--> Step 3 — Add Material

"Add the CardioX dosage guide to the materials shared."

--> Step 4 — Schedule Follow-Up

"Schedule a follow-up meeting next Tuesday to discuss treatment outcomes and adherence concerns."

--> Step 5 — Save Interaction

"Everything looks correct. Save this interaction."


### API Endpoints ###
```
| Method | Endpoint    | Description                                     |
| ------ | ----------- | ----------------------------------------------- |
| GET    | `/`         | API status                                      |
| GET    | `/health`   | Application health check                        |
| POST   | `/api/chat` | Process conversational HCP interaction requests |
```
### Design Decisions ###

---> Why LangGraph?

  LangGraph provides explicit agent workflow orchestration and structured state management while allowing the LLM to perform intent recognition and tool selection.

---> Why Redux?

  Redux Toolkit provides centralized interaction state management, allowing AI-generated structured data to immediately synchronize with the CRM form.

---> Why Deterministic Date Resolution?

  LLMs are effective at natural-language understanding but should not be exclusively trusted for calendar arithmetic.
  The application therefore combines LLM reasoning with deterministic Python date calculations for relative dates.

---> Why Explicit Save?

  Interaction data is persisted only when the user explicitly requests it, preventing incomplete conversations from automatically creating database records.
  
### Security ###

--> API credentials are loaded through environment variables.
--> .env files are excluded from version control.
--> Database credentials are not committed to the repository.
--> AI interactions are processed through the backend rather than exposing API credentials in the frontend.

### Future Enhancements ###

---> HCP directory search and autocomplete
---> Voice-note transcription with explicit consent
---> CRM authentication and role-based access control
---> Audit trails for AI-generated modifications
---> Human confirmation before persistence
---> Advanced pharmaceutical compliance validation
---> Containerized deployment
---> Automated testing and CI/CD

