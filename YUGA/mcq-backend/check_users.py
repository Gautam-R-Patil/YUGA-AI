import os
import pymongo
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

try:
    client = pymongo.MongoClient(MONGO_URI)
    db = client.get_default_database()
    users_col = db["users"]
    
    print("Connected to MongoDB")
    print(f"Database: {db.name}")
    
    users = list(users_col.find().sort("createdAt", -1).limit(20))
    print(f"Found {len(users)} users")
    
    for u in users:
        # Convert ObjectId to string for JSON serialization
        u["_id"] = str(u["_id"])
        # Check if password looks like a bcrypt hash
        pw = u.get("password", "")
        is_hashed = pw.startswith("$2a$") or pw.startswith("$2b$")
        if pw:
            u["password"] = f"[HASHED: {is_hashed}]"
        
        import json
        print(json.dumps(u, default=str))
        
    client.close()
except Exception as e:
    print(f"Error: {e}")
