const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
export async function api(path:string, init:RequestInit={}){
  const headers = new Headers(init.headers);
  headers.set('Content-Type','application/json');
  const res=await fetch(`${API}${path}`,{...init,headers,cache:'no-store',credentials:'include'});
  if(!res.ok) throw new Error((await res.json().catch(()=>({detail:'Request failed'}))).detail ?? 'Request failed');
  return res.json();
}
