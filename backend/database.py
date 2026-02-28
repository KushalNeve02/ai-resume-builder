from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Uses SQLite locally → swap DATABASE_URL in .env for PostgreSQL in production
# SQLite  : sqlite:///./resume_builder.db
# Postgres: postgresql://user:password@localhost/resume_builder
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./resume_builder.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
