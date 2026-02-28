import { useState, useEffect } from "react";

const API_BASE = "https://ai-resume-builder-backend-xot4.onrender.com";

const STEPS = ["Personal", "Education", "Experience", "Skills", "Generate"];

const initialData = {
  name: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "",
  summary: "",
  education: [{ degree: "", institution: "", year: "", gpa: "", coursework: "" }],
  experience: [{ role: "", company: "", duration: "", description: "" }],
  skills: { technical: "", soft: "", tools: "" },
  projects: [{ name: "", tech: "", description: "", link: "" }],
  targetRole: "", targetCompany: "", tone: "professional",
};

const TEMPLATES = [
  { id: "ai-pick",   emoji: "✦", name: "AI Picks",  desc: "AI selects the best fit for your profile" },
  { id: "tech",      emoji: "⌥", name: "Tech",       desc: "For engineering, data, and software roles" },
  { id: "corporate", emoji: "◈", name: "Corporate",  desc: "For business, finance, and consulting roles" },
  { id: "creative",  emoji: "◉", name: "Creative",   desc: "For design, product, and startup roles" },
  { id: "minimal",   emoji: "○", name: "Minimal",    desc: "For research, academia, and writing roles" },
];

const LOAD_LINES = [
  "Parsing your profile...",
  "Analyzing target role...",
  "Crafting tailored content...",
  "Optimizing for ATS...",
  "Rendering your resume...",
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Geist+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f8f9fb;
    --surface: #ffffff;
    --border: #e4e7ec;
    --border-focus: #2563eb;
    --blue: #2563eb;
    --blue-light: #eff4ff;
    --blue-mid: #dbeafe;
    --text: #111827;
    --text-2: #374151;
    --text-3: #6b7280;
    --text-4: #9ca3af;
    --green: #059669;
    --green-bg: #ecfdf5;
    --red: #dc2626;
    --red-bg: #fef2f2;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow: 0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
    --radius: 8px;
  }

  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  /* ── LAYOUT ── */
  .layout { display: flex; min-height: 100vh; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: 240px;
    flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 10;
  }
  .sidebar-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid var(--border);
  }
  .logo-mark {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 4px;
  }
  .logo-icon {
    width: 28px; height: 28px; border-radius: 6px;
    background: var(--blue); display: flex; align-items: center; justify-content: center;
    font-size: 13px; color: white; font-weight: 700; letter-spacing: -0.5px;
  }
  .logo-text {
    font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: -0.3px;
  }
  .logo-sub { font-size: 11px; color: var(--text-4); letter-spacing: 0; }

  .sidebar-nav { padding: 12px 12px; flex: 1; }
  .nav-section-label {
    font-family: 'Geist Mono', monospace;
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--text-4); padding: 4px 8px 8px; margin-top: 4px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 6px; cursor: pointer;
    transition: background 0.15s; margin-bottom: 1px;
    font-size: 13px; font-weight: 500; color: var(--text-3);
    border: none; background: none; width: 100%; text-align: left;
  }
  .nav-item:hover { background: var(--bg); color: var(--text-2); }
  .nav-item.active { background: var(--blue-light); color: var(--blue); }
  .nav-item.done { color: var(--text-2); }
  .nav-num {
    width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Geist Mono', monospace; font-size: 10px; font-weight: 500;
    background: var(--border); color: var(--text-4); transition: all 0.2s;
  }
  .nav-item.active .nav-num {
    background: var(--blue); color: white;
  }
  .nav-item.done .nav-num {
    background: var(--green-bg); color: var(--green);
  }
  .nav-step { font-size: 13px; }

  .sidebar-actions {
    padding: 12px; border-top: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 6px;
  }
  .sa-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border);
    background: none; cursor: pointer; font-size: 12px; font-weight: 500;
    color: var(--text-3); transition: all 0.15s; font-family: 'Plus Jakarta Sans', sans-serif;
    width: 100%;
  }
  .sa-btn:hover { background: var(--bg); border-color: var(--text-4); color: var(--text-2); }
  .sa-icon { font-size: 13px; }

  /* ── MAIN AREA ── */
  .main { margin-left: 240px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

  /* ── TOPBAR ── */
  .topbar {
    height: 56px; border-bottom: 1px solid var(--border); background: var(--surface);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; position: sticky; top: 0; z-index: 5;
  }
  .topbar-left { display: flex; flex-direction: column; gap: 1px; }
  .topbar-title { font-size: 14px; font-weight: 600; color: var(--text); }
  .topbar-desc { font-size: 12px; color: var(--text-4); }
  .topbar-right { display: flex; align-items: center; gap: 8px; }
  .progress-text {
    font-family: 'Geist Mono', monospace; font-size: 11px; color: var(--text-4);
  }
  .progress-bar {
    width: 100px; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden;
  }
  .progress-fill {
    height: 100%; background: var(--blue); border-radius: 2px; transition: width 0.4s ease;
  }

  /* ── CONTENT ── */
  .content { flex: 1; padding: 32px; max-width: 720px; }
  .content.full-width { max-width: 100%; }

  /* ── SECTION HEADER ── */
  .section-header { margin-bottom: 24px; }
  .section-title { font-size: 18px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; }
  .section-desc { font-size: 13px; color: var(--text-3); margin-top: 3px; }

  /* ── CARD ── */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); box-shadow: var(--shadow-sm);
    margin-bottom: 12px; overflow: hidden;
  }
  .card-inner { padding: 20px; }

  /* ── FORM ELEMENTS ── */
  .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .field-grid.cols-1 { grid-template-columns: 1fr; }
  @media (max-width: 600px) { .field-grid { grid-template-columns: 1fr; } }
  .span-2 { grid-column: 1 / -1; }

  .field { display: flex; flex-direction: column; gap: 5px; }
  .field-label {
    font-size: 12px; font-weight: 600; color: var(--text-2); letter-spacing: 0.01em;
  }
  .field-hint { font-size: 11px; color: var(--text-4); margin-top: 1px; }

  input, textarea, select {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 400;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 6px; padding: 8px 11px; color: var(--text);
    transition: border-color 0.15s, box-shadow 0.15s; width: 100%;
    outline: none;
  }
  input::placeholder, textarea::placeholder { color: var(--text-4); }
  input:hover, textarea:hover, select:hover { border-color: var(--text-4); }
  input:focus, textarea:focus, select:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }
  textarea { resize: vertical; min-height: 88px; line-height: 1.6; }

  /* ── REPEATABLE BLOCK ── */
  .repeat-block {
    border: 1px solid var(--border); border-radius: var(--radius);
    overflow: hidden; margin-bottom: 10px;
  }
  .repeat-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 16px; background: var(--bg); border-bottom: 1px solid var(--border);
  }
  .repeat-label {
    font-size: 12px; font-weight: 600; color: var(--text-3);
    font-family: 'Geist Mono', monospace; letter-spacing: 0.03em;
  }
  .repeat-body { padding: 16px; }
  .add-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 12px; border-radius: 6px; border: 1px dashed var(--border);
    background: none; cursor: pointer; font-size: 12px; font-weight: 500;
    color: var(--text-3); transition: all 0.15s; font-family: 'Plus Jakarta Sans', sans-serif;
    margin-top: 4px;
  }
  .add-btn:hover { border-color: var(--blue); color: var(--blue); background: var(--blue-light); }

  /* ── DIVIDER ── */
  .divider {
    display: flex; align-items: center; gap: 12px; margin: 20px 0 16px;
  }
  .divider-line { flex: 1; height: 1px; background: var(--border); }
  .divider-label { font-size: 11px; font-weight: 600; color: var(--text-4); white-space: nowrap; text-transform: uppercase; letter-spacing: 0.06em; }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 6px; border: none;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .btn-primary { background: var(--blue); color: white; box-shadow: 0 1px 3px rgba(37,99,235,0.3); }
  .btn-primary:hover { background: #1d4ed8; box-shadow: 0 2px 8px rgba(37,99,235,0.4); }
  .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
  .btn-secondary { background: var(--surface); color: var(--text-2); border: 1px solid var(--border); }
  .btn-secondary:hover { background: var(--bg); border-color: var(--text-4); }
  .btn-danger-soft { background: var(--red-bg); color: var(--red); border: 1px solid #fecaca; font-size: 11px; padding: 4px 9px; }
  .btn-danger-soft:hover { background: #fee2e2; }
  .btn-success { background: var(--green-bg); color: var(--green); border: 1px solid #a7f3d0; }
  .btn-success:hover { background: #d1fae5; }

  /* ── FOOTER NAV ── */
  .footer-nav {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 0; margin-top: 4px; border-top: 1px solid var(--border);
  }

  /* ── GENERATE STEP ── */
  .mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .mode-card {
    padding: 16px; border: 1.5px solid var(--border); border-radius: var(--radius);
    cursor: pointer; transition: all 0.15s; background: var(--surface);
  }
  .mode-card:hover { border-color: var(--text-4); }
  .mode-card.active { border-color: var(--blue); background: var(--blue-light); }
  .mode-card-icon { font-size: 20px; margin-bottom: 8px; }
  .mode-card-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
  .mode-card.active .mode-card-title { color: var(--blue); }
  .mode-card-desc { font-size: 11px; color: var(--text-3); line-height: 1.5; }

  .template-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 16px; }
  @media (max-width: 600px) { .template-grid { grid-template-columns: repeat(3, 1fr); } }
  .template-card {
    padding: 12px 8px; border: 1px solid var(--border); border-radius: var(--radius);
    cursor: pointer; text-align: center; transition: all 0.15s; background: var(--surface);
  }
  .template-card:hover { border-color: var(--text-4); }
  .template-card.active { border-color: var(--blue); background: var(--blue-light); }
  .template-emoji { font-size: 18px; margin-bottom: 5px; font-style: normal; }
  .template-name { font-size: 11px; font-weight: 600; color: var(--text-3); }
  .template-card.active .template-name { color: var(--blue); }

  .extra-grid { display: flex; gap: 8px; flex-wrap: wrap; }
  .extra-card {
    display: flex; align-items: center; gap: 8px; padding: 9px 14px;
    border: 1.5px solid var(--border); border-radius: 6px;
    cursor: pointer; transition: all 0.15s; background: var(--surface);
    font-size: 12px; font-weight: 600; color: var(--text-3);
  }
  .extra-card:hover { border-color: var(--text-4); color: var(--text-2); }
  .extra-card.active { border-color: var(--green); background: var(--green-bg); color: var(--green); }

  .tone-wrap { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
  .tone-pill {
    padding: 5px 12px; border: 1px solid var(--border); border-radius: 100px;
    font-size: 12px; font-weight: 500; color: var(--text-3); background: none;
    cursor: pointer; transition: all 0.15s; font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .tone-pill:hover { border-color: var(--text-4); color: var(--text-2); }
  .tone-pill.active { border-color: var(--blue); background: var(--blue-light); color: var(--blue); }

  /* ── LOADING ── */
  .loading-wrap {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 24px; text-align: center;
  }
  .spinner {
    width: 36px; height: 36px; border: 2px solid var(--border);
    border-top-color: var(--blue); border-radius: 50%;
    animation: spin 0.7s linear infinite; margin-bottom: 20px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
  .loading-steps { display: flex; flex-direction: column; gap: 6px; margin-top: 16px; }
  .loading-step {
    display: flex; align-items: center; gap: 8px; font-size: 12px;
    color: var(--text-4); transition: color 0.3s;
  }
  .loading-step.active { color: var(--blue); font-weight: 500; }
  .loading-step.done { color: var(--green); }
  .step-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

  /* ── OUTPUT ── */
  .output-tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 20px; }
  .output-tab {
    padding: 10px 16px; font-size: 13px; font-weight: 500; color: var(--text-3);
    border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent;
    margin-bottom: -1px; transition: all 0.15s; font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .output-tab:hover { color: var(--text-2); }
  .output-tab.active { color: var(--blue); border-bottom-color: var(--blue); }

  .resume-preview {
    border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden;
    box-shadow: var(--shadow-sm); width: 100%;
  }
  .preview-bar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; background: var(--bg); border-bottom: 1px solid var(--border);
  }
  .preview-bar-left { display: flex; align-items: center; gap: 6px; }
  .preview-dot { width: 8px; height: 8px; border-radius: 50%; }
  .preview-label { font-size: 11px; color: var(--text-4); font-family: 'Geist Mono', monospace; margin-left: 4px; }
  .resume-iframe { width: 100%; height: calc(100vh - 200px); border: none; display: block; }

  .text-output {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 24px; font-size: 13px; line-height: 1.85; color: var(--text-2);
    white-space: pre-wrap; min-height: 380px;
  }

  .output-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; flex-wrap: wrap; gap: 8px; }
  .output-actions-left { display: flex; gap: 8px; }

  .ai-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--blue-light); border: 1px solid var(--blue-mid);
    border-radius: 6px; padding: 8px 12px; font-size: 12px; color: var(--blue);
    margin-bottom: 16px; font-weight: 500;
  }

  /* ── INFO CALLOUT ── */
  .callout {
    display: flex; align-items: flex-start; gap: 10px;
    background: var(--blue-light); border: 1px solid var(--blue-mid);
    border-radius: 6px; padding: 11px 14px; margin-bottom: 20px;
  }
  .callout-icon { font-size: 13px; flex-shrink: 0; margin-top: 1px; }
  .callout-text { font-size: 12px; color: #1e40af; line-height: 1.55; }
  .callout-text strong { font-weight: 600; }

  /* ── TOAST ── */
  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 999;
    background: var(--text); color: white; font-size: 13px; font-weight: 500;
    padding: 10px 18px; border-radius: 8px; box-shadow: var(--shadow);
    animation: toastIn 0.25s ease;
  }
  @keyframes toastIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

  /* ── SCROLLBAR ── */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-4); }

  /* ── ANALYZER ── */
  .tab-switcher {
    display: flex; gap: 4px; background: var(--bg); border: 1px solid var(--border);
    border-radius: 8px; padding: 4px; margin-bottom: 24px;
  }
  .tab-btn {
    flex: 1; padding: 8px 12px; border-radius: 6px; border: none;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.15s; color: var(--text-3); background: none;
  }
  .tab-btn.active { background: var(--surface); color: var(--text); box-shadow: var(--shadow-sm); }
  .tab-btn:hover:not(.active) { color: var(--text-2); }

  .score-ring-wrap { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; padding: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
  .score-ring {
    width: 88px; height: 88px; border-radius: 50%; flex-shrink: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-weight: 700; position: relative;
  }
  .score-num { font-size: 26px; line-height: 1; }
  .score-max { font-size: 11px; opacity: 0.6; }
  .score-info { flex: 1; }
  .score-label { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .score-summary { font-size: 13px; color: var(--text-3); line-height: 1.6; }

  .analysis-section { margin-bottom: 20px; }
  .analysis-section-title {
    font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--text-4); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
  }
  .analysis-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip {
    padding: 5px 11px; border-radius: 100px; font-size: 12px; font-weight: 500;
  }
  .chip-green { background: var(--green-bg); color: var(--green); border: 1px solid #a7f3d0; }
  .chip-red { background: var(--red-bg); color: var(--red); border: 1px solid #fecaca; }
  .chip-yellow { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
  .chip-blue { background: var(--blue-light); color: var(--blue); border: 1px solid var(--blue-mid); }

  .action-list { display: flex; flex-direction: column; gap: 8px; }
  .action-item {
    display: flex; gap: 12px; padding: 12px 14px;
    border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--surface);
  }
  .action-priority {
    font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 4px;
    white-space: nowrap; height: fit-content; text-transform: uppercase; letter-spacing: 0.04em;
  }
  .priority-high { background: var(--red-bg); color: var(--red); }
  .priority-medium { background: #fffbeb; color: #92400e; }
  .priority-low { background: var(--green-bg); color: var(--green); }
  .action-text { flex: 1; }
  .action-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
  .action-reason { font-size: 12px; color: var(--text-3); line-height: 1.5; }

  /* ── FULL PREVIEW MODAL ── */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal-topbar {
    width: 100%; max-width: 900px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; margin-bottom: 12px;
  }
  .modal-topbar-left { display: flex; align-items: center; gap: 10px; }
  .modal-topbar-title { font-size: 14px; font-weight: 600; color: white; }
  .modal-topbar-sub { font-size: 12px; color: rgba(255,255,255,0.5); }
  .modal-actions { display: flex; gap: 8px; }
  .modal-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 6px; border: none;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .modal-btn-primary { background: var(--blue); color: white; }
  .modal-btn-primary:hover { background: #1d4ed8; }
  .modal-btn-secondary { background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.2); }
  .modal-btn-secondary:hover { background: rgba(255,255,255,0.25); }
  .modal-close {
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
    color: white; border-radius: 6px; padding: 8px 12px;
    font-size: 18px; cursor: pointer; line-height: 1;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .modal-close:hover { background: rgba(255,255,255,0.2); }
  .modal-frame-wrap {
    width: 210mm; background: white;
    border-radius: 4px; overflow: hidden;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    max-height: 85vh; overflow-y: auto;
  }
  .modal-iframe {
    width: 210mm; min-height: 297mm;
    border: none; display: block;
  }
`;

const STEP_META = [
  { title: "Personal Information", desc: "Your contact details and professional headline" },
  { title: "Education", desc: "Academic background and qualifications" },
  { title: "Work Experience", desc: "Internships, jobs, and leadership roles" },
  { title: "Skills & Projects", desc: "Technical skills, tools, and project highlights" },
  { title: "Generate Resume", desc: "Choose your style and generate with AI" },
];

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [resumeMode, setResumeMode] = useState("templated");
  const [templateId, setTemplateId] = useState("ai-pick");
  const [extraDocs, setExtraDocs] = useState([]);
  const [resumeHtml, setResumeHtml] = useState("");
  const [templateUsed, setTemplateUsed] = useState("");
  const [templateReason, setTemplateReason] = useState("");
  const [textOutputs, setTextOutputs] = useState({});
  const [activeOut, setActiveOut] = useState("resume");
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [toast, setToast] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("generate"); // "generate" | "analyze"

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    const t = setInterval(() => { setLoadStep(i); i++; if (i >= LOAD_LINES.length) clearInterval(t); }, 1000);
    return () => clearInterval(t);
  }, [loading]);

  const toast_ = (m) => { setToast(m); setTimeout(() => setToast(""), 2800); };
  const upd = (k, v) => setData(p => ({ ...p, [k]: v }));
  const updN = (k, i, f, v) => { const a = [...data[k]]; a[i] = { ...a[i], [f]: v }; upd(k, a); };
  const addI = (k, t) => upd(k, [...data[k], { ...t }]);
  const delI = (k, i) => upd(k, data[k].filter((_, j) => j !== i));
  const togExtra = (t) => setExtraDocs(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const saveProfile = async () => {
    if (!data.name) { toast_("Enter your name first"); return; }
    try {
      const r = await fetch(`${API_BASE}/api/profiles`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data }) });
      if (!r.ok) throw new Error();
      toast_("Profile saved");
    } catch { toast_("Save failed — is the backend running?"); }
  };

  const loadProfile = async () => {
    const name = prompt("Enter your name to load your profile:");
    if (!name) return;
    try {
      const r = await fetch(`${API_BASE}/api/profiles/${encodeURIComponent(name)}`);
      if (r.status === 404) { toast_("No profile found"); return; }
      const j = await r.json();
      setData(j.profile);
      toast_(`Loaded: ${name}`);
    } catch { toast_("Load failed — is the backend running?"); }
  };

  const generate = async () => {
    setLoading(true); setGenerated(false); setLoadStep(0);
    try {
      const r1 = await fetch(`${API_BASE}/api/generate-resume`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, mode: resumeMode, templateId }),
      });
      if (!r1.ok) { const e = await r1.json(); throw new Error(e.detail || "Failed"); }
      const j1 = await r1.json();
      setResumeHtml(j1.html);
      setTemplateUsed(j1.template_used);
      setTemplateReason(j1.template_reason);
      if (extraDocs.length > 0) {
        const r2 = await fetch(`${API_BASE}/api/generate-docs`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data, docTypes: extraDocs }),
        });
        if (r2.ok) { const j2 = await r2.json(); setTextOutputs(j2.results); }
      } else { setTextOutputs({}); }
      setActiveOut("resume"); setGenerated(true);
    } catch (e) { toast_(e.message || "Generation failed"); }
    finally { setLoading(false); }
  };

  const analyze = async () => {
    if (!data.targetRole || !data.targetCompany) { toast_("Enter Target Role and Company first"); return; }
    setAnalyzing(true); setAnalysis(null);
    try {
      const r = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || "Failed"); }
      const j = await r.json();
      setAnalysis(j.analysis);
    } catch (e) { toast_(e.message || "Analysis failed"); }
    finally { setAnalyzing(false); }
  };

  const savePDF = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${data.name} Resume</title>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>${resumeHtml}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const PreviewModal = () => (
    <div className="modal-overlay" onClick={e => e.target.classList.contains("modal-overlay") && setShowPreview(false)}>
      <div className="modal-topbar">
        <div className="modal-topbar-left">
          <div>
            <div className="modal-topbar-title">📄 {data.name} — Resume Preview</div>
            <div className="modal-topbar-sub">A4 format · Click outside to close</div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-primary" onClick={savePDF}>🖨️ Save as PDF</button>
          <button className="modal-btn modal-btn-secondary" onClick={() => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([resumeHtml], { type: "text/html" }));
            a.download = `${data.name.replace(/\s+/g, "_")}_resume.html`;
            a.click(); toast_("Downloaded HTML");
          }}>⬇ Download HTML</button>
          <button className="modal-close" onClick={() => setShowPreview(false)}>✕</button>
        </div>
      </div>
      <div className="modal-frame-wrap">
        <iframe srcDoc={resumeHtml} className="modal-iframe" title="Resume Full Preview" />
      </div>
    </div>
  );

  const Field = ({ label, k, placeholder, hint }) => (
    <div className="field">
      <label className="field-label">{label}</label>
      {hint && <span className="field-hint">{hint}</span>}
      <input value={data[k]} onChange={e => upd(k, e.target.value)} placeholder={placeholder || label} />
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <>
          <div className="callout">
            <span className="callout-icon">💡</span>
            <span className="callout-text"><strong>Tip:</strong> The more detail you provide, the better the AI can tailor your documents. You can leave fields blank and the AI will still generate strong content.</span>
          </div>
          <div className="card">
            <div className="card-inner">
              <div className="field-grid">
                <div className="field"><label className="field-label">Full Name</label><input value={data.name} onChange={e => upd("name", e.target.value)} placeholder="Jane Doe" /></div>
                <div className="field"><label className="field-label">Email</label><input value={data.email} onChange={e => upd("email", e.target.value)} placeholder="jane@email.com" /></div>
                <div className="field"><label className="field-label">Phone</label><input value={data.phone} onChange={e => upd("phone", e.target.value)} placeholder="+1 234 567 8900" /></div>
                <div className="field"><label className="field-label">Location</label><input value={data.location} onChange={e => upd("location", e.target.value)} placeholder="San Francisco, CA" /></div>
                <div className="field"><label className="field-label">LinkedIn URL</label><input value={data.linkedin} onChange={e => upd("linkedin", e.target.value)} placeholder="linkedin.com/in/jane" /></div>
                <div className="field"><label className="field-label">GitHub URL</label><input value={data.github} onChange={e => upd("github", e.target.value)} placeholder="github.com/jane" /></div>
                <div className="field span-2"><label className="field-label">Portfolio Website</label><input value={data.portfolio} onChange={e => upd("portfolio", e.target.value)} placeholder="https://yourportfolio.com" /></div>
                <div className="field span-2">
                  <label className="field-label">Professional Summary</label>
                  <span className="field-hint">Optional — AI will generate and enhance this for you</span>
                  <textarea value={data.summary} onChange={e => upd("summary", e.target.value)} placeholder="Brief overview of who you are, your goals, and what makes you stand out..." rows={3} />
                </div>
              </div>
            </div>
          </div>
        </>
      );

      case 1: return (
        <>
          {data.education.map((edu, i) => (
            <div className="repeat-block" key={i}>
              <div className="repeat-header">
                <span className="repeat-label">Education {i + 1}</span>
                {i > 0 && <button className="btn btn-danger-soft" onClick={() => delI("education", i)}>Remove</button>}
              </div>
              <div className="repeat-body">
                <div className="field-grid">
                  <div className="field"><label className="field-label">Degree & Major</label><input value={edu.degree} onChange={e => updN("education", i, "degree", e.target.value)} placeholder="B.S. Computer Science" /></div>
                  <div className="field"><label className="field-label">Institution</label><input value={edu.institution} onChange={e => updN("education", i, "institution", e.target.value)} placeholder="MIT" /></div>
                  <div className="field"><label className="field-label">Graduation Year</label><input value={edu.year} onChange={e => updN("education", i, "year", e.target.value)} placeholder="2025" /></div>
                  <div className="field"><label className="field-label">GPA</label><input value={edu.gpa} onChange={e => updN("education", i, "gpa", e.target.value)} placeholder="3.8 / 4.0" /></div>
                  <div className="field span-2"><label className="field-label">Relevant Coursework</label><input value={edu.coursework} onChange={e => updN("education", i, "coursework", e.target.value)} placeholder="Data Structures, Machine Learning, Algorithms, Databases..." /></div>
                </div>
              </div>
            </div>
          ))}
          <button className="add-btn" onClick={() => addI("education", { degree: "", institution: "", year: "", gpa: "", coursework: "" })}>
            <span>+</span> Add Education
          </button>
        </>
      );

      case 2: return (
        <>
          {data.experience.map((exp, i) => (
            <div className="repeat-block" key={i}>
              <div className="repeat-header">
                <span className="repeat-label">Experience {i + 1}</span>
                {i > 0 && <button className="btn btn-danger-soft" onClick={() => delI("experience", i)}>Remove</button>}
              </div>
              <div className="repeat-body">
                <div className="field-grid">
                  <div className="field"><label className="field-label">Job Title / Role</label><input value={exp.role} onChange={e => updN("experience", i, "role", e.target.value)} placeholder="Software Engineering Intern" /></div>
                  <div className="field"><label className="field-label">Company / Organization</label><input value={exp.company} onChange={e => updN("experience", i, "company", e.target.value)} placeholder="Google" /></div>
                  <div className="field span-2"><label className="field-label">Duration</label><input value={exp.duration} onChange={e => updN("experience", i, "duration", e.target.value)} placeholder="June 2024 – August 2024" /></div>
                  <div className="field span-2">
                    <label className="field-label">Responsibilities & Achievements</label>
                    <span className="field-hint">Be specific — mention metrics, tools used, and the impact of your work</span>
                    <textarea value={exp.description} onChange={e => updN("experience", i, "description", e.target.value)} placeholder="Built a data pipeline that reduced processing time by 40%. Led a team of 3 engineers to deliver the feature ahead of schedule..." rows={4} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button className="add-btn" onClick={() => addI("experience", { role: "", company: "", duration: "", description: "" })}>
            <span>+</span> Add Experience
          </button>
        </>
      );

      case 3: return (
        <>
          <div className="card">
            <div className="card-inner">
              <div className="field-grid cols-1">
                <div className="field"><label className="field-label">Technical Skills</label><input value={data.skills.technical} onChange={e => upd("skills", { ...data.skills, technical: e.target.value })} placeholder="Python, JavaScript, React, Node.js, SQL, TensorFlow..." /></div>
                <div className="field"><label className="field-label">Soft Skills</label><input value={data.skills.soft} onChange={e => upd("skills", { ...data.skills, soft: e.target.value })} placeholder="Leadership, Communication, Problem-solving, Teamwork..." /></div>
                <div className="field"><label className="field-label">Tools & Platforms</label><input value={data.skills.tools} onChange={e => upd("skills", { ...data.skills, tools: e.target.value })} placeholder="Git, Docker, AWS, Figma, VS Code, Jira..." /></div>
              </div>
            </div>
          </div>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-label">Projects</span>
            <div className="divider-line" />
          </div>

          {data.projects.map((proj, i) => (
            <div className="repeat-block" key={i}>
              <div className="repeat-header">
                <span className="repeat-label">Project {i + 1}</span>
                {i > 0 && <button className="btn btn-danger-soft" onClick={() => delI("projects", i)}>Remove</button>}
              </div>
              <div className="repeat-body">
                <div className="field-grid">
                  <div className="field"><label className="field-label">Project Name</label><input value={proj.name} onChange={e => updN("projects", i, "name", e.target.value)} placeholder="AI Resume Builder" /></div>
                  <div className="field"><label className="field-label">Tech Stack</label><input value={proj.tech} onChange={e => updN("projects", i, "tech", e.target.value)} placeholder="React, Python, FastAPI" /></div>
                  <div className="field span-2">
                    <label className="field-label">Description & Impact</label>
                    <textarea value={proj.description} onChange={e => updN("projects", i, "description", e.target.value)} placeholder="What it does, your role, key outcomes and metrics..." rows={3} />
                  </div>
                  <div className="field span-2"><label className="field-label">GitHub / Live Link</label><input value={proj.link} onChange={e => updN("projects", i, "link", e.target.value)} placeholder="https://github.com/username/project" /></div>
                </div>
              </div>
            </div>
          ))}
          <button className="add-btn" onClick={() => addI("projects", { name: "", tech: "", description: "", link: "" })}>
            <span>+</span> Add Project
          </button>
        </>
      );

      case 4: {
        if (generated) return (
          <>
            <div className="output-tabs">
              <button className={`output-tab ${activeOut === "resume" ? "active" : ""}`} onClick={() => setActiveOut("resume")}>
                Resume {templateUsed && templateUsed !== "custom" ? `· ${templateUsed}` : templateUsed === "custom" ? "· custom" : ""}
              </button>
              {extraDocs.includes("coverletter") && <button className={`output-tab ${activeOut === "coverletter" ? "active" : ""}`} onClick={() => setActiveOut("coverletter")}>Cover Letter</button>}
              {extraDocs.includes("portfolio") && <button className={`output-tab ${activeOut === "portfolio" ? "active" : ""}`} onClick={() => setActiveOut("portfolio")}>Portfolio</button>}
            </div>

            {templateReason && activeOut === "resume" && (
              <div className="ai-badge">
                <span>✦</span>
                AI selected <strong style={{ marginLeft: 3, marginRight: 3 }}>{templateUsed}</strong> template — {templateReason}
              </div>
            )}

            {activeOut === "resume" ? (
              <div className="resume-preview">
                <div className="preview-bar">
                  <div className="preview-bar-left">
                    <div className="preview-dot" style={{ background: "#f87171" }} />
                    <div className="preview-dot" style={{ background: "#fbbf24", marginLeft: 4 }} />
                    <div className="preview-dot" style={{ background: "#4ade80", marginLeft: 4 }} />
                    <span className="preview-label">resume.html — preview</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-4)", fontFamily: "Geist Mono, monospace" }}>A4 Preview</span>
                </div>
                <iframe srcDoc={resumeHtml} className="resume-iframe" title="Resume" />
              </div>
            ) : (
              <div className="text-output">{textOutputs[activeOut] || "Not generated."}</div>
            )}

            <div className="output-actions">
              <div className="output-actions-left">
                {activeOut === "resume" ? (
                  <>
                    <button className="btn btn-primary" onClick={() => setShowPreview(true)}>🔍 Full Preview</button>
                    <button className="btn btn-primary" onClick={savePDF}>🖨️ Save as PDF</button>
                    <button className="btn btn-secondary" onClick={() => {
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(new Blob([resumeHtml], { type: "text/html" }));
                      a.download = `${data.name.replace(/\s+/g, "_")}_resume.html`;
                      a.click(); toast_("Downloaded — open in browser & press Ctrl+P for PDF");
                    }}>⬇ Download HTML</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(textOutputs[activeOut] || ""); toast_("Copied to clipboard"); }}>Copy Text</button>
                    <button className="btn btn-secondary" onClick={() => {
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(new Blob([textOutputs[activeOut] || ""], { type: "text/plain" }));
                      a.download = `${data.name.replace(/\s+/g, "_")}_${activeOut}.txt`;
                      a.click(); toast_("Downloaded");
                    }}>Download .txt</button>
                  </>
                )}
              </div>
              <button className="btn btn-secondary" onClick={() => { setGenerated(false); setResumeHtml(""); setTextOutputs({}); }}>
                Regenerate
              </button>
            </div>
          </>
        );

        if (loading) return (
          <div className="loading-wrap">
            <div className="spinner" />
            <div className="loading-title">Generating your resume...</div>
            <div className="loading-steps">
              {LOAD_LINES.map((line, i) => (
                <div key={i} className={`loading-step ${i < loadStep ? "done" : i === loadStep ? "active" : ""}`}>
                  <div className="step-dot" />
                  {i < loadStep ? "✓ " : ""}{line}
                </div>
              ))}
            </div>
          </div>
        );

        if (activeTab === "analyze") return (
          <>
            <div className="tab-switcher">
              <button className={`tab-btn ${activeTab === "generate" ? "active" : ""}`} onClick={() => setActiveTab("generate")}>🗂️ Generate Resume</button>
              <button className={`tab-btn ${activeTab === "analyze" ? "active" : ""}`} onClick={() => setActiveTab("analyze")}>🔍 Analyze My Profile</button>
            </div>

            <div className="card">
              <div className="card-inner">
                <div className="field-grid">
                  <div className="field"><label className="field-label">Target Role</label><input value={data.targetRole} onChange={e => upd("targetRole", e.target.value)} placeholder="Software Engineer, Data Analyst..." /></div>
                  <div className="field"><label className="field-label">Target Company</label><input value={data.targetCompany} onChange={e => upd("targetCompany", e.target.value)} placeholder="Google, Meta, Any Company..." /></div>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={analyze} disabled={analyzing || !data.targetRole || !data.targetCompany} style={{ width: "100%", justifyContent: "center", padding: "11px", marginBottom: "24px" }}>
              {analyzing ? "Analyzing..." : "🔍 Analyze My Profile"}
            </button>

            {analyzing && (
              <div className="loading-wrap">
                <div className="spinner" />
                <div className="loading-title">Analyzing your profile...</div>
                <div style={{ fontSize: "13px", color: "var(--text-4)", marginTop: "8px" }}>AI is reviewing your resume against {data.targetRole} at {data.targetCompany}</div>
              </div>
            )}

            {analysis && !analyzing && (() => {
              const score = analysis.fit_score;
              const scoreColor = score >= 75 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";
              const scoreBg = score >= 75 ? "#ecfdf5" : score >= 50 ? "#fffbeb" : "#fef2f2";
              return (
                <>
                  <div className="score-ring-wrap">
                    <div className="score-ring" style={{ background: scoreBg, color: scoreColor }}>
                      <span className="score-num">{score}</span>
                      <span className="score-max">/100</span>
                    </div>
                    <div className="score-info">
                      <div className="score-label" style={{ color: scoreColor }}>{analysis.fit_label}</div>
                      <div className="score-summary">{analysis.fit_summary}</div>
                    </div>
                  </div>

                  <div className="analysis-section">
                    <div className="analysis-section-title">✅ Your Strengths</div>
                    <div className="analysis-chips">
                      {analysis.strengths?.map((s, i) => <span key={i} className="chip chip-green">{s}</span>)}
                    </div>
                  </div>

                  <div className="analysis-section">
                    <div className="analysis-section-title">⚠️ Missing Skills</div>
                    <div className="analysis-chips">
                      {analysis.missing_skills?.map((s, i) => <span key={i} className="chip chip-red">{s}</span>)}
                    </div>
                  </div>

                  <div className="analysis-section">
                    <div className="analysis-section-title">🕳️ Experience Gaps</div>
                    <div className="analysis-chips">
                      {analysis.experience_gaps?.map((s, i) => <span key={i} className="chip chip-yellow">{s}</span>)}
                    </div>
                  </div>

                  <div className="analysis-section">
                    <div className="analysis-section-title">⚡ Quick Wins</div>
                    <div className="analysis-chips">
                      {analysis.quick_wins?.map((s, i) => <span key={i} className="chip chip-blue">{s}</span>)}
                    </div>
                  </div>

                  <div className="analysis-section">
                    <div className="analysis-section-title">📋 Recommended Actions</div>
                    <div className="action-list">
                      {analysis.recommended_actions?.map((a, i) => (
                        <div key={i} className="action-item">
                          <span className={`action-priority priority-${a.priority.toLowerCase()}`}>{a.priority}</span>
                          <div className="action-text">
                            <div className="action-title">{a.action}</div>
                            <div className="action-reason">{a.reason}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button className="btn btn-primary" onClick={() => setActiveTab("generate")} style={{ flex: 1, justifyContent: "center" }}>→ Go Generate Resume</button>
                    <button className="btn btn-secondary" onClick={() => setAnalysis(null)}>Re-analyze</button>
                  </div>
                </>
              );
            })()}
          </>
        );

        return (
          <>
            <div className="tab-switcher">
              <button className={`tab-btn ${activeTab === "generate" ? "active" : ""}`} onClick={() => setActiveTab("generate")}>🗂️ Generate Resume</button>
              <button className={`tab-btn ${activeTab === "analyze" ? "active" : ""}`} onClick={() => setActiveTab("analyze")}>🔍 Analyze My Profile</button>
            </div>

            <div className="card">
              <div className="card-inner">
                <div className="field-grid">
                  <div className="field"><label className="field-label">Target Role</label><input value={data.targetRole} onChange={e => upd("targetRole", e.target.value)} placeholder="Software Engineer, Data Analyst..." /></div>
                  <div className="field"><label className="field-label">Target Company</label><input value={data.targetCompany} onChange={e => upd("targetCompany", e.target.value)} placeholder="Google, Meta, Any Company..." /></div>
                </div>
              </div>
            </div>

            <div className="divider"><div className="divider-line" /><span className="divider-label">Tone</span><div className="divider-line" /></div>
            <div className="tone-wrap">
              {["Professional", "Confident", "Creative", "Academic", "Startup-friendly"].map(t => (
                <button key={t} className={`tone-pill ${data.tone === t.toLowerCase() ? "active" : ""}`} onClick={() => upd("tone", t.toLowerCase())}>{t}</button>
              ))}
            </div>

            <div className="divider"><div className="divider-line" /><span className="divider-label">Resume Style</span><div className="divider-line" /></div>
            <div className="mode-grid" style={{ marginBottom: 20 }}>
              {[
                { id: "templated", icon: "🗂️", title: "Smart Template", desc: "AI enriches your content and applies a beautiful pre-built template matched to your field" },
                { id: "custom", icon: "✨", title: "AI Custom Design", desc: "AI generates a fully unique HTML/CSS resume designed specifically for your profile" },
              ].map(m => (
                <div key={m.id} className={`mode-card ${resumeMode === m.id ? "active" : ""}`} onClick={() => setResumeMode(m.id)}>
                  <div className="mode-card-icon">{m.icon}</div>
                  <div className="mode-card-title">{m.title}</div>
                  <div className="mode-card-desc">{m.desc}</div>
                </div>
              ))}
            </div>

            {resumeMode === "templated" && (
              <>
                <div className="divider"><div className="divider-line" /><span className="divider-label">Template</span><div className="divider-line" /></div>
                <div className="template-grid">
                  {TEMPLATES.map(t => (
                    <div key={t.id} className={`template-card ${templateId === t.id ? "active" : ""}`} onClick={() => setTemplateId(t.id)}>
                      <div className="template-emoji">{t.emoji}</div>
                      <div className="template-name">{t.name}</div>
                    </div>
                  ))}
                </div>
                {templateId && (
                  <div className="callout" style={{ marginTop: 0 }}>
                    <span className="callout-icon">{TEMPLATES.find(t => t.id === templateId)?.emoji}</span>
                    <span className="callout-text">{TEMPLATES.find(t => t.id === templateId)?.desc}</span>
                  </div>
                )}
              </>
            )}

            <div className="divider"><div className="divider-line" /><span className="divider-label">Also Generate</span><div className="divider-line" /></div>
            <div className="extra-grid" style={{ marginBottom: 24 }}>
              {[{ key: "coverletter", icon: "✉️", label: "Cover Letter" }, { key: "portfolio", icon: "🗂️", label: "Portfolio Content" }].map(({ key, icon, label }) => (
                <div key={key} className={`extra-card ${extraDocs.includes(key) ? "active" : ""}`} onClick={() => togExtra(key)}>
                  <span>{icon}</span>
                  <span>{label}</span>
                  {extraDocs.includes(key) && <span>✓</span>}
                </div>
              ))}
            </div>

            <button className="btn btn-primary" onClick={generate} disabled={!data.name} style={{ width: "100%", justifyContent: "center", padding: "11px" }}>
              Generate Resume
            </button>
            {!data.name && <p style={{ fontSize: "12px", color: "var(--text-4)", textAlign: "center", marginTop: "8px" }}>Enter your name on the first step to continue</p>}
          </>
        );
      }
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">CV</div>
            <span className="logo-text">ResumeAI</span>
          </div>
          <div className="logo-sub">Powered by AI</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Steps</div>
          {STEPS.map((s, i) => (
            <button key={i} className={`nav-item ${i === step ? "active" : i < step ? "done" : ""}`} onClick={() => i <= step && setStep(i)}>
              <div className="nav-num">{i < step ? "✓" : i + 1}</div>
              <span className="nav-step">{s}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-actions">
          <button className="sa-btn" onClick={saveProfile}><span className="sa-icon">↑</span> Save Profile</button>
          <button className="sa-btn" onClick={loadProfile}><span className="sa-icon">↓</span> Load Profile</button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">{STEP_META[step].title}</div>
            <div className="topbar-desc">{STEP_META[step].desc}</div>
          </div>
          <div className="topbar-right">
            <span className="progress-text">Step {step + 1} of {STEPS.length}</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className={`content${step === 4 && generated ? " full-width" : ""}`}>
          <div className="section-header">
            <div className="section-title">{STEP_META[step].title}</div>
            <div className="section-desc">{STEP_META[step].desc}</div>
          </div>

          {renderStep()}

          {!(step === 4 && (loading || generated)) && (
            <div className="footer-nav">
              {step > 0
                ? <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
                : <span />}
              {step < 4
                ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Continue →</button>
                : <span />}
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
      {showPreview && <PreviewModal />}
    </div>
  );
}