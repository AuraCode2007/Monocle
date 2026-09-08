from database import engine

try:
    with engine.connect() as connection:
        print("✅ DATABASE CONNECTION SUCCESSFUL!")
        print("Connected to PostgreSQL successfully.")

except Exception as e:
    print("❌ DATABASE CONNECTION FAILED")
    print(e)