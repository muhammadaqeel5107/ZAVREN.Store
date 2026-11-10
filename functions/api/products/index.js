import {json,fail} from '../../_shared.js';
export async function onRequestGet({env}){
  try { const {results=[]}=await env.DB.prepare('SELECT id,name,price,image,sizes,description,active FROM products WHERE active=1 ORDER BY created_at DESC').all();
    return new Response(JSON.stringify({products:results.map(p=>({...p,sizes:JSON.parse(p.sizes||'[]'),active:!!p.active}))}),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=60'}});
  } catch(e){return fail('Products are temporarily unavailable.',500)}
}
