import {json,fail,body,authFail} from '../../../_shared.js';
const statuses=['New','Confirmed','Dispatched','Delivered','Cancelled'];
export async function onRequestPatch({request,env,params}){const a=await authFail(request,env);if(a)return a;const d=await body(request);if(!d||!statuses.includes(d.status))return fail('Invalid order status.');try{const r=await env.DB.prepare('UPDATE orders SET status=? WHERE id=?').bind(d.status,params.id).run();if(!r.meta.changes)return fail('Order not found.',404);return json({ok:true})}catch{return fail('Could not update order.',500)}}
