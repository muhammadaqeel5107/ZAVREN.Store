import {json,fail,body,makeSession,cookie} from '../../_shared.js';
export async function onRequestPost({request,env}){
 const d=await body(request);if(!d)return fail('Invalid login details.');
 const u=String(d.username||'');const p=String(d.password||'');
 if(!env.ADMIN_USERNAME||!env.ADMIN_PASSWORD||!env.SESSION_SECRET)return fail('Admin environment variables are not configured.',503);
 if(u!==env.ADMIN_USERNAME||p!==env.ADMIN_PASSWORD)return fail('Incorrect username or password.',401);
 const token=await makeSession(env);return json({ok:true},200,{'set-cookie':cookie(token)});
}
