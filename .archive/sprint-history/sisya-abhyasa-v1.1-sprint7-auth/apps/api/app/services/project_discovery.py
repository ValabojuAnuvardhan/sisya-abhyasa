import json
from hashlib import sha1
import httpx
from app.core.config import settings
from app.models.user import User
from app.schemas.project_discovery import ProjectDiscoveryRequest, ProjectDiscoveryResponse, ProjectRecommendation

CATALOG = [
    dict(title='Campus Event Discovery API', problem='Students miss useful campus events because information is scattered across clubs and departments.', roles=['backend','software','full stack'], stack=['Python','FastAPI','PostgreSQL'], practice=['Python','Git'], learn=['FastAPI','REST APIs','PostgreSQL'], deliverables=['Event CRUD API','Search/filter endpoint','Database schema','API tests']),
    dict(title='AI Resume Feedback Assistant', problem='Students struggle to turn generic resume advice into feedback relevant to a target role.', roles=['ai','machine learning','backend','full stack'], stack=['Python','FastAPI','LLM API'], practice=['Python','Git'], learn=['Prompt design','API integration','Structured outputs'], deliverables=['Resume input flow','Structured feedback API','Role-specific rubric','Evaluation cases']),
    dict(title='Student Expense Insight Dashboard', problem='Students can record spending but often cannot understand where their money goes or identify patterns.', roles=['data','frontend','full stack','software'], stack=['TypeScript','Next.js','PostgreSQL'], practice=['JavaScript','Git'], learn=['TypeScript','Data visualization','SQL'], deliverables=['Expense entry flow','Category summaries','Monthly insights','Responsive dashboard']),
    dict(title='Study Resource Organizer', problem='Learners save tutorials, documentation and videos in many places and lose track of what is useful for the task they are doing.', roles=['frontend','full stack','software'], stack=['TypeScript','Next.js','PostgreSQL'], practice=['JavaScript','HTML','CSS'], learn=['Next.js','Database design','Search/filter UX'], deliverables=['Resource library','Tags and filters','Learning-status workflow','Persistent storage']),
    dict(title='Issue Triage Assistant for Open Source', problem='Beginner contributors have difficulty identifying understandable GitHub issues that match their skills.', roles=['ai','backend','open source','software'], stack=['Python','FastAPI','GitHub API'], practice=['Python','Git'], learn=['GitHub API','Classification','API integration'], deliverables=['Issue ingestion','Skill/difficulty classification','Recommendation endpoint','Evaluation dataset']),
    dict(title='Peer Project Feedback Board', problem='Student teams need a lightweight way to request structured feedback on project milestones instead of relying on scattered chat messages.', roles=['frontend','full stack','software'], stack=['TypeScript','Next.js','PostgreSQL'], practice=['JavaScript','Git'], learn=['Next.js','Form validation','Relational data'], deliverables=['Project milestone page','Feedback requests','Structured review form','Feedback history']),
]

def _id(title: str) -> str:
    return sha1(title.encode()).hexdigest()[:10]

def _difficulty(level: str | None, requested: str | None) -> str:
    if requested: return requested
    return 'beginner' if (level or '').lower() in {'beginner','new'} else 'intermediate'

def local_recommendations(user: User, payload: ProjectDiscoveryRequest) -> ProjectDiscoveryResponse:
    profile=user.profile
    role=(profile.target_role or '').lower()
    interests=' '.join(filter(None,[profile.interests,payload.interests])).lower()
    current=[s.name for s in user.skills]
    current_lower={s.lower() for s in current}
    tokens=set((role+' '+interests+' '+' '.join(payload.desired_skills)).replace('/',' ').split())
    def score(item):
        role_score=sum(3 for r in item['roles'] if any(x in role for x in r.split()))
        token_score=sum(1 for x in item['stack']+item['learn'] if any(t in x.lower() for t in tokens))
        return role_score+token_score
    ranked=sorted(CATALOG,key=score,reverse=True)[:4]
    difficulty=_difficulty(profile.experience_level,payload.preferred_difficulty)
    recs=[]
    for item in ranked:
        practice=[x for x in item['practice'] if x.lower() in current_lower] or current[:2] or item['practice'][:1]
        learn=[x for x in item['learn'] if x.lower() not in current_lower][:3] or item['learn'][:2]
        target=profile.target_role or 'your target role'
        recs.append(ProjectRecommendation(
            id=_id(item['title']), title=item['title'], problem=item['problem'], difficulty=difficulty,
            why_this_matches=f"This is scoped for your {profile.experience_level or 'current'} level and builds toward {target} while giving you concrete work to show.",
            suggested_stack=item['stack'], skills_to_practice=practice, skills_to_learn=learn,
            expected_deliverables=item['deliverables'],
            evidence_opportunities=['Task completion linked to code','Meaningful pull request','Tests or documented validation','Project README/demo evidence']
        ))
    return ProjectDiscoveryResponse(recommendations=recs, generated_by='local-demo', notice='Demo recommendations use the server-side local engine because no AI provider is configured. They are learning recommendations, not claims of employer demand.')

def _prompt(user: User, payload: ProjectDiscoveryRequest) -> str:
    p=user.profile
    return f'''You are A0, the Project Discovery Agent for Sisya Abhyasa. Recommend exactly 4 realistic software projects for a college student. Optimize for buildability, learning value, and evidence-producing work—not trendiness. Never claim employer demand, hiring outcomes, sponsorship, certification, or internship status.
Student target role: {p.target_role}
Experience: {p.experience_level}
Education year: {p.education_year}
Current skills: {', '.join(s.name for s in user.skills) or 'not specified'}
Interests: {p.interests or ''}; additional: {payload.interests or ''}
Desired skills: {', '.join(payload.desired_skills)}
Preferred difficulty: {payload.preferred_difficulty or 'infer from experience'}
Time commitment: {payload.time_commitment or 'moderate'}
Return ONLY JSON with key recommendations. Each recommendation must contain: id, title, problem, why_this_matches, difficulty (beginner|intermediate|challenging), suggested_stack, skills_to_practice, skills_to_learn, expected_deliverables, evidence_opportunities. Arrays should be concise. id may be a short slug.'''

async def discover(user: User, payload: ProjectDiscoveryRequest) -> ProjectDiscoveryResponse:
    if not settings.gemini_api_key:
        return local_recommendations(user,payload)
    url=f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
    body={'contents':[{'parts':[{'text':_prompt(user,payload)}]}], 'generationConfig':{'responseMimeType':'application/json','temperature':0.6}}
    try:
        async with httpx.AsyncClient(timeout=25) as client:
            response=await client.post(url,json=body); response.raise_for_status()
        text=response.json()['candidates'][0]['content']['parts'][0]['text']
        parsed=json.loads(text)
        result=ProjectDiscoveryResponse(recommendations=parsed['recommendations'],generated_by='ai',notice='AI-generated learning recommendations. They do not represent employer demand, sponsorship, internship status, or guaranteed outcomes.')
        return result
    except Exception:
        return local_recommendations(user,payload)
