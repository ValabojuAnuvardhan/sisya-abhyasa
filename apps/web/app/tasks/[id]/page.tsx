'use client';
import {useEffect,useState} from 'react'; 
import {useParams} from 'next/navigation'; 
import {api} from '../../../lib/api';
import PageBack from '../../../components/PageBack';

type T={id:string;project_id:string;project_title:string;milestone_title:string;title:string;description:string;completion_criteria:string;required_skills:string[];resources:string[];status:string};

export default function TaskPage(){
  const {id}=useParams<{id:string}>();
  const [t,setT]=useState<T|null>(null);
  const [q,setQ]=useState('');
  const [answer,setAnswer]=useState('');
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');

  useEffect(()=>{
    api(`/tasks/${id}`).then(setT).catch(e=>setError(e.message))
  },[id]);

  async function ask(){
    if(!q.trim())return;
    try{
      const r=await api(`/tasks/${id}/mentor`,{
        method:'POST',
        body:JSON.stringify({question:q})
      });
      setAnswer(r.answer);
      setNotice(r.notice);
    }catch(e:any){
      setError(e.message);
    }
  }

  if(error)return <main className="shell formPage"><PageBack href="/projects" label="Back to Projects" /><p className="error">{error}</p></main>;
  if(!t)return <main className="shell formPage"><PageBack href="/projects" label="Back to Projects" /><p>Loading task…</p></main>;

  return (
    <main className="shell formPage">
      <PageBack href={`/projects/${t.project_id}`} label="Back to Workspace" />
      <span className="tag">{t.project_title} · {t.milestone_title}</span>
      <h1>{t.title}</h1>
      <p className="lead">{t.description}</p>
      
      <section className="card">
        <h2>Done when</h2>
        <p>{t.completion_criteria}</p>
      </section>

      <section>
        <h2>Required skills</h2>
        <div className="chips">
          {t.required_skills.map(s=><span className="tag" key={s}>{s}</span>)}
        </div>
      </section>

      <section>
        <h2>Learn for this task</h2>
        {t.resources.length?(
          <ul>{t.resources.map(r=><li key={r}>{r}</li>)}</ul>
        ):(
          <div className="notice">No validated resource is attached yet. Resource validation will be strengthened before public V1.</div>
        )}
      </section>

      <section className="card">
        <h2>Ask project mentor</h2>
        <p className="note">The mentor is scoped to this task and project. This checkpoint uses a clearly labelled local contextual helper, not a remote AI model.</p>
        <textarea value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you stuck on?"/>
        <button className="btn primary" style={{marginTop:12}} onClick={ask}>Ask mentor</button>
        {answer&&(
          <div className="notice" style={{marginTop:16}}>
            <strong>Mentor guidance</strong>
            <p>{answer}</p>
            <small>{notice}</small>
          </div>
        )}
      </section>
    </main>
  );
}
