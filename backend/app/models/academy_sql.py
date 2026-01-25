
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON, BigInteger, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.sql import Base

class AcademyModule(Base):
    __tablename__ = "academy_modules"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    title = Column(String, index=True)
    description_md = Column(Text)
    tags_json = Column(JSON, default={})
    
    courses = relationship("AcademyCourse", back_populates="module")

class AcademyCourse(Base):
    __tablename__ = "academy_courses"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    module_id = Column(Integer, ForeignKey("academy_modules.id"))
    title = Column(String)
    level = Column(String) # Beginner, Intermediate, Advanced
    duration_estimate = Column(String) # e.g. "2h"
    
    module = relationship("AcademyModule", back_populates="courses")
    lessons = relationship("AcademyLesson", back_populates="course")

class AcademyLesson(Base):
    __tablename__ = "academy_lessons"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    course_id = Column(Integer, ForeignKey("academy_courses.id"))
    title = Column(String)
    content_md = Column(Text)
    order_index = Column(Integer, default=0)
    
    course = relationship("AcademyCourse", back_populates="lessons")

class AcademyLab(Base):
    __tablename__ = "academy_labs"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    title = Column(String)
    category = Column(String) # Web, Network, Forensics, etc.
    difficulty = Column(String)
    endpoints_json = Column(JSON) # {"target_host": "crapi", "target_port": 80}
    tools_allowlist_json = Column(JSON) # ["nmap", "curl"]
    mappings_json = Column(JSON) # {"mitre": ["T1059"], "owasp": ["A01:2021"]}
    enabled = Column(Boolean, default=True)

class AcademyCohort(Base):
    __tablename__ = "academy_cohorts"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    name = Column(String)
    starts_at = Column(DateTime)
    ends_at = Column(DateTime)

class AcademyCohortMember(Base):
    __tablename__ = "academy_cohort_members"
    id = Column(Integer, primary_key=True, index=True)
    cohort_id = Column(Integer, ForeignKey("academy_cohorts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role_in_cohort = Column(String, default="attendant")

class AcademyLabSession(Base):
    __tablename__ = "academy_lab_sessions"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    lab_id = Column(Integer, ForeignKey("academy_labs.id"))
    cohort_id = Column(Integer, ForeignKey("academy_cohorts.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    status = Column(String, default="active") # active, closed

class AcademyEvent(Base):
    __tablename__ = "academy_events"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    lab_session_id = Column(Integer, ForeignKey("academy_lab_sessions.id"))
    event_type = Column(String)
    payload_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class AcademyArtifact(Base):
    __tablename__ = "academy_artifacts"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    lab_session_id = Column(Integer, ForeignKey("academy_lab_sessions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    path = Column(String)
    size = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class AcademyWriteup(Base):
    __tablename__ = "academy_writeups"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    lab_session_id = Column(Integer, ForeignKey("academy_lab_sessions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    markdown = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow)

class AcademyQuizQuestion(Base):
    __tablename__ = "academy_quiz_questions"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    course_id = Column(Integer, ForeignKey("academy_courses.id"))
    question = Column(String)
    options_json = Column(JSON) # ["A", "B", "C"]
    answer_index = Column(Integer)

class AcademyQuizAttempt(Base):
    __tablename__ = "academy_quiz_attempts"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    course_id = Column(Integer, ForeignKey("academy_courses.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Float)
    submitted_at = Column(DateTime, default=datetime.utcnow)

class AcademyAuditEvent(Base):
    __tablename__ = "academy_audit_events"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String) # LAB_START, TOOL_RUN
    entity_type = Column(String)
    entity_id = Column(String)
    metadata_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
