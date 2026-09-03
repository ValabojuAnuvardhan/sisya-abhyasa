import { useState } from "react";

// ── PALETTE ─────────────────────────────────────────────────
const C = {
  bg: "#0F1117", sidebar: "#13151f", border: "#1e2130",
  card: "#1a1d27", card2: "#252836", text: "#f9fafb",
  muted: "#9ca3af", dim: "#6b7280", faint: "#374151",
  mint: "#00A19B", purple: "#7C5CBF", amber: "#E07B39", blue: "#3A7BD5",
};

// ── DATA ────────────────────────────────────────────────────
const CAREER_TRACKS = [
  { role:"Applied AI Engineer",    level:"Intermediate", courses:14, weeks:10, tags:["AI","Python"],      cert:true,  students:1240, desc:"Build production-ready AI systems using LLMs, RAG pipelines, and real APIs. Ship models people actually use." },
  { role:"Blockchain Engineer",    level:"Intermediate", courses:12, weeks:8,  tags:["Solidity","Web3"],  cert:true,  students:890,  desc:"Write smart contracts, audit vulnerabilities, and deploy decentralised applications on Ethereum." },
  { role:"Cloud Engineer",         level:"Intermediate", courses:11, weeks:9,  tags:["AWS","Terraform"],  cert:true,  students:1100, desc:"Design, deploy and scale cloud infrastructure. Master AWS core services, IaC, and Kubernetes." },
  { role:"MLOps Engineer",         level:"Advanced",     courses:13, weeks:11, tags:["Docker","MLflow"],  cert:true,  students:670,  desc:"Build production ML pipelines with automated retraining, monitoring, and CI/CD." },
  { role:"API Engineer",           level:"Beginner",     courses:8,  weeks:6,  tags:["FastAPI","REST"],   cert:true,  students:2100, desc:"Design and ship bulletproof REST and GraphQL APIs with auth, rate limiting, and auto-docs." },
  { role:"AI Product Engineer",    level:"Intermediate", courses:12, weeks:10, tags:["Claude","LangChain"],cert:true, students:1560, desc:"Build products with AI at their core — prompt engineering, RAG, and agentic systems." },
  { role:"Data Infrastructure Eng",level:"Intermediate", courses:10, weeks:8,  tags:["Kafka","dbt"],      cert:true,  students:540,  desc:"Design real-time data pipelines. Move, transform, and warehouse data at scale." },
  { role:"Smart Contract Auditor", level:"Advanced",     courses:9,  weeks:7,  tags:["Security","EVM"],  cert:true,  students:380,  desc:"Find vulnerabilities before attackers do. Write professional security audit reports." },
  { role:"Systems Design Eng",     level:"Advanced",     courses:15, weeks:13, tags:["Architecture"],    cert:true,  students:450,  desc:"Design systems used by millions. CAP theorem, sharding, load balancing, CDN." },
  { role:"Automation Engineer",    level:"Beginner",     courses:8,  weeks:6,  tags:["Playwright","RPA"],cert:true,  students:1800, desc:"Automate repetitive work with bots, scrapers, and RPA tools. Build systems that work while you sleep." },
  { role:"Real-Time Systems Eng",  level:"Advanced",     courses:11, weeks:9,  tags:["WebSockets","Redis"],cert:false,students:320,  desc:"Build live collaboration tools and event-driven systems that react in milliseconds." },
  { role:"Edge Computing Eng",     level:"Advanced",     courses:9,  weeks:8,  tags:["IoT","TFLite"],    cert:false, students:210,  desc:"Deploy ML models to Raspberry Pi and edge devices. Build smart IoT dashboards." },
  { role:"AR/VR Engineer",         level:"Intermediate", courses:10, weeks:8,  tags:["Three.js","WebXR"],cert:false, students:410,  desc:"Build immersive 3D browser experiences. WebXR, A-Frame, and spatial UI." },
  { role:"Performance Engineer",   level:"Advanced",     courses:10, weeks:8,  tags:["Profiling","k6"],  cert:false, students:290,  desc:"Squeeze every millisecond. Profile, benchmark, and optimise APIs to handle 10K+ req/sec." },
];

const SKILL_TRACKS = [
  { name:"Python Fundamentals",      tag:"Fundamentals", courses:6, tech:"Python",  desc:"Variables, loops, functions, OOP — the foundation for every engineering role." },
  { name:"FastAPI & REST APIs",       tag:"Practical",    courses:5, tech:"FastAPI", desc:"Build production APIs with auth, validation, and auto-docs in hours, not days." },
  { name:"Claude AI Integration",     tag:"AI",           courses:4, tech:"Claude",  desc:"Call Claude API, build prompt chains, ship AI features with the adapter pattern." },
  { name:"Git & GitHub for Engineers",tag:"Fundamentals", courses:4, tech:"GitHub",  desc:"Commits, branches, PRs, GitHub Actions CI/CD — the baseline for every developer." },
  { name:"Docker & Containers",       tag:"DevOps",       courses:5, tech:"Docker",  desc:"Package your app, deploy anywhere, never hear 'works on my machine' again." },
  { name:"AWS Core Services",         tag:"Cloud",        courses:7, tech:"AWS",     desc:"EC2, S3, Lambda, IAM, RDS — the services powering 90% of production backends." },
  { name:"React & Next.js",           tag:"Frontend",     courses:6, tech:"Next.js", desc:"Build fast, type-safe web applications with the framework teams actually ship." },
  { name:"Solidity Smart Contracts",  tag:"Web3",         courses:5, tech:"Solidity",desc:"Write, test, and deploy smart contracts on Ethereum." },
  { name:"Machine Learning Basics",   tag:"AI",           courses:6, tech:"ML",      desc:"Scikit-learn, train/test splits, overfitting, and your first real ML model." },
  { name:"PostgreSQL & SQLAlchemy",   tag:"Practical",    courses:5, tech:"SQL",     desc:"Schema design, queries, ORM, and Alembic migrations done right." },
];

const PROJECTS = [
  { title:"AI Study Assistant",        domain:"AI",      level:"Beginner",     tech:["Python","Claude API"],      students:1420, prs:312, desc:"Build an AI chatbot that reads your notes and answers questions. First LLM-powered app.", ready:true },
  { title:"Decentralised Voting App",  domain:"Web3",    level:"Intermediate", tech:["Solidity","React"],          students:890,  prs:198, desc:"Deploy a tamper-proof voting contract on Ethereum testnet.", ready:true },
  { title:"Ocean Plastic Tracker",     domain:"Climate", level:"Intermediate", tech:["Python","FastAPI","React"],  students:2030, prs:445, desc:"Real-time tracking system for ocean plastic collection using IoT sensor data.", ready:true },
  { title:"Mental Health Chatbot",     domain:"Health",  level:"Beginner",     tech:["Claude API","Next.js"],      students:1560, prs:267, desc:"Empathetic AI companion for early mental health detection.", ready:true },
  { title:"Real-Time Data Pipeline",   domain:"Data",    level:"Advanced",     tech:["Kafka","Airflow"],           students:670,  prs:89,  desc:"Ingest, transform, and warehouse real data. A production-grade ETL you own.", ready:false },
  { title:"Auto-Scaling Cloud App",    domain:"Cloud",   level:"Advanced",     tech:["AWS","Terraform","K8s"],     students:440,  prs:56,  desc:"Deploy a FastAPI app that scales to millions and back to zero cost.", ready:false },
];

const LVL = { Beginner:"#22c55e", Intermediate:"#f59e0b", Advanced:"#ef4444" };

// ── REUSABLE COMPONENTS ──────────────────────────────────────

const Chip = ({ label, active, color="#00A19B", onClick }) => (
  <button onClick={onClick} style={{
    padding:"5px 14px", borderRadius:50, fontSize:12, fontWeight:500,
    cursor:"pointer", border:"1px solid", transition:"all 0.15s",
    background: active ? color : "transparent",
    borderColor: active ? color : "#2d3748",
    color: active ? "#fff" : C.muted,
  }}>{label}</button>
);

const Tag = ({ label, bg, color }) => (
  <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:4, fontSize:11, fontWeight:600, background:bg, color }}>{label}</span>
);

const CertBadge = () => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:4, fontSize:11, fontWeight:500, background:"rgba(234,179,8,0.12)", color:"#eab308", border:"1px solid rgba(234,179,8,0.2)", flexShrink:0 }}>🎓 Cert</span>
);

const Card = ({ children, style={}, onClick, accent }) => (
  <div onClick={onClick} style={{
    background:C.card, border:`1px solid ${accent ? accent+"30" : C.card2}`,
    borderRadius:13, padding:22, transition:"border-color 0.2s, transform 0.15s",
    cursor: onClick ? "pointer" : "default", ...style,
  }}
    onMouseEnter={e=>{ e.currentTarget.style.borderColor=(accent||C.mint)+"50"; e.currentTarget.style.transform="translateY(-2px)"; }}
    onMouseLeave={e=>{ e.currentTarget.style.borderColor=(accent ? accent+"30" : C.card2); e.currentTarget.style.transform="none"; }}>
    {children}
  </div>
);

const Empty = ({ icon, title, desc, cta, onCta }) => (
  <div style={{ background:C.card, border:`1px solid ${C.card2}`, borderRadius:16, padding:"56px 40px", textAlign:"center" }}>
    <div style={{ fontSize:52, marginBottom:14, opacity:0.3 }}>{icon}</div>
    <h3 style={{ fontSize:18, fontWeight:600, color:"#e5e7eb", marginBottom:8 }}>{title}</h3>
    <p style={{ fontSize:13, color:C.dim, maxWidth:380, margin:"0 auto 20px", lineHeight:1.65 }}>{desc}</p>
    {cta && <button onClick={onCta} style={{ background:C.mint, color:"#fff", border:"none", borderRadius:8, padding:"10px 26px", fontSize:13, fontWeight:600, cursor:"pointer" }}>{cta}</button>}
  </div>
);

const SideNavItem = ({ icon, label, active, color, onClick, badge }) => (
  <div onClick={onClick} style={{
    display:"flex", alignItems:"center", gap:9, padding:"8px 12px",
    borderRadius:8, cursor:"pointer", transition:"all 0.15s",
    background: active ? `${color}18` : "transparent",
    color: active ? color : C.muted,
    fontWeight: active ? 600 : 400, fontSize:13,
  }}
    onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background="#ffffff08"; e.currentTarget.style.color="#e5e7eb"; }}}
    onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.muted; }}}>
    <span style={{ fontSize:14, width:20, textAlign:"center", flexShrink:0 }}>{icon}</span>
    <span style={{ flex:1 }}>{label}</span>
    {badge && <span style={{ background:color, color:"#fff", fontSize:8, padding:"1px 5px", borderRadius:3, fontWeight:700 }}>{badge}</span>}
  </div>
);

const SideSection = ({ label }) => (
  <div style={{ fontSize:9, fontWeight:700, color:"#374151", letterSpacing:"0.12em", textTransform:"uppercase", padding:"10px 12px 3px" }}>{label}</div>
);

const Hero = ({ icon, title, badge, color, desc, art }) => (
  <div style={{ background:`linear-gradient(135deg, ${C.card} 0%, ${color}10 100%)`, border:`1px solid ${C.card2}`, borderRadius:16, padding:"26px 30px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <h1 style={{ fontSize:26, fontFamily:"'DM Serif Display',serif", color:C.text }}>{title}</h1>
        <span style={{ background:color, color:"#fff", fontSize:11, padding:"3px 11px", borderRadius:50, fontWeight:700 }}>{badge}</span>
      </div>
      <p style={{ color:C.muted, fontSize:13.5, maxWidth:520, lineHeight:1.65 }}>{desc}</p>
    </div>
    <div style={{ fontSize:68, opacity:0.45, userSelect:"none" }}>{art}</div>
  </div>
);

// ── LEARN PHASE PAGES ─────────────────────────────────────────

function LearnHome({ nav }) {
  return (
    <div style={{ padding:"32px 36px" }}>
      <h1 style={{ fontSize:28, fontFamily:"'DM Serif Display',serif", color:C.text, marginBottom:6 }}>Learning Phase 📚</h1>
      <p style={{ color:C.dim, fontSize:14, marginBottom:28 }}>Pick a career track or skill track. ŚiṣyaChat guides you at every step.</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
        {[
          { icon:"🗺", label:"Career Tracks", sub:"14 engineering roles", color:C.mint, id:"career" },
          { icon:"⚡", label:"Skill Tracks",  sub:"10 technology deep-dives", color:"#3A7BD5", id:"skill-tracks" },
          { icon:"📚", label:"Courses",       sub:"Structured lessons", color:"#7C5CBF", id:"courses" },
          { icon:"🎯", label:"Practice",      sub:"Hands-on exercises", color:"#E07B39", id:"practice" },
          { icon:"📝", label:"Assessments",   sub:"Test your knowledge", color:"#2D7A4F", id:"assessments" },
          { icon:"📦", label:"Resources",     sub:"Docs, tools, guides", color:"#C0392B", id:"resources" },
        ].map(c => (
          <Card key={c.id} onClick={() => nav(c.id)} accent={c.color} style={{ display:"flex", gap:14, alignItems:"center", padding:18 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${c.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:3 }}>{c.label}</div>
              <div style={{ fontSize:12, color:C.muted }}>{c.sub}</div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{ background:`linear-gradient(135deg, ${C.card}, ${C.mint}10)`, border:`1px solid ${C.mint}25`, borderRadius:14, padding:22, display:"flex", gap:16, alignItems:"center" }}>
        <div style={{ width:48, height:48, borderRadius:14, background:`${C.mint}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>🧠</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:600, color:C.mint, fontFamily:"'DM Serif Display',serif", marginBottom:3 }}>ŚiṣyaChat — Learning Companion</div>
          <div style={{ fontSize:12.5, color:C.muted, lineHeight:1.5 }}>Knows your target role, skill gaps, and current roadmap. Explains at your level — never generic.</div>
        </div>
        <button onClick={() => nav("sisyachat")} style={{ background:C.mint, color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0 }}>Open →</button>
      </div>
    </div>
  );
}

function CareerTracksPage() {
  const [filter, setFilter] = useState("All");
  const filters = ["All","Beginner","Intermediate","Advanced"];
  const filtered = CAREER_TRACKS.filter(t => filter==="All" || t.level===filter);
  return (
    <div style={{ padding:"32px 36px" }}>
      <Hero icon="🗺" title="Career Tracks" badge="Zero to job ready" color={C.mint}
        desc="14 engineering roles. Complete a track by building real projects and earning verified GitHub evidence — not by watching videos." art="🏗️" />
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {filters.map(f => <Chip key={f} label={f} active={filter===f} onClick={() => setFilter(f)} />)}
        <div style={{ borderLeft:`1px solid ${C.card2}`, margin:"0 6px" }} />
        {["AI Engineer","Web3 Dev","Cloud Arch","Backend Dev"].map(f => <Chip key={f} label={f} active={false} onClick={()=>{}} />)}
      </div>
      <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>{filtered.length} Career tracks</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {filtered.map((t,i) => (
          <Card key={i} accent={C.mint}>
            <div style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>CAREER TRACK</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <h3 style={{ fontSize:16, fontWeight:600, color:C.text, lineHeight:1.3, flex:1 }}>{t.role}</h3>
              {t.cert && <CertBadge />}
            </div>
            <p style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:14 }}>{t.desc}</p>
            <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
              <Tag label={t.level} bg={LVL[t.level]+"18"} color={LVL[t.level]} />
              {t.tags.map(tg => <Tag key={tg} label={tg} bg={C.card2} color={C.muted} />)}
            </div>
            <div style={{ borderTop:`1px solid ${C.card2}`, paddingTop:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", gap:12 }}>
                <span style={{ fontSize:12, color:C.dim }}>📚 {t.courses} Projects</span>
                <span style={{ fontSize:12, color:C.dim }}>⏱ {t.weeks}w</span>
                <span style={{ fontSize:12, color:C.dim }}>👥 {(t.students/1000).toFixed(1)}k</span>
              </div>
              <button style={{ background:"transparent", color:C.mint, border:`1px solid ${C.mint}`, borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>View Details</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SkillTracksPage() {
  const [filter, setFilter] = useState("All");
  const techs = ["All","Python","FastAPI","Claude","AWS","Solidity","Docker","Next.js","ML","SQL","GitHub"];
  const filtered = SKILL_TRACKS.filter(t => filter==="All" || t.tech===filter || t.tag===filter);
  return (
    <div style={{ padding:"32px 36px" }}>
      <Hero icon="⚡" title="Skill Tracks" badge="Skill deep dive" color="#3A7BD5"
        desc="Acquire specific skills fast. Each track focuses on one technology — real projects, AI guidance, validated resources." art="⚡" />
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {techs.map(f => <Chip key={f} label={f} active={filter===f} color="#3A7BD5" onClick={() => setFilter(f)} />)}
      </div>
      <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>{filtered.length} Skill tracks</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {filtered.map((t,i) => (
          <Card key={i} accent="#3A7BD5">
            <div style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>SKILL TRACK</div>
            <h3 style={{ fontSize:16, fontWeight:600, color:C.text, marginBottom:6 }}>{t.name}</h3>
            <p style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:12 }}>{t.desc}</p>
            <div style={{ display:"flex", gap:6, marginBottom:14 }}>
              <Tag label={t.tag} bg="#3A7BD518" color="#3A7BD5" />
              <Tag label={t.tech} bg={C.card2} color={C.muted} />
            </div>
            <div style={{ borderTop:`1px solid ${C.card2}`, paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, color:C.dim }}>📚 {t.courses} Projects & resources</span>
              <button style={{ background:"transparent", color:"#3A7BD5", border:"1px solid #3A7BD5", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>View Details</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SisyaChatPage() {
  const [msgs, setMsgs] = useState([
    { role:"agent", text:"Hello! I'm ŚiṣyaChat — your learning companion. I know your target role, skill gaps, and current roadmap. Ask me anything about software engineering." }
  ]);
  const [input, setInput] = useState("");
  function send() {
    if(!input.trim()) return;
    const q = input; setInput("");
    setMsgs(m => [...m, {role:"user",text:q}, {role:"agent",text:"Let me explain that based on your skill level and target role. [ŚiṣyaChat calls Claude API with your profile context — target role, gaps, roadmap stage]"}]);
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
      <div style={{ padding:"14px 28px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12, background:C.sidebar }}>
        <div style={{ width:34, height:34, borderRadius:10, background:`${C.mint}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>🧠</div>
        <div>
          <div style={{ fontSize:15, fontWeight:600, color:C.mint, fontFamily:"'DM Serif Display',serif" }}>ŚiṣyaChat</div>
          <div style={{ fontSize:11, color:C.dim }}>Learning companion · knows your role, gaps, roadmap</div>
        </div>
        <div style={{ marginLeft:"auto", fontSize:11, color:C.faint, background:C.card, border:`1px solid ${C.card2}`, borderRadius:6, padding:"4px 10px" }}>AI learning guidance · verify from official docs</div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", display:"flex", flexDirection:"column", gap:14 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ display:"flex", gap:10, flexDirection:m.role==="user"?"row-reverse":"row" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:m.role==="agent"?C.mint:C.card2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", flexShrink:0, fontWeight:700 }}>
              {m.role==="agent"?"AI":"U"}
            </div>
            <div style={{ maxWidth:"76%", background:m.role==="agent"?C.card:C.mint, border:m.role==="agent"?`1px solid ${C.card2}`:"none", borderRadius:12, padding:"10px 14px", fontSize:13.5, color:m.role==="agent"?"#e5e7eb":"#fff", lineHeight:1.6 }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding:"14px 28px", borderTop:`1px solid ${C.border}`, background:C.sidebar }}>
        <div style={{ display:"flex", gap:10 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
            placeholder="Ask ŚiṣyaChat anything about software engineering..."
            style={{ flex:1, background:C.card, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 14px", fontSize:13.5, color:"#e5e7eb", outline:"none" }} />
          <button onClick={send} style={{ background:C.mint, color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Send</button>
        </div>
      </div>
    </div>
  );
}

function ComingSoon({ icon, label }) {
  return (
    <div style={{ padding:"60px 36px", textAlign:"center" }}>
      <div style={{ fontSize:52, marginBottom:16, opacity:0.3 }}>{icon}</div>
      <h2 style={{ fontSize:22, fontFamily:"'DM Serif Display',serif", color:C.text, marginBottom:8 }}>{label}</h2>
      <p style={{ fontSize:13, color:C.dim }}>This section is being built. Check back soon.</p>
    </div>
  );
}

// ── BUILD PHASE PAGES ─────────────────────────────────────────

function BuildHome({ nav }) {
  return (
    <div style={{ padding:"32px 36px" }}>
      <h1 style={{ fontSize:28, fontFamily:"'DM Serif Display',serif", color:C.text, marginBottom:6 }}>Building Phase 🚀</h1>
      <p style={{ color:C.dim, fontSize:14, marginBottom:28 }}>Find a real project. AbhyāsBot guides you. Connect GitHub. Build evidence.</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:24 }}>
        {[
          { icon:"🔍", label:"Project Discovery",   sub:"Find or create a project",  color:"#7C5CBF", id:"discover" },
          { icon:"🏗️", label:"AI Project Architect", sub:"Generate roadmap from idea", color:C.mint,   id:"architect" },
          { icon:"🌐", label:"Open Project Browser", sub:"Join someone's project",     color:"#3A7BD5", id:"open-projects" },
          { icon:"📋", label:"Kanban Workspace",     sub:"Your tasks, Kanban board",   color:"#E07B39", id:"kanban" },
          { icon:"👥", label:"Team Workspace",       sub:"Members, roles, PRs",        color:"#2D7A4F", id:"team" },
          { icon:"⬡",  label:"GitHub",               sub:"Connect your repository",    color:"#C0392B", id:"github" },
        ].map(c => (
          <Card key={c.id} onClick={() => nav(c.id)} accent={c.color} style={{ display:"flex", gap:12, alignItems:"center", padding:16 }}>
            <div style={{ width:40, height:40, borderRadius:11, background:`${c.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize:13.5, fontWeight:600, color:C.text, marginBottom:2 }}>{c.label}</div>
              <div style={{ fontSize:11.5, color:C.muted }}>{c.sub}</div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{ background:`linear-gradient(135deg, ${C.card}, #7C5CBF10)`, border:"1px solid #7C5CBF30", borderRadius:14, padding:22, display:"flex", gap:16, alignItems:"center" }}>
        <div style={{ width:48, height:48, borderRadius:14, background:"#7C5CBF20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>⚒️</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:600, color:"#7C5CBF", fontFamily:"'DM Serif Display',serif", marginBottom:3 }}>AbhyāsBot — Practice Companion</div>
          <div style={{ fontSize:12.5, color:C.muted, lineHeight:1.5 }}>Knows your project, milestone, task, and GitHub activity. Gives the next concrete step — not generic advice.</div>
        </div>
        <button onClick={() => nav("abhyasbot")} style={{ background:"#7C5CBF", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0 }}>Open →</button>
      </div>
    </div>
  );
}

function ProjectsPage({ nav }) {
  const [filter, setFilter] = useState("All");
  const domains = ["All","AI","Web3","Data","Cloud","Climate","Health"];
  const filtered = PROJECTS.filter(p => filter==="All" || p.domain===filter);
  return (
    <div style={{ padding:"32px 36px" }}>
      <Hero icon="🚀" title="Real World Projects" badge="Build phase" color="#7C5CBF"
        desc="Build real software solving real problems. Every project connects to GitHub, AI-guided by AbhyāsBot, verified as proof of skill." art="🌍" />
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {domains.map(f => <Chip key={f} label={f} active={filter===f} color="#7C5CBF" onClick={() => setFilter(f)} />)}
      </div>
      <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>{filtered.length} Projects · powered by AbhyāsBot</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        {filtered.map((p,i) => (
          <Card key={i} accent="#7C5CBF">
            <div style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>PROJECT</div>
            <h3 style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:6 }}>{p.title}</h3>
            <p style={{ fontSize:12.5, color:C.muted, lineHeight:1.6, marginBottom:12 }}>{p.desc}</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              <Tag label={p.level} bg={LVL[p.level]+"18"} color={LVL[p.level]} />
              {p.tech.slice(0,2).map(t => <Tag key={t} label={t} bg={C.card2} color={C.muted} />)}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12, fontSize:12, color:C.dim }}>
              <span>👥 {(p.students/1000).toFixed(1)}k</span>
              <span>⬡ {p.prs} PRs merged</span>
            </div>
            <div style={{ borderTop:`1px solid ${C.card2}`, paddingTop:12 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:50, fontSize:11, fontWeight:600, marginBottom:10, background:p.ready?"#22c55e18":"#25283640", color:p.ready?"#22c55e":C.dim }}>
                {p.ready?"✓ Ready for the project":"○ Prerequisites needed"}
              </div>
              <button style={{ display:"block", width:"100%", background:p.ready?"#7C5CBF":"transparent", color:p.ready?"#fff":"#7C5CBF", border:"1px solid #7C5CBF", borderRadius:8, padding:"8px", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
                {p.ready?"Start Project →":"View Details"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AbhyasBotPage() {
  const [msgs, setMsgs] = useState([
    { role:"agent", text:"Hey! I'm AbhyāsBot — your practice companion. Tell me which project and task you're working on, and I'll give you the next concrete step." }
  ]);
  const [input, setInput] = useState("");
  function send() {
    if(!input.trim()) return;
    const q = input; setInput("");
    setMsgs(m => [...m, {role:"user",text:q}, {role:"agent",text:"Based on your task completion criteria and project tech stack, here's what to do next. [AbhyāsBot loads project, milestone, task, GitHub context from PostgreSQL]"}]);
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
      <div style={{ padding:"14px 28px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12, background:C.sidebar }}>
        <div style={{ width:34, height:34, borderRadius:10, background:"#7C5CBF20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>⚒️</div>
        <div>
          <div style={{ fontSize:15, fontWeight:600, color:"#7C5CBF", fontFamily:"'DM Serif Display',serif" }}>AbhyāsBot</div>
          <div style={{ fontSize:11, color:C.dim }}>Practice companion · knows your project, milestone, task, GitHub</div>
        </div>
        <div style={{ marginLeft:"auto", fontSize:11, color:C.faint, background:C.card, border:`1px solid ${C.card2}`, borderRadius:6, padding:"4px 10px" }}>AI practice guidance · advisory only</div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", display:"flex", flexDirection:"column", gap:14 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ display:"flex", gap:10, flexDirection:m.role==="user"?"row-reverse":"row" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:m.role==="agent"?"#7C5CBF":C.card2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", flexShrink:0, fontWeight:700 }}>
              {m.role==="agent"?"⚒":"U"}
            </div>
            <div style={{ maxWidth:"76%", background:m.role==="agent"?C.card:"#7C5CBF", border:m.role==="agent"?`1px solid ${C.card2}`:"none", borderRadius:12, padding:"10px 14px", fontSize:13.5, color:m.role==="agent"?"#e5e7eb":"#fff", lineHeight:1.6 }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding:"14px 28px", borderTop:`1px solid ${C.border}`, background:C.sidebar }}>
        <div style={{ display:"flex", gap:10 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
            placeholder="Tell AbhyāsBot what you're building or stuck on..."
            style={{ flex:1, background:C.card, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 14px", fontSize:13.5, color:"#e5e7eb", outline:"none" }} />
          <button onClick={send} style={{ background:"#7C5CBF", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Send</button>
        </div>
      </div>
    </div>
  );
}

// ── PROOF PHASE PAGES ─────────────────────────────────────────

function ProofHome({ nav }) {
  return (
    <div style={{ padding:"32px 36px" }}>
      <h1 style={{ fontSize:28, fontFamily:"'DM Serif Display',serif", color:C.text, marginBottom:6 }}>Proof Phase 🧪</h1>
      <p style={{ color:C.dim, fontSize:14, marginBottom:28 }}>Real commits → AI review → verified skills → shareable proof-of-work profile.</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:24 }}>
        {[
          { icon:"🧪", label:"Evidence Dashboard", sub:"Real GitHub commits + PRs",   color:C.amber,   id:"evidence-dash" },
          { icon:"★",  label:"Skill Graph",        sub:"Verified skills + confidence", color:"#2D7A4F", id:"skill-graph" },
          { icon:"✦",  label:"Proof of Work",      sub:"Shareable public profile",     color:C.mint,    id:"pow" },
        ].map(c => (
          <Card key={c.id} onClick={() => nav(c.id)} accent={c.color} style={{ textAlign:"center", padding:24 }}>
            <div style={{ fontSize:32, marginBottom:10 }}>{c.icon}</div>
            <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:4 }}>{c.label}</div>
            <div style={{ fontSize:12, color:C.muted }}>{c.sub}</div>
          </Card>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        {[{label:"Real Commits",value:"0"},{label:"Merged PRs",value:"0"},{label:"Verified Skills",value:"0"}].map(s => (
          <div key={s.label} style={{ background:C.card, border:`1px solid ${C.card2}`, borderRadius:12, padding:20, textAlign:"center" }}>
            <div style={{ fontSize:36, fontFamily:"'DM Serif Display',serif", color:C.mint, lineHeight:1, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:12.5, color:C.muted, marginBottom:3 }}>{s.label}</div>
            <div style={{ fontSize:11, color:C.faint }}>real GitHub data only</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidencePage({ nav }) {
  return (
    <div style={{ padding:"32px 36px" }}>
      <Hero icon="🧪" title="Evidence Dashboard" badge="Proof phase" color={C.amber}
        desc="Your real GitHub contributions — every commit and PR captured, AI-reviewed, converted to verified skill evidence. No simulated data. Ever." art="🔬" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        {[{l:"Real Commits",v:"0"},{l:"Merged PRs",v:"0"},{l:"Verified Skills",v:"0"}].map(s => (
          <div key={s.l} style={{ background:C.card, border:`1px solid ${C.card2}`, borderRadius:12, padding:20, textAlign:"center" }}>
            <div style={{ fontSize:36, fontFamily:"'DM Serif Display',serif", color:C.amber, lineHeight:1, marginBottom:4 }}>{s.v}</div>
            <div style={{ fontSize:12.5, color:C.muted }}>{s.l}</div>
            <div style={{ fontSize:11, color:C.faint, marginTop:3 }}>real GitHub data only</div>
          </div>
        ))}
      </div>
      <Empty icon="⬡" title="No GitHub evidence yet"
        desc="Link a GitHub repository to your project, push real commits, merge real pull requests. Evidence appears here automatically via webhook."
        cta="Link GitHub Repository →" onCta={() => nav("github")} />
    </div>
  );
}

function ProofOfWorkPage() {
  return (
    <div style={{ padding:"32px 36px" }}>
      <Hero icon="✦" title="Proof of Work" badge="Verified" color={C.mint}
        desc="Your shareable proof-of-work profile. Every skill is backed by a real merged pull request — not self-reported. Share this URL with recruiters." art="🏆" />
      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20 }}>
        <div style={{ background:C.card, border:`1px solid ${C.card2}`, borderRadius:14, padding:24, textAlign:"center" }}>
          <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg, ${C.mint}, #007f7a)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, color:"#fff", margin:"0 auto 14px", fontWeight:700 }}>A</div>
          <div style={{ fontSize:18, fontWeight:600, color:C.text, marginBottom:4 }}>Your Name</div>
          <div style={{ fontSize:12, color:C.dim, marginBottom:6 }}>Year 3 · B.Tech CSE · Telangana</div>
          <a href="#" style={{ fontSize:12, color:C.mint, display:"block", marginBottom:18 }}>github.com/username ↗</a>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:18 }}>
            {[["0","Projects"],["0","PRs"],["0","Skills"]].map(([v,l]) => (
              <div key={l}><div style={{ fontSize:22, fontFamily:"'DM Serif Display',serif", color:C.mint }}>{v}</div><div style={{ fontSize:11, color:C.dim }}>{l}</div></div>
            ))}
          </div>
          <button style={{ width:"100%", background:C.mint, color:"#fff", border:"none", borderRadius:8, padding:"9px", fontSize:13, fontWeight:600, cursor:"pointer", marginBottom:8 }}>Share Profile →</button>
          <button style={{ width:"100%", background:"transparent", color:C.mint, border:`1px solid ${C.mint}`, borderRadius:8, padding:"8px", fontSize:13, fontWeight:600, cursor:"pointer" }}>View Public Profile ↗</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:C.card, border:`1px solid ${C.card2}`, borderRadius:14, padding:22 }}>
            <div style={{ fontSize:14, fontWeight:600, color:"#e5e7eb", marginBottom:12 }}>Verified Skills</div>
            <div style={{ fontSize:13, color:C.dim, textAlign:"center", padding:"24px 0" }}>No verified skills yet. Merge a PR → request AI review → skills appear with evidence links.</div>
          </div>
          <div style={{ background:C.card, border:`1px solid ${C.card2}`, borderRadius:14, padding:22 }}>
            <div style={{ fontSize:14, fontWeight:600, color:"#e5e7eb", marginBottom:12 }}>Proof Chain</div>
            <div style={{ fontSize:12, color:C.dim, lineHeight:1.8 }}>
              Every skill is traceable: <span style={{ color:C.mint }}>Skill</span> → <span style={{ color:C.mint }}>Skill Evidence</span> → <span style={{ color:C.mint }}>PR</span> → <span style={{ color:C.mint }}>Task</span> → <span style={{ color:C.mint }}>Project</span>
            </div>
          </div>
          <div style={{ background:C.card, border:`1px solid ${C.amber}30`, borderRadius:14, padding:18 }}>
            <div style={{ fontSize:11, color:C.amber, fontWeight:700, marginBottom:6 }}>⚠️ ADVISORY LABEL</div>
            <div style={{ fontSize:12, color:C.dim, lineHeight:1.65 }}>All skills are AI-assessed · Advisory only · Not professional certification. Every claim links to a real stored GitHub evidence record.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PROFILE PHASE PAGE ────────────────────────────────────────

function ProfilePage() {
  return (
    <div style={{ padding:"32px 36px" }}>
      <h1 style={{ fontSize:28, fontFamily:"'DM Serif Display',serif", color:C.text, marginBottom:6 }}>My Profile 👤</h1>
      <p style={{ color:C.dim, fontSize:14, marginBottom:28 }}>LinkedIn-style verified professional profile — evidence-backed, shareable, always current.</p>
      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:20, marginBottom:20 }}>
        <div style={{ background:C.card, border:`1px solid ${C.card2}`, borderRadius:14, padding:24 }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:`linear-gradient(135deg, ${C.mint}, #007f7a)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, color:"#fff", margin:"0 auto 14px", fontWeight:700 }}>A</div>
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <div style={{ fontSize:19, fontWeight:600, color:C.text }}>Your Name</div>
            <div style={{ fontSize:13, color:C.dim }}>AI Product Engineer · Year 3</div>
            <div style={{ fontSize:12, color:C.dim }}>Indur Institute of Technology, Siddipet</div>
          </div>
          <div style={{ borderTop:`1px solid ${C.card2}`, paddingTop:14 }}>
            {[["Target Role","AI Product Engineer"],["Education Year","3rd Year B.Tech CSE"],["GitHub","github.com/username"],["Profile Views","0 this week"]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${C.card2}`, fontSize:12 }}>
                <span style={{ color:C.dim }}>{k}</span>
                <span style={{ color:C.muted }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[
            { title:"About / Pitch", desc:"Add a short pitch describing what you build and what you are looking for.", icon:"📝" },
            { title:"Evidence-Backed Skills", desc:"Skills appear here after you merge PRs and request AI review. Every badge links to real evidence.", icon:"★" },
            { title:"Project Showcase", desc:"Your projects with live demo links, GitHub repos, and AI-verified contribution records.", icon:"🚀" },
            { title:"Certifications", desc:"Add external certifications from Google, AWS, IBM, Microsoft. Links verified, displayed with issuer badge.", icon:"🎓" },
          ].map(s => (
            <div key={s.title} style={{ background:C.card, border:`1px solid ${C.card2}`, borderRadius:14, padding:20, display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ fontSize:22, marginTop:2 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"#e5e7eb", marginBottom:4 }}>{s.title}</div>
                <div style={{ fontSize:13, color:C.dim, lineHeight:1.55 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ background:C.card, border:`1px solid ${C.card2}`, borderRadius:14, padding:20 }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#e5e7eb", marginBottom:12 }}>Analytics (Private)</div>
          {[["Profile views","0"],["Post impressions","0"],["Search appearances","0"],["Connection requests","0"]].map(([l,v]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${C.card2}`, fontSize:12 }}>
              <span style={{ color:C.dim }}>{l}</span>
              <span style={{ color:C.mint, fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.card2}`, borderRadius:14, padding:20 }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#e5e7eb", marginBottom:12 }}>People You May Know</div>
          <div style={{ fontSize:13, color:C.dim, textAlign:"center", padding:"24px 0" }}>Connect with more students to see recommendations.</div>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR CONFIGS ───────────────────────────────────────────

const LEARN_NAV = [
  { section:"DISCOVER", items:[
    { icon:"◎", label:"Overview",          id:"learn-home" },
    { icon:"📊", label:"My Activity",       id:"activity" },
    { icon:"🏆", label:"Leaderboard",       id:"leaderboard", badge:"NEW" },
  ]},
  { section:"LEARN", items:[
    { icon:"🗺", label:"Career Tracks",     id:"career" },
    { icon:"⚡", label:"Skill Tracks",      id:"skill-tracks" },
    { icon:"📚", label:"Courses",           id:"courses" },
    { icon:"🎯", label:"Practice",          id:"practice" },
    { icon:"📝", label:"Assessments",       id:"assessments" },
    { icon:"📦", label:"Resources",         id:"resources", badge:"NEW" },
  ]},
  { section:"AI COMPANION", items:[
    { icon:"🧠", label:"ŚiṣyaChat",        id:"sisyachat" },
    { icon:"🗺", label:"Learning Roadmap", id:"roadmap" },
  ]},
];

const BUILD_NAV = [
  { section:"DISCOVER", items:[
    { icon:"◎", label:"Overview",            id:"build-home" },
    { icon:"🔍", label:"Project Discovery",  id:"discover" },
    { icon:"🌐", label:"Open Projects",      id:"open-projects" },
  ]},
  { section:"BUILD", items:[
    { icon:"🚀", label:"Real World Projects",id:"projects" },
    { icon:"🏗️", label:"AI Architect",       id:"architect" },
    { icon:"📋", label:"Kanban Workspace",   id:"kanban" },
    { icon:"👥", label:"Team Workspace",     id:"team" },
    { icon:"⬡",  label:"GitHub",             id:"github" },
  ]},
  { section:"AI COMPANION", items:[
    { icon:"⚒️", label:"AbhyāsBot",          id:"abhyasbot" },
  ]},
];

const PROOF_NAV = [
  { section:"PROVE", items:[
    { icon:"◎", label:"Overview",            id:"proof-home" },
    { icon:"🧪", label:"Evidence Dashboard", id:"evidence-dash" },
    { icon:"★",  label:"Skill Graph",        id:"skill-graph" },
    { icon:"✦",  label:"Proof of Work",      id:"pow" },
  ]},
  { section:"PUBLISH", items:[
    { icon:"👤", label:"Public Profile",     id:"public-profile" },
    { icon:"🔗", label:"Share Link",         id:"share" },
  ]},
];

const PROFILE_NAV = [
  { section:"MY PROFILE", items:[
    { icon:"◎", label:"Profile Overview",   id:"profile-home" },
    { icon:"📝", label:"About / Pitch",      id:"about" },
    { icon:"★",  label:"Verified Skills",   id:"skills-profile" },
    { icon:"🚀", label:"Project Showcase",  id:"showcase" },
    { icon:"🎓", label:"Certifications",    id:"certs" },
  ]},
  { section:"NETWORK", items:[
    { icon:"📊", label:"Analytics",         id:"analytics" },
    { icon:"👥", label:"Connections",       id:"connections" },
    { icon:"💼", label:"Company Pages",     id:"companies" },
  ]},
  { section:"COMMUNITY", items:[
    { icon:"💬", label:"Groups & Chat",     id:"community" },
    { icon:"📡", label:"Activity Feed",     id:"feed" },
    { icon:"🎥", label:"Video Calls",       id:"video" },
  ]},
];

// ── PAGE RENDERERS ────────────────────────────────────────────

function getLearnPage(page, nav) {
  switch(page) {
    case "learn-home":   return <LearnHome nav={nav} />;
    case "career":       return <CareerTracksPage />;
    case "skill-tracks": return <SkillTracksPage />;
    case "sisyachat":    return <SisyaChatPage />;
    default:             return <ComingSoon icon="📚" label={page.replace(/-/g," ")} />;
  }
}

function getBuildPage(page, nav) {
  switch(page) {
    case "build-home": return <BuildHome nav={nav} />;
    case "projects":   return <ProjectsPage nav={nav} />;
    case "abhyasbot":  return <AbhyasBotPage />;
    default:           return <ComingSoon icon="🚀" label={page.replace(/-/g," ")} />;
  }
}

function getProofPage(page, nav) {
  switch(page) {
    case "proof-home":    return <ProofHome nav={nav} />;
    case "evidence-dash": return <EvidencePage nav={nav} />;
    case "pow":           return <ProofOfWorkPage />;
    default:              return <ComingSoon icon="🧪" label={page.replace(/-/g," ")} />;
  }
}

function getProfilePage(page) {
  switch(page) {
    case "profile-home": return <ProfilePage />;
    default:             return <ComingSoon icon="👤" label={page.replace(/-/g," ")} />;
  }
}

// ── PHASE LAYOUT (sidebar + content) ─────────────────────────

function PhaseLayout({ navConfig, page, setPage, color, children }) {
  return (
    <div style={{ display:"flex", flex:1, minHeight:"calc(100vh - 56px)" }}>
      {/* Phase sidebar */}
      <aside style={{ width:210, background:C.sidebar, borderRight:`1px solid ${C.border}`, overflowY:"auto", flexShrink:0 }}>
        <nav style={{ padding:"10px 8px" }}>
          {navConfig.map(section => (
            <div key={section.section} style={{ marginBottom:6 }}>
              <SideSection label={section.section} />
              {section.items.map(item => (
                <SideNavItem key={item.id} icon={item.icon} label={item.label}
                  active={page===item.id} color={color} badge={item.badge}
                  onClick={() => setPage(item.id)} />
              ))}
            </div>
          ))}
        </nav>
      </aside>
      {/* Content */}
      <div style={{ flex:1, overflowY:"auto" }}>
        {children}
      </div>
    </div>
  );
}

// ── TOP NAV TABS ──────────────────────────────────────────────

const TABS = [
  { id:"learn",   label:"Learn",   icon:"📚", color:C.mint,   desc:"Career Tracks · Skill Tracks · ŚiṣyaChat · Roadmap" },
  { id:"build",   label:"Build",   icon:"🚀", color:"#7C5CBF", desc:"Projects · AbhyāsBot · Kanban · GitHub" },
  { id:"proof",   label:"Proof",   icon:"🧪", color:C.amber,  desc:"Evidence · Skills · Proof of Work" },
  { id:"profile", label:"Profile", icon:"👤", color:"#3A7BD5", desc:"My Profile · Network · Community" },
];

// ── ROOT APP ──────────────────────────────────────────────────

export default function SisyaApp() {
  const [activeTab, setActiveTab] = useState("learn");
  const [learnPage,   setLearnPage]   = useState("learn-home");
  const [buildPage,   setBuildPage]   = useState("build-home");
  const [proofPage,   setProofPage]   = useState("proof-home");
  const [profilePage, setProfilePage] = useState("profile-home");

  const tab = TABS.find(t => t.id === activeTab);

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", fontFamily:"'DM Sans', system-ui, sans-serif", background:C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:${C.sidebar}; }
        ::-webkit-scrollbar-thumb { background:#2d3748; border-radius:2px; }
      `}</style>

      {/* ── TOP NAV ── */}
      <header style={{ height:56, background:C.sidebar, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"0 24px", gap:0, position:"sticky", top:0, zIndex:100, flexShrink:0 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:9, marginRight:32, flexShrink:0 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:C.mint, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#fff" }}>⬡</div>
          <span style={{ fontSize:15, fontFamily:"'DM Serif Display',serif", color:C.text }}>Śiṣya Abhyāsa</span>
        </div>

        {/* 4 Tab Navigation */}
        <div style={{ display:"flex", gap:2, flex:1 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              display:"flex", alignItems:"center", gap:7,
              padding:"0 20px", height:56, border:"none", cursor:"pointer",
              background: activeTab===t.id ? `${t.color}15` : "transparent",
              borderBottom: activeTab===t.id ? `2px solid ${t.color}` : "2px solid transparent",
              color: activeTab===t.id ? t.color : C.muted,
              fontSize:14, fontWeight: activeTab===t.id ? 600 : 400,
              transition:"all 0.15s",
            }}>
              <span style={{ fontSize:15 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <div style={{ fontSize:12, color:C.dim, textAlign:"right" }}>
            <div style={{ color:tab.color, fontWeight:600 }}>{tab.label} Phase</div>
            <div style={{ fontSize:11 }}>{tab.desc}</div>
          </div>
          <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg, ${C.mint}, #007f7a)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#fff", fontWeight:700 }}>A</div>
        </div>
      </header>

      {/* ── PHASE CONTENT ── */}
      {activeTab==="learn" && (
        <PhaseLayout navConfig={LEARN_NAV} page={learnPage} setPage={setLearnPage} color={C.mint}>
          {getLearnPage(learnPage, setLearnPage)}
        </PhaseLayout>
      )}
      {activeTab==="build" && (
        <PhaseLayout navConfig={BUILD_NAV} page={buildPage} setPage={setBuildPage} color="#7C5CBF">
          {getBuildPage(buildPage, setBuildPage)}
        </PhaseLayout>
      )}
      {activeTab==="proof" && (
        <PhaseLayout navConfig={PROOF_NAV} page={proofPage} setPage={setProofPage} color={C.amber}>
          {getProofPage(proofPage, setProofPage)}
        </PhaseLayout>
      )}
      {activeTab==="profile" && (
        <PhaseLayout navConfig={PROFILE_NAV} page={profilePage} setPage={setProfilePage} color="#3A7BD5">
          {getProfilePage(profilePage)}
        </PhaseLayout>
      )}
    </div>
  );
}
