'use client';
import {useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
import {api} from '../../../../lib/api';
import PageBack from '../../../../components/PageBack';

type Req={id:string;requester_user_id:string;requester_name:string;message:string|null;status:string;created_at:string};

export default function CollaborationSettings(){
  const {id}=useParams<{id:string}>();
  const [p,setP]=useState<any>(null);
  const [requests,setRequests]=useState<Req[]>([]);
  const [pitch,setPitch]=useState('');
  const [skills,setSkills]=useState('');
  const [capacity,setCapacity]=useState(4);
  const [discoverable,setDiscoverable]=useState(false);
  const [error,setError]=useState('');

  async function load(){
    try{
      const project=await api(`/projects/${id}`);
      setP(project);
      setPitch(project.collaboration_pitch||'');
      setSkills((project.skills_needed||[]).join(', '));
      setCapacity(project.team_capacity||4);
      setDiscoverable(project.discoverable);
      if(project.my_role==='owner') setRequests(await api(`/projects/${id}/join-requests`));
    }catch(e:any){
      setError(e.message);
    }
  }

  useEffect(()=>{load()},[id]);

  async function save(){
    try{
      await api(`/projects/${id}/discovery`,{
        method:'PATCH',
        body:JSON.stringify({
          discoverable,
          collaboration_pitch:pitch,
          skills_needed:skills.split(',').map(x=>x.trim()).filter(Boolean),
          team_capacity:capacity
        })
      });
      await load();
    }catch(e:any){
      setError(e.message);
    }
  }

  async function decide(rid:string,decision:'accepted'|'rejected'){
    try{
      await api(`/projects/${id}/join-requests/${rid}`,{
        method:'PATCH',
        body:JSON.stringify({decision})
      });
      await load();
    }catch(e:any){
      setError(e.message);
    }
  }

  if(error)return <main className="shell formPage"><p className="error">{error}</p></main>;
  if(!p)return <main className="shell formPage"><p>Loading…</p></main>;
  if(p.my_role!=='owner')return <main className="shell formPage"><p className="error">Only the project owner can manage collaboration discovery.</p></main>;

  return (
    <main className="shell formPage">
      <PageBack href={`/projects/${id}`} label="Back to Workspace" />
      <span className="tag">Collaboration Discovery</span>
      <h1>{p.title}</h1>
      <p className="lead">Publish only the information students need to decide whether to request access. Your tasks, Team Space, Meet link, repository and evidence remain private.</p>
      
      <section className="formCard">
        <label><input type="checkbox" checked={discoverable} onChange={e=>setDiscoverable(e.target.checked)}/> Looking for collaborators</label>
        <label>Project pitch<textarea value={pitch} onChange={e=>setPitch(e.target.value)} placeholder="What are you building and what kind of teammate would help?"/></label>
        <label>Skills needed (comma separated)<input value={skills} onChange={e=>setSkills(e.target.value)} placeholder="Python, FastAPI, React"/></label>
        <label>Maximum team size<input type="number" min={2} max={12} value={capacity} onChange={e=>setCapacity(Number(e.target.value))}/></label>
        <button className="btn primary" onClick={save}>Save discovery settings</button>
      </section>

      <section className="planReview">
        <h2>Join requests</h2>
        {!requests.length?<p className="status">No requests yet.</p>:requests.map(r=>(
          <article className="task" key={r.id}>
            <strong>{r.requester_name}</strong>
            <small>{r.status} · {new Date(r.created_at).toLocaleString()}</small>
            {r.message&&<p>{r.message}</p>}
            {r.status==='pending'&&(
              <div className="referenceRow">
                <button className="btn primary" onClick={()=>decide(r.id,'accepted')}>Accept</button>
                <button className="btn secondary" onClick={()=>decide(r.id,'rejected')}>Reject</button>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
