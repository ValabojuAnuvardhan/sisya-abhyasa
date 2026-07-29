'use client';
import {useEffect,useState} from 'react'; 
import {api} from '../../lib/api';
import PageBack from '../../components/PageBack';

type P={id:string;title:string;description:string;difficulty:string;status:string;role:string};

export default function MyProjects(){
  const [items,setItems]=useState<P[]>([]);
  const [error,setError]=useState('');

  useEffect(()=>{
    api('/projects').then(setItems).catch(e=>setError(e.message))
  },[]);

  return (
    <main className="shell formPage">
      <PageBack href="/dashboard" label="Back to Dashboard" />
      <span className="tag">Workspace</span>
      <h1>My projects</h1>
      <p className="lead">Continue the work you have already planned.</p>
      
      {error&&<p className="error">{error}</p>}
      
      <div className="grid">
        {items.map(p=>(
          <a className="card choice" href={`/projects/${p.id}`} key={p.id}>
            <span className="tag">{p.difficulty} · {p.status} · {p.role}</span>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
          </a>
        ))}
      </div>

      {!error&&!items.length&&(
        <div className="notice">No projects yet. Start from Project Discovery or bring your own idea.</div>
      )}
    </main>
  );
}
