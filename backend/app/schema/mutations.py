import strawberry
from typing import Optional
from .types import Person, Connection, PersonInput, ConnectionInput
from ..services.graph_service import GraphService


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_person(self, input: PersonInput) -> Person:
        """Create a new person node."""
        service = GraphService()
        return await service.create_person(input)
    
    @strawberry.mutation
    async def update_person(self, id: str, input: PersonInput) -> Person:
        """Update an existing person."""
        service = GraphService()
        return await service.update_person(id, input)
    
    @strawberry.mutation
    async def delete_person(self, id: str) -> bool:
        """Delete a person and all their relationships."""
        service = GraphService()
        return await service.delete_person(id)
    
    @strawberry.mutation
    async def set_as_me(self, id: str) -> Person:
        """Set a person as the current user (graph owner)."""
        service = GraphService()
        return await service.set_as_user(id)
    
    @strawberry.mutation
    async def create_connection(
        self, 
        from_id: str, 
        to_id: str, 
        input: ConnectionInput
    ) -> Connection:
        """Create a KNOWS relationship between two people."""
        service = GraphService()
        return await service.create_connection(from_id, to_id, input)
    
    @strawberry.mutation
    async def update_connection(
        self, 
        relationship_id: str, 
        input: ConnectionInput
    ) -> Connection:
        """Update an existing relationship."""
        service = GraphService()
        return await service.update_connection(relationship_id, input)
    
    @strawberry.mutation
    async def delete_connection(self, relationship_id: str) -> bool:
        """Delete a relationship between two people."""
        service = GraphService()
        return await service.delete_connection(relationship_id)
