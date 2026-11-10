import {json,fail,body,authFail} from '../../_shared.js';
const allowed={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
export async function onRequestPost({request,env}){
 const a=await authFail(request,env);if(a)return a;const d=await body(request);if(!d||!allowed[d.type]||typeof d.data!=='string')return fail('Only JPG, PNG or WEBP images are allowed.');
 const raw=d.data.replace(/^data:[^,]+,/,'');if(raw.length>Math.ceil(4*1024*1024*4/3)+100)return fail('Image must be smaller than 4 MB.');
 let bytes;try{bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0))}catch{return fail('Invalid image data.')};if(bytes.length>4*1024*1024)return fail('Image must be smaller than 4 MB.');
 const key=`products/${crypto.randomUUID()}.${allowed[d.type]}`;try{await env.IMAGES.put(key,bytes,{httpMetadata:{contentType:d.type,cacheControl:'public, max-age=31536000, immutable'}});return json({url:'/media/'+key})}catch{return fail('Image storage is not configured or upload failed.',500)}
}
