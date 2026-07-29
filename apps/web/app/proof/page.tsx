'use client';
import {useEffect,useState} from 'react'; 
import {api} from '../../lib/api';
import PageBack from '../../components/PageBack';

type Data={student:{name:string;target_role:string|null;experience_level:string|null};projects:{project_id:string;title:string;description:string;difficulty:string;repository_visibility:string;contributions:{pull_request_number:number;title:string;status:string;task:string|null;skills:{name:string;evidence_kind:string;explanation:string}[]}[]}[];notice:string;publishing:{public:boolean;slug:string|null}};

export default function Proof(){
  const [d,setD]=useState<Data|null>(null);
  const [err,setErr]=useState('');
  const [busy,setBusy]=useState(false);

  const load=()=>api('/proof-of-work/me').then(setD).catch(e=>setErr(e.message));
  
  useEffect(()=>{ load(); },[]);

  async function toggle(){
    setBusy(true);
    try{
      await api(d?.publishing.public?'/proof-of-work/unpublish':'/proof-of-work/publish',{method:'POST'});
      await load();
    }catch(e:any){
      setErr(e.message);
    }finally{
      setBusy(false);
    }
  }

  if(err)return <main className="shell formPage"><p className="error">{err}</p></main>;
  if(!d)return <main className="shell formPage"><p>Loading Proof-of-Work…</p></main>;

  return (
    <main className="shell formPage">
      <PageBack href="/dashboard" label="Back to Dashboard" />
      <span className="tag">Private preview</span>
      <h1>{d.student.name}'s Proof-of-Work</h1>
      <p className="lead">{d.student.target_role||'Student developer'} · {d.student.experience_level||'Experience level not set'}</p>
      
      <div className="notice">
        <strong>Privacy-safe publishing</strong>
        <p>Private repository code, repository URLs, commit URLs, raw webhook payloads, OAuth data and secrets are never included in this public projection.</p>
      </div>

      <div className="actions left">
        <button className="btn primary" disabled={busy} onClick={toggle}>
          {d.publishing.public?'Unpublish profile':'Publish profile'}
        </button>
        {d.publishing.public&&d.publishing.slug&&(
          <a className="btn secondary" href={`/p/${d.publishing.slug}`} target="_blank" rel="noreferrer">Open public profile</a>
        )}
      </div>

      <section className="planReview">
        <h2>Evidence-backed projects</h2>
        {d.projects.length===0?(
          <p className="status">No publishable evidence yet. A merged, attributed PR with recorded evidence will appear here.</p>
        ):d.projects.map(p=>(
          <article className="milestone" key={p.project_id}>
            <span className="tag">{p.difficulty} · {p.repository_visibility} source</span>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            {p.contributions.map(c=>(
              <div className="task" key={c.pull_request_number}>
                <strong>Contribution: {c.title}</strong>
                <small>Merged contribution · PR #{c.pull_request_number}{c.task?` · Task: ${c.task}`:''}</small>
                {c.skills.map(s=>(
                  <p key={s.name}><b>{s.name} · Demonstrated</b><br/>{s.explanation}</p>
                ))}
              </div>
            ))}
          </article>
        ))}
      </section>

      <p className="note">{d.notice}</p>
    </main>
  );
}
