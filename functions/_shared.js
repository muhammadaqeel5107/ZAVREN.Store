const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {status, headers:{'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', ...headers}});
const fail = (error, status=400) => json({error}, status);
const now = () => new Date().toISOString();
const enc = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const dec = s => Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0));
async function sign(value, secret){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return enc(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)));}
export async function makeSession(env){const payload=enc(new TextEncoder().encode(JSON.stringify({admin:true,exp:Date.now()+8*60*60*1000})));return payload+'.'+await sign(payload,env.SESSION_SECRET);}
export async function isAdmin(request,env){try{const cookie=request.headers.get('Cookie')||'';const token=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('zavren_admin='))?.slice(13);if(!token)return false;const [payload,sig]=token.split('.');if(!payload||!sig||!env.SESSION_SECRET)return false;if(await sign(payload,env.SESSION_SECRET)!==sig)return false;const data=JSON.parse(new TextDecoder().decode(dec(payload)));return data.admin===true&&data.exp>Date.now();}catch{return false}}
export const authFail = async (request,env) => await isAdmin(request,env) ? null : fail('Admin login required.',401);
export async function body(request){try{return await request.json()}catch{return null}}
export function cookie(token){return `zavren_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`}
export function clearCookie(){return 'zavren_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'}
export {json,fail,now};
