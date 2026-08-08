const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
const DEV_SUBJECT = 'local-student-1';
export async function api(path:string, init:RequestInit={}){
  const headers = new Headers(init.headers);
  headers.set('Content-Type','application/json');
  if(process.env.NODE_ENV !== 'production') headers.set('X-Dev-Auth-Subject',DEV_SUBJECT);
  const res=await fetch(`${API}${path}`,{...init,headers,cache:'no-store'});
  if(!res.ok) throw new Error((await res.json().catch(()=>({detail:'Request failed'}))).detail ?? 'Request failed');
  return res.json();
}
