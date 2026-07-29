'use client';
import {useEffect,useState} from 'react';
import {api} from '../../lib/api';
import PageBack from '../../components/PageBack';

type Me={full_name:string|null;target_role:string|null;experience_level:string|null;interests:string|null;onboarding_completed:boolean;skills:{name:string;slug:string}[]};
type Rec={id:string;title:string;problem:string;why_this_matches:string;difficulty:string;suggested_stack:string[];skills_to_practice:string[];skills_to_learn:string[];expected_deliverables:string[];evidence_opportunities:string[]};
type Result={recommendations:Rec[];generated_by:'ai'|'local-demo';notice:string};

export default function Discover(){
  const [me,setMe]=useState<Me|null>(null);
  const [result,setResult]=useState<Result|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [interests,setInterests]=useState('');
  const [desired,setDesired]=useState('');
  const [difficulty,setDifficulty]=useState('');
  const [time,setTime]=useState('moderate');

  useEffect(()=>{
    api('/me').then((x:Me)=>{setMe(x);setInterests(x.interests||'')}).catch(e=>setError(e.message))
  },[]);

  async function generate(){
    setLoading(true);
    setError('');
    try{
      setResult(await api('/project-ideas/recommend',{
        method:'POST',
        body:JSON.stringify({
          interests,
          desired_skills:desired.split(',').map(x=>x.trim()).filter(Boolean),
          preferred_difficulty:difficulty||null,
          time_commitment:time
        })
      }))
    }catch(e){
      setError(e instanceof Error?e.message:'Could not generate recommendations');
    }finally{
      setLoading(false);
    }
  }

  if(!me&&!error)return <main className="shell formPage"><p>Loading your profile…</p></main>;

  return (
    <main className="shell formPage">
      <PageBack href="/dashboard" label="Back to Dashboard" />
      <span className="tag">A0 · Project Discovery</span>
      <h1>Find something worth building.</h1>
      <p className="lead">We use your saved profile plus a few optional preferences to recommend a small set of realistic projects. The goal is learning + real evidence, not an endless idea feed.</p>
      
      {me&&!me.onboarding_completed&&(
        <div className="notice">Complete onboarding first. <a href="/onboarding">Go to onboarding →</a></div>
      )}

      {me?.onboarding_completed&&(
        <div className="formCard">
          <div className="profileSummary">
            <strong>{me.target_role||'Target role not set'}</strong>
            <span>{me.experience_level||'Experience not set'} · {me.skills.map(s=>s.name).join(', ')||'No skills selected'}</span>
          </div>
          <label>Interests<input value={interests} onChange={e=>setInterests(e.target.value)} placeholder="AI, education, developer tools…"/></label>
          <label>Skills you want to learn<input value={desired} onChange={e=>setDesired(e.target.value)} placeholder="FastAPI, React, machine learning (comma separated)"/></label>
          <label>Preferred difficulty
            <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
              <option value="">Recommend for my level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="challenging">Challenging</option>
            </select>
          </label>
          <label>Time commitment
            <select value={time} onChange={e=>setTime(e.target.value)}>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="intensive">Intensive</option>
            </select>
          </label>
          <button className="btn primary" onClick={generate} disabled={loading}>
            {loading?'Finding projects…':result?'Recommend another set':'Find projects for me'}
          </button>
        </div>
      )}

      {error&&<p className="error">{error}</p>}

      {result&&(
        <section className="results">
          <div className="resultHead">
            <div>
              <h2>Your project recommendations</h2>
              <p>{result.notice}</p>
            </div>
            <span className="tag">{result.generated_by==='ai'?'AI generated':'Local demo engine'}</span>
          </div>
          <div className="recommendations">
            {result.recommendations.map(r=>(
              <article className="recommendation" key={r.id}>
                <div className="recTop">
                  <span className="tag">{r.difficulty}</span>
                  <h2>{r.title}</h2>
                </div>
                <p>{r.problem}</p>
                <p className="match"><strong>Why this matches:</strong> {r.why_this_matches}</p>
                <div className="recGrid">
                  <div><h3>Suggested stack</h3><p>{r.suggested_stack.join(' · ')}</p></div>
                  <div><h3>Practice</h3><p>{r.skills_to_practice.join(' · ')}</p></div>
                  <div><h3>Learn</h3><p>{r.skills_to_learn.join(' · ')}</p></div>
                </div>
                <h3>Expected deliverables</h3>
                <ul>{r.expected_deliverables.map(x=><li key={x}>{x}</li>)}</ul>
                <h3>Evidence you could produce</h3>
                <ul>{r.evidence_opportunities.map(x=><li key={x}>{x}</li>)}</ul>
                <div className="actions left">
                  <a className="btn primary" href={`/projects/new?recommendation=${encodeURIComponent(r.title)}`}>Choose this project</a>
                  <button className="btn secondary" type="button" onClick={()=>setDesired(r.skills_to_learn.join(', '))}>Customize direction</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <p className="note">Recommendations are guidance, not employment or market-demand claims.</p>
    </main>
  );
}
