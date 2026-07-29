'use client';
import {useEffect,useState} from 'react'; 
import {useParams} from 'next/navigation';
import PageBack from '../../../components/PageBack';

const API=process.env.NEXT_PUBLIC_API_URL??'http://localhost:8000/api/v1';

export default function PublicProof(){
  const {slug}=useParams<{slug:string}>();
  const [d,setD]=useState<any>(null);
  const [err,setErr]=useState('');

  useEffect(()=>{
    fetch(`${API}/public/proof-of-work/${slug}`,{cache:'no-store'})
      .then(async r=>{
        if(!r.ok) throw new Error('This Proof-of-Work profile is not public or does not exist.');
        return r.json();
      })
      .then(setD)
      .catch(e=>setErr(e.message));
  },[slug]);

  if(err)return <main className="shell formPage"><PageBack href="/" label="Back to Home" /><p className="error">{err}</p></main>;
  if(!d)return <main className="shell formPage"><PageBack href="/" label="Back to Home" /><p>Loading public profile…</p></main>;

  return (
    <main className="shell formPage">
      <PageBack href="/" label="Back to Home" />
      <span className="tag">Public Proof-of-Work</span>
      <h1>{d.student.name}</h1>
      <p className="lead">{d.student.target_role||'Student developer'} · Evidence-backed project experience</p>
      
      <section className="planReview">
        {d.projects.map((p:any)=>(
          <article className="milestone" key={p.project_id}>
            <span className="tag">{p.difficulty}</span>
            <h2>{p.title}</h2>
            <p>{p.description}</p>
            {p.contributions.map((c:any)=>(
              <div className="task" key={c.pull_request_number}>
                <strong>{c.title}</strong>
                <small>Merged contribution · PR #{c.pull_request_number}{c.task?` · ${c.task}`:''}</small>
                <div className="chips">
                  {c.skills.map((s:any)=>(
                    <span className="chip active" key={s.name}>{s.name} · Demonstrated</span>
                  ))}
                </div>
                {c.skills.map((s:any)=>(
                  <p key={s.name}>{s.explanation}</p>
                ))}
              </div>
            ))}
          </article>
        ))}
      </section>

      <div className="notice">
        <strong>Evidence boundary</strong>
        <p>{d.notice}</p>
        <p>Private source code and private repository links are not published.</p>
      </div>
    </main>
  );
}
