
from sqlalchemy.orm import Session
from app.models.academy_sql import AcademyModule, AcademyCourse, AcademyLab

# Org UUIDs matching seed_orgs.py
PRO_ORG_ID = "00000000-0000-0000-0000-000000000001"

def seed_academy(db: Session):
    # Check if Mythos exists specifically
    if db.query(AcademyModule).filter(AcademyModule.title == "Mythos Strategic Hardening").first():
        print("Mythos content already seeded. Skipping.")
        return

    print("Seeding Academy Content...")

    # 1. Real-time Data Science for Cybersecurity
    m1 = AcademyModule(org_id=PRO_ORG_ID, title="Real-time Data Science for Cybersecurity", 
                     description_md="Master data pipelines for security.", tags_json=["Data Science", "ML"])
    db.add(m1)
    db.flush()
    c1 = AcademyCourse(org_id=PRO_ORG_ID, module_id=m1.id, title="Intro to Security DataFrames", level="Beginner", duration_estimate="2h")
    db.add(c1)

    # 2. Digital Forensics ML
    m2 = AcademyModule(org_id=PRO_ORG_ID, title="Machine Learning for Digital Forensics", 
                     description_md="Automated artifact analysis.", tags_json=["Forensics", "ML"])
    db.add(m2)

    # 3. GenAI for Security
    m3 = AcademyModule(org_id=PRO_ORG_ID, title="Generative AI for Cybersecurity", 
                     description_md="Using LLMs for defense.", tags_json=["AI", "LLM"])
    db.add(m3)
    
    # 4. SOC Blue Team
    m4 = AcademyModule(org_id=PRO_ORG_ID, title="SOC Analyst Mastery", 
                     description_md="Core skills for Tier 1 analysts.", tags_json=["SOC", "Blue Team"])
    db.add(m4)

    # 5. Mythos Strategic Hardening (NEW)
    m5 = AcademyModule(org_id=PRO_ORG_ID, title="Mythos Strategic Hardening", 
                     description_md="Advanced hardening guides for AWS, Docker, M365, and more, designed for the post-Mythos landscape.", 
                     tags_json=["Mythos", "Hardening", "Enterprise"])
    db.add(m5)
    db.flush()
    
    stacks = [
        ("AWS Infrastructure Hardening", "Intermediate"),
        ("Docker & Container Security", "Advanced"),
        ("Microsoft 365 Defense", "Intermediate"),
        ("Linux Server Lockdown", "Advanced"),
        ("Credential Security & MFA", "Basic"),
        ("Network Equipment Audit", "Intermediate")
    ]
    for title, level in stacks:
        c = AcademyCourse(org_id=PRO_ORG_ID, module_id=m5.id, title=title, level=level, duration_estimate="3h")
        db.add(c)

    # 6. Mythos Adversarial Defense (NEW)
    m6 = AcademyModule(org_id=PRO_ORG_ID, title="Mythos Adversarial Defense", 
                     description_md="Understanding AI-driven exploitation and response plans.", 
                     tags_json=["Mythos", "Adversarial", "Strategy"])
    db.add(m6)
    db.flush()
    
    courses = [
        ("Mythos Intelligence Brief", "Intermediate"),
        ("Project Glasswing Dossier", "Intermediate"),
        ("Technical Analysis of Mythos Exploit Economics", "Advanced"),
        ("Day Zero Response Playbook", "Critical")
    ]
    for title, level in courses:
        c = AcademyCourse(org_id=PRO_ORG_ID, module_id=m6.id, title=title, level=level, duration_estimate="4h")
        db.add(c)

    # 8. OWASP API
    l1 = AcademyLab(
        org_id=PRO_ORG_ID, title="OWASP API Top 10: Broken Object Level Auth",
        category="API Security", difficulty="Intermediate",
        endpoints_json={"target_host": "academy-vampi", "target_port": 5000},
        tools_allowlist_json=["curl", "burpsuite_community"],
        mappings_json={"owasp_api": ["API1:2019"]}
    )
    db.add(l1)
    
    db.commit()
    print("Academy Seeded.")

if __name__ == "__main__":
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        seed_academy(db)
    finally:
        db.close()
