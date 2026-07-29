'use client';
import {useSearchParams,useRouter} from 'next/navigation';
import {useState,Suspense} from 'react';
import {api} from '../../../lib/api';
import PageBack from '../../../components/PageBack';

type Task={title:string;description:string;completion_criteria:string;required_skills:string[];resources:string[]};
type Plan={project_summary:string;suggested_stack:string[];completion_definition:string[];milestones:{title:string;objective:string;tasks:Task[]}[];generated_by:'ai'|'local-demo';notice:string};

function NewProjectForm(){
  const q=useSearchParams();
  const router=useRouter(); 
  const rec=q.get('recommendation')||'';
  
  const [title,setTitle]=useState(rec);
  const [description,setDescription]=useState(rec?`Build ${rec} as a focused student project that solves the stated problem and produces reviewable technical evidence.`:'');
  const [difficulty,setDifficulty]=useState('intermediate');
  const [stack,setStack]=useState('');
  const [plan,setPlan]=useState<Plan|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  async function architect(){
    setLoading(true);
    setError('');
    try{
      setPlan(await api('/projects/architect',{
        method:'POST',
        body:JSON.stringify({
          title,
          description,
          difficulty,
          desired_stack:stack.split(',').map(x=>x.trim()).filter(Boolean)
        })
      }));
    }catch(e){
      setError(e instanceof Error?e.message:'Could not create plan');
    }finally{
      setLoading(false);
    }
  }

  async function accept(){
    if(!plan)return;
    setLoading(true);
    setError('');
    try{
      const p=await api('/projects',{
        method:'POST',
        body:JSON.stringify({
          title,
          description,
          difficulty,
          desired_stack:stack.split(',').map(x=>x.trim()).filter(Boolean),
          plan
        })
      });
      router.push(`/projects/${p.id}`);
    }catch(e){
      setError(e instanceof Error?e.message:'Could not save project');
    }finally{
      setLoading(false);
    }
  }

  return (
    <main className="shell formPage">
      <PageBack href="/discover" label="Back to Discover" />
      <span className="tag">A1 · Project Architect</span>
      <h1>Turn the idea into an executable project.</h1>
      <p className="lead">Review the idea first. The architect proposes a bounded plan; nothing is persisted as an active project until you accept it.</p>
      
      <div className="formCard">
        <label>Project title
          <input value={title} onChange={e=>setTitle(e.target.value)}/>
        </label>
        <label>Problem / project description
          <textarea rows={5} value={description} onChange={e=>setDescription(e.target.value)}/>
        </label>
        <label>Difficulty
          <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
            <option>beginner</option>
            <option>intermediate</option>
            <option>challenging</option>
          </select>
        </label>
        <label>Preferred stack (optional)
          <input value={stack} onChange={e=>setStack(e.target.value)} placeholder="Next.js, FastAPI, PostgreSQL"/>
        </label>
        <button className="btn primary" disabled={loading||title.length<3||description.length<10} onClick={architect}>
          {loading?'Working…':plan?'Regenerate plan':'Generate project plan'}
        </button>
      </div>

      {error&&<p className="error">{error}</p>}

      {plan&&(
        <section className="planReview">
          <div className="resultHead">
            <div>
              <h2>Plan review</h2>
              <p>{plan.notice}</p>
            </div>
            <span className="tag">{plan.generated_by==='ai'?'AI generated':'Local demo architect'}</span>
          </div>
          <div className="planSummary">
            <h3>Suggested stack</h3>
            <p>{plan.suggested_stack.join(' · ')}</p>
            <h3>Definition of complete</h3>
            <ul>{plan.completion_definition.map(x=><li key={x}>{x}</li>)}</ul>
          </div>
          {plan.milestones.map((m,i)=>(
            <article className="milestone" key={m.title}>
              <span className="tag">Milestone {i+1}</span>
              <h2>{m.title}</h2>
              <p>{m.objective}</p>
              {m.tasks.map((t,j)=>(
                <div className="task" key={t.title}>
                  <strong>{j+1}. {t.title}</strong>
                  <p>{t.description}</p>
                  <small><b>Done when:</b> {t.completion_criteria}</small>
                  <small><b>Skills:</b> {t.required_skills.join(' · ')}</small>
                </div>
              ))}
            </article>
          ))}
          <div className="actions left">
            <button className="btn primary" onClick={accept} disabled={loading}>Accept & create project</button>
            <button className="btn secondary" onClick={()=>setPlan(null)}>Edit idea first</button>
          </div>
        </section>
      )}
    </main>
  );
}

export default function NewProject(){
  return (
    <Suspense fallback={<main className="shell formPage"><p>Loading Architect Form…</p></main>}>
      <NewProjectForm />
    </Suspense>
  );
}
