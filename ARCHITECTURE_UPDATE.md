# SHIELD Security Framework - Architecture Update v2.0

## 1. Modular Backend Architecture
We have successfully refactored the backend into a robust, scalable architecture:
- **Core API (`app.main`, `app.routes.api`)**: Next.js 14 compatible REST API + WebSockets.
- **Data Layer (`app.models.sql`, `init_db.py`)**: 
  - **PostgreSQL**: Persisting Alerts, Traffic Stats, and Users.
  - **Redis**: Configured for caching and real-time pub/sub.
- **AI Engine (`app.services.analytics`, `app.services.llm`)**:
  - **Behavioral Anomaly Detection**: Isolation Forest model training on live traffic.
  - **Sentinel LLM**: Context-aware chat engine for security analysis.

## 2. Distributed Agent (`agent.py`)
A lightweight Python agent that mimics the Go/Rust endpoint behavior:
- Collects System Metrics (CPU, RAM, Disk).
- Simulates Local Log Events.
- Heartbeats to the central Grid.

## 3. Real-time Pipeline
- **WebSockets**: `/ws/traffic` feeds live data to the Threat Map.
- **Persistence**: All high-severity events are now saved to the SQL database.

## 4. Next Steps
- **Frontend Integration**: Connect the "Sentinel Chat" to the new `/api/sentinel/chat` endpoint (already aligned).
- **Visualization**: Verify the Sankey diagram retrieves data from `/api/sources`.
- **Authentication**: Enable the JWT layer using `app.models.sql.User`.

The system is now running in **Full Enterprise Mode**.
