from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from contextlib import asynccontextmanager

from .schema import schema
from .database import close_driver, verify_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        connected = await verify_connection()
        if connected:
            print("✓ Connected to Neo4j")
    except Exception as e:
        print(f"✗ Failed to connect to Neo4j: {e}")
    
    yield
    
    # Shutdown
    await close_driver()
    print("✓ Neo4j connection closed")


app = FastAPI(
    title="Bimoi API",
    description="Personal social graph exploration platform",
    version="0.1.0",
    lifespan=lifespan
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GraphQL endpoint
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        connected = await verify_connection()
        return {"status": "healthy", "neo4j": connected}
    except Exception as e:
        return {"status": "unhealthy", "neo4j": False, "error": str(e)}
