import os
import sys
import json
import requests
from sentence_transformers import SentenceTransformer

# Reconfigure stdout to utf-8 for Windows console support
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "igot_courses")
COURSE_SOURCE_URL = os.getenv("COURSE_SOURCE_URL", "https://sih-project-4v4d.onrender.com/api/domains")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

print("==================================================")
print("[Course Ingestion] Starting Qdrant Embedding Pipeline")
print(f"   Source API URL : {COURSE_SOURCE_URL}")
print(f"   Qdrant Server  : {QDRANT_URL}")
print(f"   Collection     : {QDRANT_COLLECTION}")
print(f"   Local Model    : {EMBEDDING_MODEL_NAME}")
print("==================================================\n")

# Step 1: Load SentenceTransformer model
try:
    print(f"[1/5] Loading local SentenceTransformer model '{EMBEDDING_MODEL_NAME}'...")
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    print("   [OK] Model loaded successfully on local CPU.")
except Exception as e:
    print(f"[ERROR 1/5] Failed to load embedding model: {e}")
    sys.exit(1)

# Step 2: Fetch courses from API
try:
    print(f"\n[2/5] Fetching course dataset from API: {COURSE_SOURCE_URL}...")
    resp = requests.get(COURSE_SOURCE_URL, timeout=15)
    resp.raise_for_status()
    domains_data = resp.json()
    print("   [OK] Course dataset fetched successfully.")
except Exception as e:
    print(f"[ERROR 2/5] Failed to fetch data from {COURSE_SOURCE_URL}: {e}")
    sys.exit(1)

# Step 3: Parse and flatten domain structure
courses = []
for domain in domains_data:
    domain_name = domain.get("domainName") or domain.get("domainId") or "General"
    competencies = domain.get("competencies") or []
    for comp in competencies:
        comp_name = comp.get("competencyName") or comp.get("competencyId") or "General Skill"
        comp_courses = comp.get("courses") or []
        for course in comp_courses:
            course_obj = {
                "id": course.get("id") or f"course-{course.get('numericId')}",
                "numericId": course.get("numericId") or len(courses) + 1,
                "title": course.get("title") or "Untitled Course",
                "level": course.get("level") or "Beginner",
                "competency": course.get("competency") or comp_name,
                "domain": course.get("domain") or domain_name,
                "description": course.get("description") or ""
            }
            courses.append(course_obj)

print(f"   [OK] Parsed {len(courses)} total domain courses.")

# Save to public/content-list-data.json (Replacing legacy courses)
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
json_path = os.path.join(project_dir, "public", "content-list-data.json")

try:
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({"content": courses}, f, indent=2)
    print(f"   [OK] Replaced 'public/content-list-data.json' with new {len(courses)} domain courses.")
except Exception as e:
    print(f"   [WARN] Warning writing JSON file: {e}")

# Step 4: Ensure Qdrant Collection Exists
print(f"\n[3/5] Checking Qdrant vector database connection at {QDRANT_URL}...")
collection_url = f"{QDRANT_URL}/collections/{QDRANT_COLLECTION}"

try:
    res = requests.get(collection_url, timeout=5)
    if res.status_code == 404 or res.status_code != 200:
        print(f"   [ACTION] Creating collection '{QDRANT_COLLECTION}' (384 dims, Cosine distance)...")
        create_res = requests.put(collection_url, json={
            "vectors": {
                "size": 384,
                "distance": "Cosine"
            }
        }, timeout=5)
        create_res.raise_for_status()
        print(f"   [OK] Collection '{QDRANT_COLLECTION}' created successfully in Qdrant.")
    else:
        print(f"   [OK] Collection '{QDRANT_COLLECTION}' already exists in Qdrant.")
except Exception as e:
    print(f"[ERROR 3/5] Failed to connect or create collection in Qdrant: {e}")
    sys.exit(1)

# Step 5: Embed & Upsert Vectors into Qdrant
print(f"\n[4/5] Generating embeddings for {len(courses)} courses & preparing Qdrant points...")
points = []
for idx, c in enumerate(courses):
    embed_text = f"Course Title: {c['title']}\n\nDescription: {c['description']}\n\nSkills: {c['competency']}\n\nLevel: {c['level']}\n\nCategory: {c['domain']}"
    vector = model.encode(embed_text).tolist()
    point_id = c.get("numericId") or (idx + 1)
    
    points.append({
        "id": point_id,
        "vector": vector,
        "payload": {
            "course_id": c["id"],
            "numericId": c["numericId"],
            "title": c["title"],
            "level": c["level"],
            "competency": c["competency"],
            "domain": c["domain"],
            "description": c["description"],
            "embed_text": embed_text
        }
    })

print(f"   [OK] Generated 384-dimensional dense vectors for all {len(points)} courses.")

# Upsert in batches of 50
print(f"\n[5/5] Upserting vector points into Qdrant collection '{QDRANT_COLLECTION}'...")
batch_size = 50
upsert_url = f"{QDRANT_URL}/collections/{QDRANT_COLLECTION}/points"

for i in range(0, len(points), batch_size):
    batch = points[i:i+batch_size]
    print(f"   Upserting batch {i+1} to {min(i+batch_size, len(points))}...")
    res = requests.put(upsert_url, json={"points": batch}, timeout=10)
    res.raise_for_status()

# Verify Qdrant Points Count
count_url = f"{QDRANT_URL}/collections/{QDRANT_COLLECTION}"
verify_res = requests.get(count_url, timeout=5).json()
points_count = verify_res.get("result", {}).get("points_count", len(points))

print("\n==================================================")
print("[Course Ingestion] COMPLETE SUCCESS!")
print(f"   Qdrant Collection : {QDRANT_COLLECTION}")
print(f"   Stored Vectors    : {points_count} points")
print(f"   Vector Dimensions : 384")
print(f"   Dataset Location  : {json_path}")
print("==================================================\n")
