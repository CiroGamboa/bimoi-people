"""
Seed script to populate the database with sample data.
Run with: python -m app.seed
"""
import asyncio
from datetime import date, datetime
import uuid

from .database import driver, close_driver


async def clear_database():
    """Remove all nodes and relationships."""
    async with driver.session() as session:
        await session.run("MATCH (n) DETACH DELETE n")
        print("✓ Cleared existing data")


async def create_seed_data():
    """Create sample people and relationships."""
    async with driver.session() as session:
        # Create people
        people = [
            {
                "id": str(uuid.uuid4()),
                "name": "You",
                "bio": "Building Bimoi to understand relationships better",
                "tags": ["product", "engineering", "startups"],
                "offers": "Technical mentorship, product strategy, introductions to VCs",
                "seeks": "Collaborators interested in social graph research",
                "is_user": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Alex Chen",
                "bio": "Senior engineer at a fintech startup",
                "tags": ["engineering", "fintech", "python"],
                "offers": "Technical architecture advice, code reviews",
                "seeks": "Interesting side projects, angel investing opportunities",
                "is_user": False
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Maria Santos",
                "bio": "Product designer with a focus on data visualization",
                "tags": ["design", "data-viz", "ux"],
                "offers": "Design feedback, user research insights",
                "seeks": "Complex visualization challenges",
                "is_user": False
            },
            {
                "id": str(uuid.uuid4()),
                "name": "James Wilson",
                "bio": "Founder of a B2B SaaS company",
                "tags": ["startups", "sales", "b2b"],
                "offers": "Go-to-market strategy, sales playbooks",
                "seeks": "Technical co-founders, enterprise connections",
                "is_user": False
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Sarah Kim",
                "bio": "VC at an early-stage fund",
                "tags": ["vc", "startups", "investing"],
                "offers": "Fundraising advice, portfolio introductions",
                "seeks": "Promising pre-seed founders",
                "is_user": False
            },
            {
                "id": str(uuid.uuid4()),
                "name": "David Park",
                "bio": "Data scientist specializing in graph analytics",
                "tags": ["data-science", "graphs", "machine-learning"],
                "offers": "Graph algorithm expertise, ML consulting",
                "seeks": "Interesting graph problems to solve",
                "is_user": False
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Lisa Zhang",
                "bio": "Engineering manager at a FAANG company",
                "tags": ["engineering", "management", "mentorship"],
                "offers": "Career advice, interview prep, team scaling insights",
                "seeks": "Diverse engineering talent to mentor",
                "is_user": False
            },
            # Second-degree connections (known by first-degree, not by user)
            {
                "id": str(uuid.uuid4()),
                "name": "Robert Taylor",
                "bio": "Serial entrepreneur, 3x founder",
                "tags": ["startups", "entrepreneurship", "strategy"],
                "offers": "Startup mentorship, investor introductions",
                "seeks": "Interesting market opportunities",
                "is_user": False
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Emily Chen",
                "bio": "Head of Product at a unicorn startup",
                "tags": ["product", "growth", "strategy"],
                "offers": "Product strategy, growth frameworks",
                "seeks": "Ambitious product managers to hire",
                "is_user": False
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Michael Brown",
                "bio": "Principal engineer, distributed systems",
                "tags": ["engineering", "distributed-systems", "architecture"],
                "offers": "System design reviews, architecture consulting",
                "seeks": "Challenging technical problems",
                "is_user": False
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Jennifer Lee",
                "bio": "CEO of a design agency",
                "tags": ["design", "agency", "branding"],
                "offers": "Branding strategy, design team scaling",
                "seeks": "Innovative tech startups to partner with",
                "is_user": False
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Chris Martinez",
                "bio": "Angel investor and advisor",
                "tags": ["investing", "advisory", "fintech"],
                "offers": "Angel investment, board experience",
                "seeks": "Pre-seed fintech opportunities",
                "is_user": False
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Amanda Foster",
                "bio": "Research scientist at a tech lab",
                "tags": ["research", "ai", "graphs"],
                "offers": "Academic collaboration, research insights",
                "seeks": "Industry applications for graph research",
                "is_user": False
            },
        ]
        
        # Create all people
        for person in people:
            await session.run(
                """
                CREATE (p:Person {
                    id: $id,
                    name: $name,
                    bio: $bio,
                    tags: $tags,
                    offers: $offers,
                    seeks: $seeks,
                    is_user: $is_user,
                    created_at: $created_at
                })
                """,
                **person,
                created_at=datetime.now()
            )
        print(f"✓ Created {len(people)} people")
        
        # Create relationships
        # First, get IDs by name for easier relationship creation
        result = await session.run("MATCH (p:Person) RETURN p.id as id, p.name as name")
        records = await result.data()
        name_to_id = {r["name"]: r["id"] for r in records}
        
        # First-degree connections (user knows these people)
        first_degree_connections = [
            ("You", "Alex Chen", 5, "2018-03-15", "College roommate, built projects together", "Deeply trust his technical judgment"),
            ("You", "Maria Santos", 4, "2020-06-01", "Met at a design conference", "Incredible eye for data visualization"),
            ("You", "James Wilson", 4, "2019-09-20", "Former coworker, worked on same product", "Great at sales, always honest"),
            ("You", "Sarah Kim", 3, "2021-02-10", "Introduced by James", "Helpful for fundraising insights"),
            ("You", "David Park", 5, "2017-11-05", "Grad school classmate", "Brilliant with graphs, co-authored a paper"),
            ("You", "Lisa Zhang", 4, "2020-01-15", "Met at a meetup, stayed in touch", "Great mentor, gives actionable advice"),
        ]
        
        # Second-degree connections (known by first-degree people)
        second_degree_connections = [
            ("Alex Chen", "Robert Taylor", 4, "2019-05-10", "Robert invested in Alex's previous startup", None),
            ("Alex Chen", "Michael Brown", 5, "2016-08-01", "Former colleagues at the same company", None),
            ("Maria Santos", "Jennifer Lee", 4, "2018-12-01", "Jennifer hired Maria for a project", None),
            ("Maria Santos", "Emily Chen", 3, "2021-04-15", "Met at a product design workshop", None),
            ("James Wilson", "Robert Taylor", 5, "2017-01-01", "Robert mentored James early on", None),
            ("James Wilson", "Emily Chen", 4, "2020-08-20", "Collaborated on a product launch", None),
            ("Sarah Kim", "Chris Martinez", 4, "2019-11-01", "Co-invested in several deals", None),
            ("Sarah Kim", "Robert Taylor", 3, "2020-03-01", "Robert is a LP in Sarah's fund", None),
            ("David Park", "Amanda Foster", 5, "2016-06-01", "Co-researchers, published together", None),
            ("David Park", "Michael Brown", 4, "2018-04-01", "Consulted on a distributed graph project", None),
            ("Lisa Zhang", "Emily Chen", 4, "2019-07-01", "Lisa mentored Emily years ago", None),
            ("Lisa Zhang", "Michael Brown", 3, "2020-02-01", "Worked together briefly", None),
        ]
        
        all_connections = first_degree_connections + second_degree_connections
        
        for from_name, to_name, trust, since_str, context, notes in all_connections:
            from_id = name_to_id[from_name]
            to_id = name_to_id[to_name]
            since_date = date.fromisoformat(since_str) if since_str else None
            
            await session.run(
                """
                MATCH (a:Person {id: $from_id}), (b:Person {id: $to_id})
                CREATE (a)-[r:KNOWS {
                    id: $rel_id,
                    since: $since,
                    trust_level: $trust_level,
                    context: $context,
                    notes: $notes
                }]->(b)
                """,
                from_id=from_id,
                to_id=to_id,
                rel_id=str(uuid.uuid4()),
                since=since_date,
                trust_level=trust,
                context=context,
                notes=notes
            )
        
        print(f"✓ Created {len(all_connections)} relationships")
        print("\n✓ Seed data created successfully!")
        print("  - 1 user node (You)")
        print("  - 6 first-degree connections")
        print("  - 6 second-degree connections (friends of friends)")


async def main():
    print("Seeding Bimoi database...\n")
    await clear_database()
    await create_seed_data()
    await close_driver()


if __name__ == "__main__":
    asyncio.run(main())
