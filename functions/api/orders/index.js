import {json,fail,body,now} from '../../_shared.js';
const clean=(v,n=300)=>String(v??'').trim().slice(0,n);
export async function onRequestPost({request,env}){
  const data=await body(request); if(!data||!data.customer||!Array.isArray(data.items)||!data.items.length||data.items.length>30)return fail('Invalid order details.');
  const c={name:clean(data.customer.name,100),phone:clean(data.customer.phone,30),email:clean(data.customer.email,150),city:clean(data.customer.city,80),address:clean(data.customer.address,500),notes:clean(data.customer.notes,500),paymentMethod:clean(data.customer.paymentMethod,30)||'Cash on Delivery',paymentReference:clean(data.customer.paymentReference,100)};
  if(!['Cash on Delivery','Bank Transfer'].includes(c.paymentMethod))return fail('Please choose a valid payment method.');
  if(!c.name||!c.phone||!c.city||!c.address)return fail('Please complete all required delivery details.');
  if(!/^[0-9+()\- ]{10,18}$/.test(c.phone))return fail('Please enter a valid phone number.');
  const orderItems=[];let total=0;
  for(const item of data.items){
    const id=clean(item.id,80),size=clean(item.size,8),qty=Math.max(1,Math.min(20,Number.parseInt(item.qty,10)||0));
    if(!id||!size||!qty)return fail('Invalid item in your bag. Please refresh and try again.');
    const p=await env.DB.prepare('SELECT id,name,price,sizes,active FROM products WHERE id=?').bind(id).first();
    if(!p||!p.active)return fail('A product in your bag is no longer available. Refresh the store.');
    const sizes=JSON.parse(p.sizes||'[]');if(!sizes.includes(size))return fail(`Size ${size} is not available for ${p.name}.`);
    const price=Number(p.price);total+=price*qty;orderItems.push({id:p.id,name:p.name,price,size,qty});
  }
  const id='ZV-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+crypto.randomUUID().slice(0,6).toUpperCase();
  const createdAt=now();
  try{await env.DB.prepare('INSERT INTO orders (id,customer,items,total,status,created_at) VALUES (?,?,?,?,?,?)').bind(id,JSON.stringify(c),JSON.stringify(orderItems),total,'New',createdAt).run();}
  catch(e){return fail('We could not save your order. Please try again.',500)}
  return json({order:{id,total,status:'New',createdAt,paymentMethod:c.paymentMethod}},201);
}
