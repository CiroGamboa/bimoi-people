from neo4j import GraphDatabase, AsyncGraphDatabase
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from .config import get_settings

settings = get_settings()

# Async driver for Neo4j
driver = AsyncGraphDatabase.driver(
    settings.neo4j_uri,
    auth=(settings.neo4j_user, settings.neo4j_password)
)


async def get_db():
    """Get an async Neo4j session."""
    async with driver.session() as session:
        yield session


@asynccontextmanager
async def get_session() -> AsyncGenerator:
    """Context manager for Neo4j session."""
    async with driver.session() as session:
        yield session


async def close_driver():
    """Close the Neo4j driver."""
    await driver.close()


async def verify_connection():
    """Verify the Neo4j connection is working."""
    async with driver.session() as session:
        result = await session.run("RETURN 1 as n")
        record = await result.single()
        return record["n"] == 1
