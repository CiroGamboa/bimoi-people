# Bimoi - Personal Social Graph Explorer

Bimoi is an experimental platform designed to explore, model, and understand human relationships and social networks. It treats relationships as a graph, not a list.

## Philosophy

- **Real relationships only**: Only add people you actually know
- **Relationships have context**: Every connection includes why it exists and matters
- **Value is relational**: A person's importance emerges from how they connect others
- **Privacy by default**: Your graph is private and intentional
- **Learning over optimization**: Insight and reflection over automation

## Tech Stack

- **Neo4j** - Graph database for natural relationship modeling
- **FastAPI + Strawberry** - Python GraphQL backend
- **Next.js** - React frontend with interactive visualization
- **Docker** - Reproducible local development

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Running with Docker

```bash
# Start all services
docker compose up

# In another terminal, seed the database with sample data
docker compose exec backend python -m app.seed
```

Access the application:
- **Frontend**: http://localhost:3000
- **GraphQL Playground**: http://localhost:8000/graphql
- **Neo4j Browser**: http://localhost:7474 (user: neo4j, password: bimoi_dev_password)

### Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export NEO4J_URI=bolt://localhost:7687
export NEO4J_USER=neo4j
export NEO4J_PASSWORD=bimoi_dev_password

# Run the server
uvicorn app.main:app --reload --port 8000

# Seed the database
python -m app.seed
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Generate TypeScript types from GraphQL schema (optional)
npm run codegen
```

## GraphQL API

### Queries

```graphql
# Get the current user
query {
  me {
    id
    name
    connections {
      person { name }
      trustLevel
      context
    }
  }
}

# Get full graph for visualization
query {
  graph(depth: 2) {
    nodes {
      id
      name
      tags
      degree
    }
    edges {
      source
      target
      trustLevel
    }
  }
}

# Filter people by tags
query {
  people(tags: ["engineering", "startups"]) {
    name
    tags
  }
}
```

### Mutations

```graphql
# Create a person
mutation {
  createPerson(input: {
    name: "Jane Doe"
    bio: "Software engineer"
    tags: ["engineering", "python"]
    offers: "Technical mentorship"
    seeks: "Interesting projects"
  }) {
    id
    name
  }
}

# Connect two people
mutation {
  createConnection(
    fromId: "your-id"
    toId: "jane-id"
    input: {
      trustLevel: 4
      context: "Met at a conference"
      notes: "Great technical insights"
    }
  ) {
    relationshipId
  }
}

# Set yourself as the graph owner
mutation {
  setAsMe(id: "your-person-id") {
    id
    isUser
  }
}
```

## Data Model

### Person Node

| Property | Type | Description |
|----------|------|-------------|
| id | UUID | Unique identifier |
| name | String | Full name |
| bio | String? | Brief description |
| tags | String[] | Skills, industries, interests |
| offers | String? | What they can provide |
| seeks | String? | What they're looking for |
| is_user | Boolean | Marks the graph owner |
| created_at | DateTime | When added |

### KNOWS Relationship

| Property | Type | Description |
|----------|------|-------------|
| id | UUID | Unique identifier |
| since | Date? | When you met |
| trust_level | Int (1-5) | How much you trust them |
| context | String? | How/why you know them |
| notes | String? | Why they're valuable |

## Features

- **Interactive Graph Visualization**: Explore your network visually with drag, zoom, and click interactions
- **First & Second Degree Connections**: See direct contacts and friends-of-friends
- **Trust Levels**: Rate relationships from 1-5 to highlight your closest connections
- **Relationship Context**: Record how you know someone and why they matter
- **Tag-based Filtering**: Filter your network by skills, industries, or interests
- **Profile Cards**: View what each person offers and seeks

## Project Structure

```
bimoi-people/
├── docker-compose.yml
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app with GraphQL router
│   │   ├── database.py       # Neo4j connection
│   │   ├── schema/           # GraphQL types, queries, mutations
│   │   ├── services/         # Graph service with Cypher queries
│   │   └── seed.py           # Sample data seeder
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/                  # Next.js app router
│   ├── components/
│   │   ├── graph/            # Network visualization
│   │   ├── people/           # Person and connection forms
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   ├── apollo-client.ts  # GraphQL client
│   │   └── graphql/          # Queries and mutations
│   ├── Dockerfile
│   └── package.json
└── README.md
```

## What This Is NOT

- A social network for public sharing
- A CRM with reminders and activity tracking
- A recommendation engine
- A growth or monetization experiment

## Success Criteria

This PoC succeeds if it helps you:
- See your social network differently
- Identify previously invisible relational patterns
- Reflect more intentionally on how connections create value
- Ask better questions about human relationships

---

*Built with curiosity about the nature of human connection.*
