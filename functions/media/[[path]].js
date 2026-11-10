export async function onRequestGet({env,params}){
 const key=Array.isArray(params.path)?params.path.join('/'):String(params.path||'');
 if(!key.startsWith('products/')||key.includes('..'))return new Response('Not found',{status:404});
 const obj=await env.IMAGES.get(key);if(!obj)return new Response('Not found',{status:404});
 const headers=new Headers();obj.writeHttpMetadata(headers);headers.set('etag',obj.httpEtag);headers.set('cache-control','public, max-age=31536000, immutable');return new Response(obj.body,{headers});
}
