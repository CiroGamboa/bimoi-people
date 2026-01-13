import strawberry
from typing import Optional
from .types import Person, GraphData
from ..services.graph_service import GraphService


@strawberry.type
class Query:
    @strawberry.field
    async def me(self) -> Optional[Person]:
        """Get the current user's person node."""
        service = GraphService()
        return await service.get_user()
    
    @strawberry.field
    async def person(self, id: str) -> Optional[Person]:
        """Get a specific person by ID."""
        service = GraphService()
        return await service.get_person(id)
    
    @strawberry.field
    async def people(self, tags: Optional[list[str]] = None) -> list[Person]:
        """Get all people, optionally filtered by tags."""
        service = GraphService()
        return await service.get_people(tags)
    
    @strawberry.field
    async def graph(self, depth: int = 2) -> GraphData:
        """Get the full graph data for visualization."""
        service = GraphService()
        return await service.get_graph_data(depth)
