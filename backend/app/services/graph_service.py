from typing import Optional
from datetime import datetime
import uuid

from ..database import get_session
from ..schema.types import (
    Person, Connection, SecondDegreeConnection,
    PersonNode, RelationshipEdge, GraphData,
    PersonInput, ConnectionInput
)


class GraphService:
    """Service for interacting with the Neo4j graph database."""
    
    def _record_to_person(self, record: dict) -> Person:
        """Convert a Neo4j record to a Person object."""
        return Person(
            id=record.get("id", ""),
            name=record.get("name", ""),
            bio=record.get("bio"),
            tags=record.get("tags", []),
            offers=record.get("offers"),
            seeks=record.get("seeks"),
            is_user=record.get("is_user", False),
            created_at=record.get("created_at", datetime.now()),
            city=record.get("city"),
            latitude=record.get("latitude"),
            longitude=record.get("longitude")
        )
    
    async def get_user(self) -> Optional[Person]:
        """Get the person marked as the current user."""
        async with get_session() as session:
            result = await session.run(
                """
                MATCH (p:Person {is_user: true})
                RETURN p {
                    .id, .name, .bio, .tags, .offers, .seeks, .is_user, .created_at,
                    .city, .latitude, .longitude
                } as person
                """
            )
            record = await result.single()
            if record:
                return self._record_to_person(record["person"])
            return None
    
    async def get_person(self, person_id: str) -> Optional[Person]:
        """Get a specific person by ID."""
        async with get_session() as session:
            result = await session.run(
                """
                MATCH (p:Person {id: $id})
                RETURN p {
                    .id, .name, .bio, .tags, .offers, .seeks, .is_user, .created_at,
                    .city, .latitude, .longitude
                } as person
                """,
                id=person_id
            )
            record = await result.single()
            if record:
                return self._record_to_person(record["person"])
            return None
    
    async def get_people(self, tags: Optional[list[str]] = None) -> list[Person]:
        """Get all people, optionally filtered by tags."""
        async with get_session() as session:
            if tags and len(tags) > 0:
                result = await session.run(
                    """
                    MATCH (p:Person)
                    WHERE any(tag IN $tags WHERE tag IN p.tags)
                    RETURN p {
                        .id, .name, .bio, .tags, .offers, .seeks, .is_user, .created_at,
                        .city, .latitude, .longitude
                    } as person
                    ORDER BY p.name
                    """,
                    tags=tags
                )
            else:
                result = await session.run(
                    """
                    MATCH (p:Person)
                    RETURN p {
                        .id, .name, .bio, .tags, .offers, .seeks, .is_user, .created_at,
                        .city, .latitude, .longitude
                    } as person
                    ORDER BY p.name
                    """
                )
            records = await result.data()
            return [self._record_to_person(r["person"]) for r in records]
    
    async def get_connections(self, person_id: str) -> list[Connection]:
        """Get all first-degree connections for a person."""
        async with get_session() as session:
            result = await session.run(
                """
                MATCH (p:Person {id: $id})-[r:KNOWS]-(other:Person)
                RETURN other {
                    .id, .name, .bio, .tags, .offers, .seeks, .is_user, .created_at,
                    .city, .latitude, .longitude
                } as person,
                r {
                    .id, .since, .trust_level, .context, .notes
                } as relationship
                ORDER BY r.trust_level DESC, other.name
                """,
                id=person_id
            )
            records = await result.data()
            connections = []
            for r in records:
                person = self._record_to_person(r["person"])
                rel = r["relationship"]
                connections.append(Connection(
                    person=person,
                    relationship_id=rel.get("id", ""),
                    since=rel.get("since"),
                    trust_level=rel.get("trust_level", 3),
                    context=rel.get("context"),
                    notes=rel.get("notes")
                ))
            return connections
    
    async def get_second_degree_connections(self, person_id: str) -> list[SecondDegreeConnection]:
        """Get second-degree connections (friends of friends)."""
        async with get_session() as session:
            result = await session.run(
                """
                MATCH (me:Person {id: $id})-[:KNOWS]-(friend:Person)-[:KNOWS]-(fof:Person)
                WHERE me <> fof AND NOT (me)-[:KNOWS]-(fof)
                RETURN DISTINCT fof {
                    .id, .name, .bio, .tags, .offers, .seeks, .is_user, .created_at,
                    .city, .latitude, .longitude
                } as person,
                friend {
                    .id, .name, .bio, .tags, .offers, .seeks, .is_user, .created_at,
                    .city, .latitude, .longitude
                } as connected_via
                ORDER BY fof.name
                """,
                id=person_id
            )
            records = await result.data()
            return [
                SecondDegreeConnection(
                    person=self._record_to_person(r["person"]),
                    connected_via=self._record_to_person(r["connected_via"])
                )
                for r in records
            ]
    
    async def get_graph_data(self, depth: int = 2) -> GraphData:
        """Get all graph data for visualization."""
        async with get_session() as session:
            # Get the user node first
            user_result = await session.run(
                """
                MATCH (user:Person {is_user: true})
                RETURN user.id as user_id
                """
            )
            user_record = await user_result.single()
            user_id = user_record["user_id"] if user_record else None
            
            # Get all nodes with their degree from the user
            if user_id and depth >= 1:
                nodes_result = await session.run(
                    """
                    MATCH (user:Person {is_user: true})
                    OPTIONAL MATCH path = (user)-[:KNOWS*1..2]-(p:Person)
                    WITH user, p, 
                         CASE 
                            WHEN p IS NULL THEN null
                            WHEN length(path) = 1 THEN 1 
                            ELSE 2 
                         END as degree
                    WITH collect(DISTINCT {person: p, degree: degree}) as connections, user
                    UNWIND connections as conn
                    WITH user, conn
                    WHERE conn.person IS NOT NULL
                    RETURN DISTINCT 
                        conn.person.id as id,
                        conn.person.name as name,
                        conn.person.tags as tags,
                        conn.person.is_user as is_user,
                        conn.degree as degree,
                        conn.person.city as city,
                        conn.person.latitude as latitude,
                        conn.person.longitude as longitude
                    UNION
                    MATCH (user:Person {is_user: true})
                    RETURN user.id as id, user.name as name, user.tags as tags, 
                           true as is_user, 0 as degree,
                           user.city as city, user.latitude as latitude, user.longitude as longitude
                    """,
                    depth=depth
                )
            else:
                # Fallback: just get all people
                nodes_result = await session.run(
                    """
                    MATCH (p:Person)
                    RETURN p.id as id, p.name as name, p.tags as tags, 
                           p.is_user as is_user, 
                           CASE WHEN p.is_user THEN 0 ELSE 1 END as degree,
                           p.city as city, p.latitude as latitude, p.longitude as longitude
                    """
                )
            
            nodes_records = await nodes_result.data()
            nodes = [
                PersonNode(
                    id=r["id"],
                    name=r["name"],
                    tags=r.get("tags", []),
                    is_user=r.get("is_user", False),
                    degree=r.get("degree", 1),
                    city=r.get("city"),
                    latitude=r.get("latitude"),
                    longitude=r.get("longitude")
                )
                for r in nodes_records if r["id"]
            ]
            
            # Get all edges
            node_ids = [n.id for n in nodes]
            if node_ids:
                edges_result = await session.run(
                    """
                    MATCH (a:Person)-[r:KNOWS]-(b:Person)
                    WHERE a.id IN $node_ids AND b.id IN $node_ids AND a.id < b.id
                    RETURN r.id as id, a.id as source, b.id as target, 
                           r.trust_level as trust_level, r.context as context
                    """,
                    node_ids=node_ids
                )
                edges_records = await edges_result.data()
                edges = [
                    RelationshipEdge(
                        id=r["id"],
                        source=r["source"],
                        target=r["target"],
                        trust_level=r.get("trust_level", 3),
                        context=r.get("context")
                    )
                    for r in edges_records
                ]
            else:
                edges = []
            
            return GraphData(nodes=nodes, edges=edges)
    
    async def create_person(self, input: PersonInput) -> Person:
        """Create a new person node."""
        person_id = str(uuid.uuid4())
        created_at = datetime.now()
        
        async with get_session() as session:
            result = await session.run(
                """
                CREATE (p:Person {
                    id: $id,
                    name: $name,
                    bio: $bio,
                    tags: $tags,
                    offers: $offers,
                    seeks: $seeks,
                    is_user: false,
                    created_at: $created_at,
                    city: $city,
                    latitude: $latitude,
                    longitude: $longitude
                })
                RETURN p {
                    .id, .name, .bio, .tags, .offers, .seeks, .is_user, .created_at,
                    .city, .latitude, .longitude
                } as person
                """,
                id=person_id,
                name=input.name,
                bio=input.bio,
                tags=input.tags,
                offers=input.offers,
                seeks=input.seeks,
                created_at=created_at,
                city=input.city,
                latitude=input.latitude,
                longitude=input.longitude
            )
            record = await result.single()
            return self._record_to_person(record["person"])
    
    async def update_person(self, person_id: str, input: PersonInput) -> Person:
        """Update an existing person."""
        async with get_session() as session:
            result = await session.run(
                """
                MATCH (p:Person {id: $id})
                SET p.name = $name,
                    p.bio = $bio,
                    p.tags = $tags,
                    p.offers = $offers,
                    p.seeks = $seeks,
                    p.city = $city,
                    p.latitude = $latitude,
                    p.longitude = $longitude
                RETURN p {
                    .id, .name, .bio, .tags, .offers, .seeks, .is_user, .created_at,
                    .city, .latitude, .longitude
                } as person
                """,
                id=person_id,
                name=input.name,
                bio=input.bio,
                tags=input.tags,
                offers=input.offers,
                seeks=input.seeks,
                city=input.city,
                latitude=input.latitude,
                longitude=input.longitude
            )
            record = await result.single()
            if record:
                return self._record_to_person(record["person"])
            raise ValueError(f"Person with id {person_id} not found")
    
    async def delete_person(self, person_id: str) -> bool:
        """Delete a person and all their relationships."""
        async with get_session() as session:
            result = await session.run(
                """
                MATCH (p:Person {id: $id})
                DETACH DELETE p
                RETURN count(p) as deleted
                """,
                id=person_id
            )
            record = await result.single()
            return record["deleted"] > 0
    
    async def set_as_user(self, person_id: str) -> Person:
        """Set a person as the current user (unset any previous user)."""
        async with get_session() as session:
            # First, unset any existing user
            await session.run(
                """
                MATCH (p:Person {is_user: true})
                SET p.is_user = false
                """
            )
            # Then set the new user
            result = await session.run(
                """
                MATCH (p:Person {id: $id})
                SET p.is_user = true
                RETURN p {
                    .id, .name, .bio, .tags, .offers, .seeks, .is_user, .created_at,
                    .city, .latitude, .longitude
                } as person
                """,
                id=person_id
            )
            record = await result.single()
            if record:
                return self._record_to_person(record["person"])
            raise ValueError(f"Person with id {person_id} not found")
    
    async def create_connection(
        self, 
        from_id: str, 
        to_id: str, 
        input: ConnectionInput
    ) -> Connection:
        """Create a KNOWS relationship between two people."""
        relationship_id = str(uuid.uuid4())
        
        async with get_session() as session:
            result = await session.run(
                """
                MATCH (a:Person {id: $from_id}), (b:Person {id: $to_id})
                CREATE (a)-[r:KNOWS {
                    id: $rel_id,
                    since: $since,
                    trust_level: $trust_level,
                    context: $context,
                    notes: $notes
                }]->(b)
                RETURN b {
                    .id, .name, .bio, .tags, .offers, .seeks, .is_user, .created_at,
                    .city, .latitude, .longitude
                } as person,
                r {
                    .id, .since, .trust_level, .context, .notes
                } as relationship
                """,
                from_id=from_id,
                to_id=to_id,
                rel_id=relationship_id,
                since=input.since,
                trust_level=input.trust_level,
                context=input.context,
                notes=input.notes
            )
            record = await result.single()
            if record:
                person = self._record_to_person(record["person"])
                rel = record["relationship"]
                return Connection(
                    person=person,
                    relationship_id=rel["id"],
                    since=rel.get("since"),
                    trust_level=rel.get("trust_level", 3),
                    context=rel.get("context"),
                    notes=rel.get("notes")
                )
            raise ValueError("Failed to create connection")
    
    async def update_connection(
        self, 
        relationship_id: str, 
        input: ConnectionInput
    ) -> Connection:
        """Update an existing relationship."""
        async with get_session() as session:
            result = await session.run(
                """
                MATCH (a:Person)-[r:KNOWS {id: $rel_id}]-(b:Person)
                SET r.since = $since,
                    r.trust_level = $trust_level,
                    r.context = $context,
                    r.notes = $notes
                RETURN b {
                    .id, .name, .bio, .tags, .offers, .seeks, .is_user, .created_at,
                    .city, .latitude, .longitude
                } as person,
                r {
                    .id, .since, .trust_level, .context, .notes
                } as relationship
                """,
                rel_id=relationship_id,
                since=input.since,
                trust_level=input.trust_level,
                context=input.context,
                notes=input.notes
            )
            record = await result.single()
            if record:
                person = self._record_to_person(record["person"])
                rel = record["relationship"]
                return Connection(
                    person=person,
                    relationship_id=rel["id"],
                    since=rel.get("since"),
                    trust_level=rel.get("trust_level", 3),
                    context=rel.get("context"),
                    notes=rel.get("notes")
                )
            raise ValueError(f"Relationship with id {relationship_id} not found")
    
    async def delete_connection(self, relationship_id: str) -> bool:
        """Delete a relationship between two people."""
        async with get_session() as session:
            result = await session.run(
                """
                MATCH ()-[r:KNOWS {id: $rel_id}]-()
                DELETE r
                RETURN count(r) as deleted
                """,
                rel_id=relationship_id
            )
            record = await result.single()
            return record["deleted"] > 0
