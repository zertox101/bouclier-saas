
from sqlalchemy.orm import Session
from app.models.academy_sql import AcademyModule, AcademyCourse, AcademyLab

def seed_academy(db: Session):
    # Check if exists
    if db.query(AcademyModule).first():
        return

    print("Seeding Academy Content...")

    # 1. Real-time Data Science for Cybersecurity
    m1 = AcademyModule(org_id="default", title="Real-time Data Science for Cybersecurity", 
                     description_md="Master data pipelines for security.", tags_json=["Data Science", "ML"])
    db.add(m1)
    db.flush()
    c1 = AcademyCourse(org_id="default", module_id=m1.id, title="Intro to Security DataFrames", level="Beginner", duration_estimate="2h")
    db.add(c1)

    # 2. Digital Forensics ML
    m2 = AcademyModule(org_id="default", title="Machine Learning for Digital Forensics", 
                     description_md="Automated artifact analysis.", tags_json=["Forensics", "ML"])
    db.add(m2)

    # 3. GenAI for Security
    m3 = AcademyModule(org_id="default", title="Generative AI for Cybersecurity", 
                     description_md="Using LLMs for defense.", tags_json=["AI", "LLM"])
    db.add(m3)
    
    # 4. SOC Blue Team
    m4 = AcademyModule(org_id="default", title="SOC Analyst Mastery", 
                     description_md="Core skills for Tier 1 analysts.", tags_json=["SOC", "Blue Team"])
    db.add(m4)

    # 8. OWASP API
    l1 = AcademyLab(
        org_id="default", title="OWASP API Top 10: Broken Object Level Auth",
        category="API Security", difficulty="Intermediate",
        endpoints_json={"target_host": "academy-vampi", "target_port": 5000},
        tools_allowlist_json=["curl", "burpsuite_community"],
        mappings_json={"owasp_api": ["API1:2019"]}
    )
    db.add(l1)
    
    db.commit()
    print("Academy Seeded.")
