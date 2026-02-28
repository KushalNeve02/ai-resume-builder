"""
Resume Templates — 4 distinct visual styles.
Each function takes an enhanced data dict returned by Claude and renders full HTML.
"""


def render_tech(d: dict) -> str:
    contact = d.get("contact", {})
    education = d.get("education", [])
    experience = d.get("experience", [])
    skills = d.get("skills", {})
    projects = d.get("projects", [])

    tech_tags = "".join(f'<span class="tag">{s}</span>' for s in skills.get("technical", []))
    tool_tags = "".join(f'<span class="tag tool">{s}</span>' for s in skills.get("tools", []))

    edu_html = ""
    for e in education:
        edu_html += f"""
        <div class="edu-item">
          <div class="edu-degree">{e.get('degree','')}</div>
          <div class="edu-inst">{e.get('institution','')} <span class="edu-year">— {e.get('year','')}</span></div>
          {"<div class='edu-gpa'>GPA: "+e.get('gpa','')+"</div>" if e.get('gpa') else ""}
        </div>"""

    exp_html = ""
    for e in experience:
        bullets = "".join(f"<li>{b}</li>" for b in e.get("bullets", []))
        exp_html += f"""
        <div class="exp-item">
          <div class="exp-header">
            <div>
              <div class="exp-role">{e.get('role','')}</div>
              <div class="exp-company">{e.get('company','')}</div>
            </div>
            <div class="exp-dur">{e.get('duration','')}</div>
          </div>
          <ul class="bullets">{bullets}</ul>
        </div>"""

    proj_html = ""
    for p in projects:
        tech_str = " · ".join(p.get("tech", []))
        proj_html += f"""
        <div class="proj-item">
          <div class="proj-top">
            <span class="proj-name">{p.get('name','')}</span>
            <span class="proj-tech">{tech_str}</span>
          </div>
          <div class="proj-desc">{p.get('description','')}</div>
          {"<a class='proj-link' href='"+p.get('link','')+"'>"+p.get('link','')+"</a>" if p.get('link') else ""}
        </div>"""

    soft = " · ".join(skills.get("soft", []))

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{d.get('name','')} — Resume</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  body{{font-family:'Space Grotesk',sans-serif;background:#f0f4f8;display:flex;justify-content:center;padding:2rem;min-height:100vh}}
  .page{{display:grid;grid-template-columns:260px 1fr;width:860px;min-height:1100px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,0.15);border-radius:4px;overflow:hidden}}
  .sidebar{{background:#0d1117;padding:2rem 1.5rem;color:#cdd6f4}}
  .main{{padding:2.5rem 2rem;background:#fff}}
  /* Sidebar */
  .avatar-ring{{width:80px;height:80px;border-radius:50%;border:2px solid #00d2ff;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:2rem;background:#161b22}}
  .s-name{{font-size:1.3rem;font-weight:700;color:#e6edf3;text-align:center;line-height:1.2;margin-bottom:0.25rem}}
  .s-role{{font-family:'JetBrains Mono',monospace;font-size:0.65rem;color:#00d2ff;text-align:center;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1.5rem}}
  .s-divider{{height:1px;background:rgba(0,210,255,0.2);margin:1.25rem 0}}
  .s-label{{font-family:'JetBrains Mono',monospace;font-size:0.6rem;text-transform:uppercase;letter-spacing:0.12em;color:#00d2ff;margin-bottom:0.6rem}}
  .contact-row{{display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;font-size:0.78rem;color:#8b949e;word-break:break-all}}
  .contact-icon{{font-size:0.8rem;flex-shrink:0}}
  .tags{{display:flex;flex-wrap:wrap;gap:0.35rem}}
  .tag{{font-family:'JetBrains Mono',monospace;font-size:0.6rem;background:rgba(0,210,255,0.1);border:1px solid rgba(0,210,255,0.2);color:#79c0ff;padding:0.2rem 0.5rem;border-radius:3px}}
  .tag.tool{{background:rgba(123,92,247,0.1);border-color:rgba(123,92,247,0.25);color:#d2a8ff}}
  .soft-text{{font-size:0.75rem;color:#8b949e;line-height:1.6}}
  /* Main */
  .m-name{{font-size:2rem;font-weight:700;color:#0d1117;letter-spacing:-0.03em;line-height:1}}
  .m-tagline{{font-family:'JetBrains Mono',monospace;font-size:0.7rem;color:#00d2ff;letter-spacing:0.08em;text-transform:uppercase;margin-top:0.2rem;margin-bottom:1.25rem}}
  .summary{{font-size:0.88rem;color:#444;line-height:1.7;padding:1rem;background:#f6f8fa;border-left:3px solid #00d2ff;border-radius:0 4px 4px 0;margin-bottom:1.5rem}}
  .section{{margin-bottom:1.5rem}}
  .sec-title{{font-family:'JetBrains Mono',monospace;font-size:0.65rem;text-transform:uppercase;letter-spacing:0.12em;color:#00d2ff;border-bottom:1px solid #e1e4e8;padding-bottom:0.4rem;margin-bottom:1rem}}
  .edu-item{{margin-bottom:0.75rem}}
  .edu-degree{{font-size:0.92rem;font-weight:600;color:#0d1117}}
  .edu-inst{{font-size:0.8rem;color:#656d76}}
  .edu-year{{color:#00d2ff}}
  .edu-gpa{{font-size:0.75rem;color:#8b949e;margin-top:0.15rem}}
  .exp-item{{margin-bottom:1.25rem;padding-bottom:1.25rem;border-bottom:1px solid #f0f0f0}}
  .exp-item:last-child{{border-bottom:none;margin-bottom:0;padding-bottom:0}}
  .exp-header{{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem}}
  .exp-role{{font-size:0.95rem;font-weight:600;color:#0d1117}}
  .exp-company{{font-size:0.8rem;color:#00d2ff;margin-top:0.1rem}}
  .exp-dur{{font-family:'JetBrains Mono',monospace;font-size:0.65rem;color:#8b949e;white-space:nowrap;margin-left:1rem}}
  .bullets{{margin-left:1.1rem;font-size:0.82rem;color:#444;line-height:1.6}}
  .bullets li{{margin-bottom:0.25rem}}
  .proj-item{{margin-bottom:1rem;padding:0.85rem;background:#f6f8fa;border-radius:6px;border:1px solid #e1e4e8}}
  .proj-top{{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem}}
  .proj-name{{font-weight:600;font-size:0.9rem;color:#0d1117}}
  .proj-tech{{font-family:'JetBrains Mono',monospace;font-size:0.62rem;color:#6e7681;background:#eaeef2;padding:0.15rem 0.5rem;border-radius:3px}}
  .proj-desc{{font-size:0.8rem;color:#444;line-height:1.5}}
  .proj-link{{font-family:'JetBrains Mono',monospace;font-size:0.65rem;color:#00d2ff;text-decoration:none;margin-top:0.3rem;display:inline-block}}
  @media print{{body{{background:#fff;padding:0}} .page{{box-shadow:none;width:100%}}}}
</style>
</head>
<body>
<div class="page">
  <div class="sidebar">
    <div class="avatar-ring">💻</div>
    <div class="s-name">{d.get('name','')}</div>
    <div class="s-role">{d.get('target_role','Software Engineer')}</div>

    <div class="s-divider"></div>
    <div class="s-label">Contact</div>
    <div class="contact-row"><span class="contact-icon">✉</span>{contact.get('email','')}</div>
    <div class="contact-row"><span class="contact-icon">📱</span>{contact.get('phone','')}</div>
    <div class="contact-row"><span class="contact-icon">📍</span>{contact.get('location','')}</div>
    <div class="contact-row"><span class="contact-icon">🔗</span>{contact.get('linkedin','')}</div>
    <div class="contact-row"><span class="contact-icon">⌥</span>{contact.get('github','')}</div>

    <div class="s-divider"></div>
    <div class="s-label">Technical Skills</div>
    <div class="tags">{tech_tags}</div>

    <div class="s-divider"></div>
    <div class="s-label">Tools & Platforms</div>
    <div class="tags">{tool_tags}</div>

    <div class="s-divider"></div>
    <div class="s-label">Soft Skills</div>
    <div class="soft-text">{soft}</div>
  </div>

  <div class="main">
    <div class="m-name">{d.get('name','')}</div>
    <div class="m-tagline">// {d.get('target_role','')}</div>
    <div class="summary">{d.get('summary','')}</div>

    <div class="section">
      <div class="sec-title">Work Experience</div>
      {exp_html}
    </div>

    <div class="section">
      <div class="sec-title">Projects</div>
      {proj_html}
    </div>

    <div class="section">
      <div class="sec-title">Education</div>
      {edu_html}
    </div>
  </div>
</div>
</body></html>"""


def render_corporate(d: dict) -> str:
    contact = d.get("contact", {})
    education = d.get("education", [])
    experience = d.get("experience", [])
    skills = d.get("skills", {})
    projects = d.get("projects", [])

    all_skills = skills.get("technical", []) + skills.get("tools", [])
    skills_html = "".join(f'<li>{s}</li>' for s in all_skills)
    soft_html = "".join(f'<li>{s}</li>' for s in skills.get("soft", []))

    edu_html = ""
    for e in education:
        edu_html += f"""
        <div class="entry">
          <div class="entry-left">
            <div class="entry-title">{e.get('degree','')}</div>
            <div class="entry-sub">{e.get('institution','')} {"| GPA: "+e.get('gpa','') if e.get('gpa') else ''}</div>
          </div>
          <div class="entry-date">{e.get('year','')}</div>
        </div>"""

    exp_html = ""
    for e in experience:
        bullets = "".join(f"<li>{b}</li>" for b in e.get("bullets", []))
        exp_html += f"""
        <div class="entry">
          <div class="entry-left">
            <div class="entry-title">{e.get('role','')}</div>
            <div class="entry-sub">{e.get('company','')}</div>
            <ul class="bullets">{bullets}</ul>
          </div>
          <div class="entry-date">{e.get('duration','')}</div>
        </div>"""

    proj_html = ""
    for p in projects:
        proj_html += f"""
        <div class="proj">
          <span class="proj-name">{p.get('name','')}</span>
          <span class="proj-tech">{', '.join(p.get('tech',[]))}</span>
          <span class="proj-desc"> — {p.get('description','')}</span>
        </div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>{d.get('name','')} — Resume</title>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet"/>
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  body{{font-family:'Source Sans 3',sans-serif;background:#e8ecf0;display:flex;justify-content:center;padding:2rem;min-height:100vh}}
  .page{{width:820px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,0.12)}}
  .header{{background:#1a3557;padding:2.5rem 3rem;color:#fff}}
  .h-name{{font-family:'Libre Baskerville',serif;font-size:2.2rem;font-weight:700;letter-spacing:-0.01em}}
  .h-role{{font-size:1rem;color:#7eb8e8;margin-top:0.2rem;font-weight:300}}
  .h-contacts{{display:flex;flex-wrap:wrap;gap:1rem;margin-top:1rem}}
  .h-c{{font-size:0.78rem;color:#b0c9e0}}
  .h-c a{{color:#7eb8e8;text-decoration:none}}
  .body{{display:grid;grid-template-columns:1fr 220px;gap:0}}
  .main{{padding:2rem 2rem 2rem 3rem;border-right:1px solid #e8ecf0}}
  .aside{{padding:2rem 1.5rem}}
  .sec-title{{font-family:'Libre Baskerville',serif;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.12em;color:#1a3557;border-bottom:2px solid #1a3557;padding-bottom:0.3rem;margin-bottom:1rem}}
  .summary{{font-size:0.88rem;color:#333;line-height:1.7;margin-bottom:1.75rem}}
  .section{{margin-bottom:1.75rem}}
  .entry{{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #f0f0f0}}
  .entry:last-child{{border-bottom:none}}
  .entry-left{{flex:1}}
  .entry-title{{font-weight:600;font-size:0.92rem;color:#111;margin-bottom:0.15rem}}
  .entry-sub{{font-size:0.8rem;color:#1a3557;margin-bottom:0.3rem}}
  .entry-date{{font-size:0.75rem;color:#888;white-space:nowrap;margin-left:1rem;padding-top:0.1rem}}
  .bullets{{margin-left:1rem;font-size:0.8rem;color:#444;line-height:1.6}}
  .bullets li{{margin-bottom:0.2rem}}
  .proj{{margin-bottom:0.6rem;font-size:0.82rem;line-height:1.5}}
  .proj-name{{font-weight:600;color:#1a3557}}
  .proj-tech{{font-size:0.75rem;background:#eef2f7;padding:0.1rem 0.4rem;border-radius:2px;margin:0 0.3rem;color:#555}}
  .proj-desc{{color:#444}}
  /* Aside */
  .skill-list{{list-style:none;font-size:0.8rem;color:#333;line-height:1.9}}
  .skill-list li::before{{content:'▸ ';color:#1a3557}}
  @media print{{body{{background:#fff;padding:0}} .page{{box-shadow:none;width:100%}}}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="h-name">{d.get('name','')}</div>
    <div class="h-role">{d.get('target_role','')}</div>
    <div class="h-contacts">
      <span class="h-c">{contact.get('email','')}</span>
      <span class="h-c">{contact.get('phone','')}</span>
      <span class="h-c">{contact.get('location','')}</span>
      <span class="h-c">{contact.get('linkedin','')}</span>
      <span class="h-c">{contact.get('github','')}</span>
    </div>
  </div>
  <div class="body">
    <div class="main">
      <p class="summary">{d.get('summary','')}</p>

      <div class="section">
        <div class="sec-title">Professional Experience</div>
        {exp_html}
      </div>

      <div class="section">
        <div class="sec-title">Projects</div>
        {proj_html}
      </div>

      <div class="section">
        <div class="sec-title">Education</div>
        {edu_html}
      </div>
    </div>

    <div class="aside">
      <div class="section">
        <div class="sec-title">Skills</div>
        <ul class="skill-list">{skills_html}</ul>
      </div>
      <div class="section">
        <div class="sec-title">Strengths</div>
        <ul class="skill-list">{soft_html}</ul>
      </div>
    </div>
  </div>
</div>
</body></html>"""


def render_creative(d: dict) -> str:
    contact = d.get("contact", {})
    education = d.get("education", [])
    experience = d.get("experience", [])
    skills = d.get("skills", {})
    projects = d.get("projects", [])

    tech_html = "".join(f'<span class="pill">{s}</span>' for s in skills.get("technical", []))
    tools_html = "".join(f'<span class="pill t2">{s}</span>' for s in skills.get("tools", []))

    exp_html = ""
    for e in experience:
        bullets = "".join(f"<li>{b}</li>" for b in e.get("bullets", []))
        exp_html += f"""
        <div class="card">
          <div class="card-top">
            <div>
              <div class="card-title">{e.get('role','')}</div>
              <div class="card-sub">{e.get('company','')}</div>
            </div>
            <div class="card-date">{e.get('duration','')}</div>
          </div>
          <ul class="bullets">{bullets}</ul>
        </div>"""

    proj_html = ""
    for p in projects:
        tech_str = " · ".join(p.get("tech", []))
        proj_html += f"""
        <div class="proj-card">
          <div class="proj-accent"></div>
          <div class="proj-body">
            <div class="proj-name">{p.get('name','')}</div>
            <div class="proj-stack">{tech_str}</div>
            <div class="proj-desc">{p.get('description','')}</div>
          </div>
        </div>"""

    edu_html = ""
    for e in education:
        edu_html += f"""
        <div class="edu-row">
          <div class="edu-dot"></div>
          <div>
            <div class="edu-deg">{e.get('degree','')}</div>
            <div class="edu-info">{e.get('institution','')} · {e.get('year','')} {"· GPA "+e.get('gpa','') if e.get('gpa') else ''}</div>
          </div>
        </div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>{d.get('name','')} — Resume</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet"/>
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  body{{font-family:'DM Sans',sans-serif;background:#f5f0ff;display:flex;justify-content:center;padding:2rem;min-height:100vh}}
  .page{{width:860px;background:#fff;box-shadow:0 20px 70px rgba(100,60,200,0.15);border-radius:8px;overflow:hidden}}
  .header{{background:linear-gradient(135deg,#6b21a8,#4338ca);padding:3rem 3rem 2.5rem;position:relative;overflow:hidden}}
  .header::before{{content:'';position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,0.06)}}
  .header::after{{content:'';position:absolute;bottom:-40px;right:100px;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,0.04)}}
  .h-eyebrow{{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.2em;color:rgba(255,255,255,0.5);margin-bottom:0.5rem;font-family:'Syne',sans-serif}}
  .h-name{{font-family:'Syne',sans-serif;font-size:2.8rem;font-weight:800;color:#fff;letter-spacing:-0.03em;line-height:1}}
  .h-role{{font-size:1rem;color:rgba(255,255,255,0.7);margin-top:0.4rem;font-weight:300}}
  .h-bar{{display:flex;flex-wrap:wrap;gap:1.2rem;margin-top:1.5rem}}
  .h-item{{font-size:0.78rem;color:rgba(255,255,255,0.65)}}
  .body{{display:grid;grid-template-columns:1fr 240px;min-height:800px}}
  .main{{padding:2.5rem 2rem 2.5rem 3rem}}
  .side{{padding:2.5rem 2rem;background:#faf8ff;border-left:1px solid #ede9fe}}
  .sec-head{{font-family:'Syne',sans-serif;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#7c3aed;margin-bottom:1rem}}
  .summary{{font-size:0.9rem;line-height:1.75;color:#374151;margin-bottom:2rem;font-style:italic}}
  .section{{margin-bottom:2rem}}
  .card{{background:#faf8ff;border:1px solid #ede9fe;border-radius:8px;padding:1.1rem;margin-bottom:0.85rem}}
  .card-top{{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem}}
  .card-title{{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;color:#1e1b4b}}
  .card-sub{{font-size:0.8rem;color:#7c3aed;margin-top:0.1rem}}
  .card-date{{font-size:0.72rem;color:#9ca3af;white-space:nowrap;margin-left:0.5rem}}
  .bullets{{margin-left:1.1rem;font-size:0.8rem;color:#4b5563;line-height:1.65}}
  .bullets li{{margin-bottom:0.2rem}}
  .proj-card{{display:flex;margin-bottom:0.85rem;gap:0;border-radius:8px;overflow:hidden;border:1px solid #ede9fe}}
  .proj-accent{{width:4px;background:linear-gradient(180deg,#7c3aed,#4338ca);flex-shrink:0}}
  .proj-body{{padding:0.9rem;flex:1}}
  .proj-name{{font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;color:#1e1b4b}}
  .proj-stack{{font-size:0.7rem;color:#7c3aed;margin:0.15rem 0 0.35rem;letter-spacing:0.03em}}
  .proj-desc{{font-size:0.78rem;color:#4b5563;line-height:1.5}}
  /* Side */
  .pills{{display:flex;flex-wrap:wrap;gap:0.35rem;margin-bottom:1.5rem}}
  .pill{{font-size:0.65rem;padding:0.2rem 0.55rem;border-radius:100px;background:#ede9fe;color:#5b21b6;font-weight:500}}
  .pill.t2{{background:#e0e7ff;color:#3730a3}}
  .edu-row{{display:flex;align-items:flex-start;gap:0.75rem;margin-bottom:0.9rem}}
  .edu-dot{{width:10px;height:10px;border-radius:50%;background:#7c3aed;flex-shrink:0;margin-top:4px}}
  .edu-deg{{font-size:0.85rem;font-weight:600;color:#1e1b4b}}
  .edu-info{{font-size:0.75rem;color:#6b7280;margin-top:0.1rem;line-height:1.4}}
  @media print{{body{{background:#fff;padding:0}} .page{{box-shadow:none;width:100%;border-radius:0}}}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="h-eyebrow">Curriculum Vitae</div>
    <div class="h-name">{d.get('name','')}</div>
    <div class="h-role">{d.get('target_role','')}</div>
    <div class="h-bar">
      <span class="h-item">✉ {contact.get('email','')}</span>
      <span class="h-item">📱 {contact.get('phone','')}</span>
      <span class="h-item">📍 {contact.get('location','')}</span>
      <span class="h-item">⌥ {contact.get('github','')}</span>
    </div>
  </div>
  <div class="body">
    <div class="main">
      <p class="summary">{d.get('summary','')}</p>
      <div class="section">
        <div class="sec-head">Experience</div>
        {exp_html}
      </div>
      <div class="section">
        <div class="sec-head">Projects</div>
        {proj_html}
      </div>
    </div>
    <div class="side">
      <div class="section">
        <div class="sec-head">Education</div>
        {edu_html}
      </div>
      <div class="section">
        <div class="sec-head">Technical</div>
        <div class="pills">{tech_html}</div>
      </div>
      <div class="section">
        <div class="sec-head">Tools</div>
        <div class="pills">{tools_html}</div>
      </div>
    </div>
  </div>
</div>
</body></html>"""


def render_minimal(d: dict) -> str:
    contact = d.get("contact", {})
    education = d.get("education", [])
    experience = d.get("experience", [])
    skills = d.get("skills", {})
    projects = d.get("projects", [])

    all_skills = skills.get("technical", []) + skills.get("tools", [])
    skills_str = "  ·  ".join(all_skills)

    exp_html = ""
    for e in experience:
        bullets = "".join(f"<li>{b}</li>" for b in e.get("bullets", []))
        exp_html += f"""
        <div class="block">
          <div class="block-meta">{e.get('duration','')}</div>
          <div class="block-body">
            <div class="block-title">{e.get('role','')}</div>
            <div class="block-sub">{e.get('company','')}</div>
            <ul class="bullets">{bullets}</ul>
          </div>
        </div>"""

    edu_html = ""
    for e in education:
        edu_html += f"""
        <div class="block">
          <div class="block-meta">{e.get('year','')}</div>
          <div class="block-body">
            <div class="block-title">{e.get('degree','')}</div>
            <div class="block-sub">{e.get('institution','')} {"· "+e.get('gpa','') if e.get('gpa') else ''}</div>
          </div>
        </div>"""

    proj_html = ""
    for p in projects:
        proj_html += f"""
        <div class="block">
          <div class="block-meta">{', '.join(p.get('tech',[]))}</div>
          <div class="block-body">
            <div class="block-title">{p.get('name','')}</div>
            <div class="block-desc">{p.get('description','')}</div>
          </div>
        </div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>{d.get('name','')} — Resume</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  body{{font-family:'Jost',sans-serif;background:#fafafa;display:flex;justify-content:center;padding:3rem 2rem;min-height:100vh}}
  .page{{width:760px;background:#fff;padding:4rem;box-shadow:0 2px 40px rgba(0,0,0,0.06)}}
  .top{{text-align:center;margin-bottom:2.5rem;padding-bottom:2.5rem;border-bottom:1px solid #000}}
  .t-name{{font-family:'EB Garamond',serif;font-size:3rem;font-weight:500;letter-spacing:-0.02em;color:#111;line-height:1}}
  .t-role{{font-size:0.78rem;text-transform:uppercase;letter-spacing:0.2em;color:#888;margin-top:0.5rem}}
  .t-contacts{{display:flex;justify-content:center;flex-wrap:wrap;gap:1.5rem;margin-top:1.25rem}}
  .t-c{{font-size:0.75rem;color:#555}}
  .summary{{text-align:center;font-family:'EB Garamond',serif;font-size:1rem;font-style:italic;color:#333;line-height:1.75;margin-bottom:2.5rem;max-width:580px;margin-left:auto;margin-right:auto}}
  .section{{margin-bottom:2.25rem}}
  .sec-title{{font-size:0.65rem;text-transform:uppercase;letter-spacing:0.2em;color:#000;margin-bottom:1.25rem;padding-bottom:0.4rem;border-bottom:1px solid #000}}
  .block{{display:grid;grid-template-columns:120px 1fr;gap:1.5rem;margin-bottom:1.25rem}}
  .block-meta{{font-size:0.72rem;color:#999;padding-top:2px;text-align:right;line-height:1.5}}
  .block-title{{font-weight:500;font-size:0.92rem;color:#111;margin-bottom:0.15rem}}
  .block-sub{{font-size:0.78rem;color:#888;margin-bottom:0.35rem}}
  .block-desc{{font-size:0.8rem;color:#555;line-height:1.55}}
  .bullets{{margin-left:1rem;font-size:0.8rem;color:#444;line-height:1.7}}
  .bullets li{{margin-bottom:0.15rem}}
  .skills-str{{font-size:0.78rem;color:#555;line-height:1.8;letter-spacing:0.02em}}
  @media print{{body{{background:#fff;padding:1rem}} .page{{box-shadow:none;width:100%;padding:2.5rem}}}}
</style>
</head>
<body>
<div class="page">
  <div class="top">
    <div class="t-name">{d.get('name','')}</div>
    <div class="t-role">{d.get('target_role','')}</div>
    <div class="t-contacts">
      <span class="t-c">{contact.get('email','')}</span>
      <span class="t-c">{contact.get('phone','')}</span>
      <span class="t-c">{contact.get('location','')}</span>
      <span class="t-c">{contact.get('linkedin','')}</span>
      <span class="t-c">{contact.get('github','')}</span>
    </div>
  </div>

  <p class="summary">{d.get('summary','')}</p>

  <div class="section">
    <div class="sec-title">Experience</div>
    {exp_html}
  </div>

  <div class="section">
    <div class="sec-title">Projects</div>
    {proj_html}
  </div>

  <div class="section">
    <div class="sec-title">Education</div>
    {edu_html}
  </div>

  <div class="section">
    <div class="sec-title">Skills & Tools</div>
    <div class="skills-str">{skills_str}</div>
  </div>
</div>
</body></html>"""


TEMPLATE_RENDERERS = {
    "tech": render_tech,
    "corporate": render_corporate,
    "creative": render_creative,
    "minimal": render_minimal,
}

TEMPLATE_META = {
    "tech": {
        "name": "Tech / Developer",
        "desc": "Dark sidebar, cyan accents, monospace labels — ideal for CS, SWE, Data",
        "emoji": "💻",
        "best_for": ["software engineer", "developer", "data", "engineer", "programmer", "devops", "ml", "ai"],
    },
    "corporate": {
        "name": "Corporate",
        "desc": "Classic two-column, navy header — ideal for business, finance, consulting",
        "emoji": "🏢",
        "best_for": ["business", "finance", "consulting", "analyst", "manager", "mba", "marketing"],
    },
    "creative": {
        "name": "Creative",
        "desc": "Bold gradient header, purple palette — ideal for design, product, startup",
        "emoji": "🎨",
        "best_for": ["designer", "product", "ux", "ui", "creative", "startup", "content"],
    },
    "minimal": {
        "name": "Minimal",
        "desc": "Garamond serif, pure whitespace — ideal for research, academia, writing",
        "emoji": "◻",
        "best_for": ["research", "academic", "phd", "professor", "writer", "law", "medical"],
    },
}


def recommend_template(target_role: str) -> str:
    """Simple keyword-based template recommendation."""
    role_lower = target_role.lower()
    for template_id, meta in TEMPLATE_META.items():
        if any(kw in role_lower for kw in meta["best_for"]):
            return template_id
    return "tech"  # default
