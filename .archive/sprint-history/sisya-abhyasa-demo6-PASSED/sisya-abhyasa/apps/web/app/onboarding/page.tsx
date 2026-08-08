'use client';
import {FormEvent,useEffect,useState} from 'react';
import {api} from '../../lib/api';
type Skill={id:string;name:string;slug:string};
export default function Onboarding(){
 const [skills,setSkills]=useState<Skill[]>([]); const [selected,setSelected]=useState<string[]>([]); const [msg,setMsg]=useState('');
 useEffect(()=>{api('/skills').then(setSkills).catch(()=>setMsg('Start the API and database to load skills.'))},[]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setMsg('Saving…');const f=new FormData(e.currentTarget);
  try{await api('/me',{method:'PATCH',body:JSON.stringify({full_name:f.get('full_name'),education_year:f.get('education_year'),target_role:f.get('target_role'),experience_level:f.get('experience_level'),interests:f.get('interests'),skill_slugs:selected,onboarding_completed:true})});location.href='/dashboard'}catch(err){setMsg(err instanceof Error?err.message:'Could not save profile')}}
 return <main className="shell formPage"><span className="tag">Student onboarding</span><h1>Tell us where you are starting.</h1><p className="lead">Only the information needed to personalize projects and learning. Your profile stays private by default.</p><form className="formCard" onSubmit={submit}>
  <label>Name<input name="full_name" required maxLength={120}/></label><label>Education year<select name="education_year" required defaultValue=""><option value="" disabled>Select year</option>{['1st year','2nd year','3rd year','4th year'].map(x=><option key={x}>{x}</option>)}</select></label>
  <label>Target role<input name="target_role" placeholder="e.g. Backend Developer" required/></label><label>Experience level<select name="experience_level" required defaultValue="beginner"><option>beginner</option><option>intermediate</option></select></label>
  <label>Interests<input name="interests" placeholder="AI, web, education, climate…"/></label><fieldset><legend>Current skills</legend><div className="chips">{skills.map(s=><button type="button" className={selected.includes(s.slug)?'chip active':'chip'} key={s.slug} onClick={()=>setSelected(v=>v.includes(s.slug)?v.filter(x=>x!==s.slug):[...v,s.slug])}>{s.name}</button>)}</div></fieldset>
  <button className="btn primary" type="submit">Complete onboarding</button>{msg&&<p className="status">{msg}</p>}</form></main>}
