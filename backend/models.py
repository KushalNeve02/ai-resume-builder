from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class UserProfile(Base):
    """Stores a user's full resume profile data as JSON."""
    __tablename__ = "user_profiles"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(100), unique=True, index=True)
    email        = Column(String(150))
    phone        = Column(String(30))
    location     = Column(String(150))
    linkedin     = Column(String(300))
    github       = Column(String(300))
    portfolio    = Column(String(300))
    summary      = Column(Text, default="")
    profile_json = Column(Text)          # full profile stored as JSON string
    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<UserProfile name={self.name}>"


class GeneratedDocument(Base):
    """Stores every AI-generated document (resume, cover letter, portfolio)."""
    __tablename__ = "generated_documents"

    id             = Column(Integer, primary_key=True, index=True)
    user_name      = Column(String(100), index=True)
    doc_type       = Column(String(30))   # "resume" | "coverletter" | "portfolio"
    content        = Column(Text)
    target_role    = Column(String(200), default="")
    target_company = Column(String(200), default="")
    created_at     = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<GeneratedDocument user={self.user_name} type={self.doc_type}>"
