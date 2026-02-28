from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import httpx, os, json
from dotenv import load_dotenv
from datetime import datetime

from database import SessionLocal, engine
import models
from templates import TEMPLATE_RENDERERS, TEMPLATE_META, recommend_template

load_dotenv()
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Builder API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama-3.3-70b-versatile"



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Pydantic Schemas ─────────────────────────────────────────────────────────────
class EducationItem(BaseModel):
    degree: str = ""
    institution: str = ""
    year: str = ""
    gpa: str = ""
    coursework: str = ""

class ExperienceItem(BaseModel):
    role: str = ""
    company: str = ""
    duration: str = ""
    description: str = ""

class ProjectItem(BaseModel):
    name: str = ""
    tech: str = ""
    description: str = ""
    link: str = ""

class SkillsData(BaseModel):
    technical: str = ""
    soft: str = ""
    tools: str = ""

class ResumeData(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""
    summary: str = ""
    education: List[EducationItem] = []
    experience: List[ExperienceItem] = []
    skills: SkillsData = SkillsData()
    projects: List[ProjectItem] = []
    targetRole: str = ""
    targetCompany: str = ""
    tone: str = "professional"

class GenerateResumeRequest(BaseModel):
    data: ResumeData
    mode: str        # "templated" | "custom"
    templateId: str  # "tech"|"corporate"|"creative"|"minimal"|"ai-pick"

class GenerateDocsRequest(BaseModel):
    data: ResumeData
    docTypes: List[str]

class SaveProfileRequest(BaseModel):
    data: ResumeData


# ── Claude helper ────────────────────────────────────────────────────────────────
async def call_claude(prompt: str, max_tokens: int = 2000) -> str:
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    async with httpx.AsyncClient(timeout=90.0) as client:
        r = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": GROQ_MODEL,
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}]
            },
        )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Groq API error: {r.text}")
    return r.json()["choices"][0]["message"]["content"]


# ── Prompt builders ───────────────────────────────────────────────────────────────
def build_enrichment_prompt(d: ResumeData, target_template: str) -> str:
    edu  = "\n".join(f"- {e.degree} at {e.institution} ({e.year}) GPA:{e.gpa} | {e.coursework}" for e in d.education)
    exp  = "\n".join(f"- {e.role} at {e.company} ({e.duration}): {e.description}" for e in d.experience)
    proj = "\n".join(f"- {p.name} [{p.tech}]: {p.description} | {p.link}" for p in d.projects)
    t_hint = f'"{target_template}"' if target_template != "ai-pick" else '"tech" or "corporate" or "creative" or "minimal" — pick the best for this profile'

    return f"""You are an expert resume writer. Analyze this student profile and return ONLY a valid JSON object — no markdown, no explanation, just raw JSON.

Enhance content professionally: strong action verbs, quantify achievements, tailor to {d.targetRole} at {d.targetCompany}.

Profile:
Name:{d.name} | Email:{d.email} | Phone:{d.phone} | Location:{d.location}
LinkedIn:{d.linkedin} | GitHub:{d.github} | Portfolio:{d.portfolio}
Target:{d.targetRole} at {d.targetCompany} | Tone:{d.tone}
Education: {edu}
Experience: {exp}
Skills — Technical:{d.skills.technical} | Soft:{d.skills.soft} | Tools:{d.skills.tools}
Projects: {proj}

Return this exact JSON (no other text):
{{
  "name": "{d.name}",
  "target_role": "{d.targetRole}",
  "summary": "2-3 sentence powerful professional summary tailored to the role",
  "contact": {{"email":"{d.email}","phone":"{d.phone}","location":"{d.location}","linkedin":"{d.linkedin}","github":"{d.github}","portfolio":"{d.portfolio}"}},
  "education": [{{"degree":"...","institution":"...","year":"...","gpa":"...","details":"..."}}],
  "experience": [{{"role":"...","company":"...","duration":"...","bullets":["Action verb + achievement + metric","Action verb + achievement + metric","Action verb + achievement + metric"]}}],
  "skills": {{"technical":["skill1","skill2"],"tools":["tool1","tool2"],"soft":["strength1","strength2"]}},
  "projects": [{{"name":"...","tech":["tech1","tech2"],"description":"What, your role, impact/outcome","link":"..."}}],
  "template_recommendation": {t_hint},
  "template_reason": "brief reason"
}}"""


def build_custom_html_prompt(d: ResumeData) -> str:
    edu  = " | ".join(f"{e.degree} at {e.institution} ({e.year})" for e in d.education)
    exp  = " | ".join(f"{e.role} at {e.company}: {e.description}" for e in d.experience)
    proj = " | ".join(f"{p.name} ({p.tech}): {p.description}" for p in d.projects)

    return f"""You are an elite resume designer and writer. Create a UNIQUE, complete, beautiful HTML/CSS resume for this student.

STRICT RULES — follow every one:
1. Return ONLY valid complete HTML — absolutely no markdown or explanation
2. Embed ALL CSS inside a <style> tag in <head>. No external CSS files.
3. Import Google Fonts inside the <style> tag using @import
4. The design must be visually distinctive and tailored to a {d.targetRole} role
5. Include every section: Contact, Summary, Education, Experience, Projects, Skills
6. Enhance all content: strong action verbs, professional tone, quantify where possible
7. Add @media print styles so it prints cleanly as a PDF
8. Make it stand out — unique layout, thoughtful typography, cohesive color palette

Student:
Name: {d.name} | Role: {d.targetRole} at {d.targetCompany}
Email: {d.email} | Phone: {d.phone} | Location: {d.location}
GitHub: {d.github} | LinkedIn: {d.linkedin}
Education: {edu}
Experience: {exp}
Skills — Technical: {d.skills.technical} | Tools: {d.skills.tools}
Projects: {proj}
Summary: {d.summary}
Tone: {d.tone}

Generate the complete HTML resume now:"""


def build_coverletter_prompt(d: ResumeData) -> str:
    return f"""You are an expert career coach. Write a compelling, highly personalized cover letter for {d.name} applying for {d.targetRole} at {d.targetCompany}.
Tone: {d.tone}. 3-4 paragraphs: powerful hook, specific relevant achievements, why this company, confident close.
Address "Dear Hiring Manager".
Skills: {d.skills.technical} | Experience: {', '.join(f"{e.role} at {e.company}" for e in d.experience)}
Projects: {', '.join(p.name for p in d.projects)}
Write the complete cover letter now."""


def build_portfolio_prompt(d: ResumeData) -> str:
    proj_details = "\n".join(f"- {p.name} [{p.tech}]: {p.description}" for p in d.projects)
    return f"""You are a portfolio content strategist. Create rich, engaging portfolio content for {d.name} targeting {d.targetRole}.

Write:
1. Compelling "About Me" bio (2-3 paragraphs, {d.tone} tone, first person)
2. Professional Philosophy (3-4 sentences)
3. Detailed write-ups for each project (problem, role, tech, outcomes)
4. Skills & Expertise narrative
5. Memorable closing statement

Projects:
{proj_details}
Skills: {d.skills.technical} | {d.skills.tools}

Write the complete portfolio content now."""


# ══ ROUTES ══════════════════════════════════════════════════════════════════════

@app.get("/")
def root():
    return {"status": "online", "version": "2.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/templates")
def get_templates():
    return {"templates": TEMPLATE_META}


# ── Main resume generation (smart template OR AI custom) ─────────────────────────
@app.post("/api/generate-resume")
async def generate_resume(req: GenerateResumeRequest, db: Session = Depends(get_db)):
    chosen_template = req.templateId
    template_reason = ""
    result_html = ""

    if req.mode == "templated":
        # 1. Ask Claude to enrich content + pick template if ai-pick
        raw = await call_claude(build_enrichment_prompt(req.data, req.templateId), max_tokens=2500)

        # Parse JSON (strip accidental markdown if any)
        clean = raw.strip()
        if "```" in clean:
            parts = clean.split("```")
            clean = parts[1] if len(parts) > 1 else clean
            if clean.startswith("json\n"):
                clean = clean[5:]
        try:
            enriched = json.loads(clean.strip())
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)[:200]}")

        # Resolve template choice
        if req.templateId == "ai-pick":
            raw_rec = enriched.get("template_recommendation", "tech")
            chosen_template = raw_rec.split("|")[0].strip().strip('"').lower()
            template_reason = enriched.get("template_reason", "")

        if chosen_template not in TEMPLATE_RENDERERS:
            chosen_template = recommend_template(req.data.targetRole)

        # 2. Render selected HTML template
        result_html = TEMPLATE_RENDERERS[chosen_template](enriched)

    elif req.mode == "custom":
        # Claude designs and writes a completely unique HTML resume
        result_html = await call_claude(build_custom_html_prompt(req.data), max_tokens=4000)
        chosen_template = "custom"

        # Strip markdown wrappers if present
        if "```html" in result_html:
            result_html = result_html.split("```html")[1].split("```")[0].strip()
        elif result_html.startswith("```"):
            result_html = result_html.split("```")[1].split("```")[0].strip()
    else:
        raise HTTPException(status_code=400, detail="mode must be 'templated' or 'custom'")

    # Save to DB
    db.add(models.GeneratedDocument(
        user_name=req.data.name,
        doc_type=f"resume_{req.mode}_{chosen_template}",
        content=result_html,
        target_role=req.data.targetRole,
        target_company=req.data.targetCompany,
    ))
    db.commit()

    return {
        "success": True,
        "html": result_html,
        "mode": req.mode,
        "template_used": chosen_template,
        "template_reason": template_reason,
    }


# ── Cover Letter & Portfolio (plain text) ────────────────────────────────────────
@app.post("/api/generate-docs")
async def generate_docs(req: GenerateDocsRequest, db: Session = Depends(get_db)):
    results = {}
    for doc_type in req.docTypes:
        if doc_type == "coverletter":
            results[doc_type] = await call_claude(build_coverletter_prompt(req.data))
        elif doc_type == "portfolio":
            results[doc_type] = await call_claude(build_portfolio_prompt(req.data))
        if doc_type in results:
            db.add(models.GeneratedDocument(
                user_name=req.data.name, doc_type=doc_type,
                content=results[doc_type], target_role=req.data.targetRole,
                target_company=req.data.targetCompany,
            ))
    db.commit()
    return {"success": True, "results": results}


# ── Profile CRUD ─────────────────────────────────────────────────────────────────
@app.post("/api/profiles")
def save_profile(req: SaveProfileRequest, db: Session = Depends(get_db)):
    existing = db.query(models.UserProfile).filter(models.UserProfile.name == req.data.name).first()
    pj = json.dumps(req.data.dict())
    if existing:
        existing.email = req.data.email; existing.phone = req.data.phone
        existing.location = req.data.location; existing.linkedin = req.data.linkedin
        existing.github = req.data.github; existing.portfolio = req.data.portfolio
        existing.summary = req.data.summary; existing.profile_json = pj
        existing.updated_at = datetime.utcnow()
        db.commit()
        return {"success": True, "message": "Profile updated", "id": existing.id}
    new = models.UserProfile(name=req.data.name, email=req.data.email, phone=req.data.phone,
        location=req.data.location, linkedin=req.data.linkedin, github=req.data.github,
        portfolio=req.data.portfolio, summary=req.data.summary, profile_json=pj)
    db.add(new); db.commit(); db.refresh(new)
    return {"success": True, "message": "Profile saved", "id": new.id}

@app.get("/api/profiles/{name}")
def get_profile(name: str, db: Session = Depends(get_db)):
    p = db.query(models.UserProfile).filter(models.UserProfile.name == name).first()
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"success": True, "profile": json.loads(p.profile_json)}

@app.get("/api/profiles")
def list_profiles(db: Session = Depends(get_db)):
    ps = db.query(models.UserProfile).order_by(models.UserProfile.updated_at.desc()).all()
    return {"success": True, "profiles": [{"id": p.id, "name": p.name, "email": p.email} for p in ps]}

@app.get("/api/documents/{user_name}")
def get_documents(user_name: str, db: Session = Depends(get_db)):
    docs = db.query(models.GeneratedDocument).filter(
        models.GeneratedDocument.user_name == user_name
    ).order_by(models.GeneratedDocument.created_at.desc()).all()
    return {"success": True, "documents": [
        {"id": d.id, "doc_type": d.doc_type, "target_role": d.target_role,
         "created_at": str(d.created_at), "content": d.content} for d in docs]}

@app.post("/api/analyze")
async def analyze_resume(req: SaveProfileRequest):
    d = req.data
    edu  = "\n".join(f"- {e.degree} at {e.institution} ({e.year}) GPA:{e.gpa}" for e in d.education)
    exp  = "\n".join(f"- {e.role} at {e.company} ({e.duration}): {e.description}" for e in d.experience)
    proj = "\n".join(f"- {p.name} [{p.tech}]: {p.description}" for p in d.projects)

    prompt = f"""You are an expert career coach and hiring manager. Analyze this student's profile for the target role and company, then give honest, specific, actionable feedback.

Profile:
Name: {d.name}
Target Role: {d.targetRole} at {d.targetCompany}
Education: {edu}
Experience: {exp}
Skills — Technical: {d.skills.technical} | Soft: {d.skills.soft} | Tools: {d.skills.tools}
Projects: {proj}
Summary: {d.summary}

Return ONLY a valid JSON object (no markdown, no explanation):
{{
  "fit_score": <number 0-100>,
  "fit_label": "<Weak Fit | Moderate Fit | Strong Fit | Excellent Fit>",
  "fit_summary": "<2-3 sentence honest overall assessment>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "missing_skills": ["<skill/technology they should learn>", "..."],
  "experience_gaps": ["<gap in experience or background>", "..."],
  "quick_wins": ["<something they can add/fix quickly>", "..."],
  "recommended_actions": [
    {{"priority": "High", "action": "<specific thing to do>", "reason": "<why it matters for this role>"}},
    {{"priority": "High", "action": "...", "reason": "..."}},
    {{"priority": "Medium", "action": "...", "reason": "..."}},
    {{"priority": "Medium", "action": "...", "reason": "..."}},
    {{"priority": "Low", "action": "...", "reason": "..."}}
  ]
}}"""

    raw = await call_claude(prompt, max_tokens=2000)
    clean = raw.strip()
    if "```" in clean:
        parts = clean.split("```")
        clean = parts[1] if len(parts) > 1 else clean
        if clean.startswith("json\n"): clean = clean[5:]
    try:
        return {"success": True, "analysis": json.loads(clean.strip())}
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Parse error: {str(e)[:200]}")


@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.GeneratedDocument).filter(models.GeneratedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(doc); db.commit()
    return {"success": True}