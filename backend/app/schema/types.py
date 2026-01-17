import strawberry
from typing import Optional
from datetime import datetime, date


@strawberry.type
class Person:
    id: str
    name: str
    bio: Optional[str] = None
    tags: list[str] = strawberry.field(default_factory=list)
    offers: Optional[str] = None
    seeks: Optional[str] = None
    is_user: bool = False
    created_at: datetime = strawberry.field(default_factory=datetime.now)
    # Location fields for map view
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


@strawberry.type
class Connection:
    """Represents a relationship between two people with context."""
    person: Person
    relationship_id: str
    since: Optional[date] = None
    trust_level: int = 3  # 1-5 scale
    context: Optional[str] = None
    notes: Optional[str] = None


@strawberry.type
class SecondDegreeConnection:
    """A person known through a mutual connection."""
    person: Person
    connected_via: Person  # The mutual connection


@strawberry.type
class PersonNode:
    """Node representation for graph visualization."""
    id: str
    name: str
    tags: list[str]
    is_user: bool
    degree: int  # 0 = user, 1 = first-degree, 2 = second-degree
    # Location for map view
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


@strawberry.type
class RelationshipEdge:
    """Edge representation for graph visualization."""
    id: str
    source: str  # Person ID
    target: str  # Person ID
    trust_level: int
    context: Optional[str] = None


@strawberry.type
class GraphData:
    """Complete graph data for visualization."""
    nodes: list[PersonNode]
    edges: list[RelationshipEdge]


# Input types for mutations
@strawberry.input
class PersonInput:
    name: str
    bio: Optional[str] = None
    tags: list[str] = strawberry.field(default_factory=list)
    offers: Optional[str] = None
    seeks: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


@strawberry.input
class ConnectionInput:
    since: Optional[date] = None
    trust_level: int = 3
    context: Optional[str] = None
    notes: Optional[str] = None
