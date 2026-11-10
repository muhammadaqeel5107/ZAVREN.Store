import {json,fail} from '../_shared.js';
const defaults={bankName:'Faisal Bank',accountTitle:'MUHAMMAD AQEEL',accountNo:'3618701000003100',iban:'PK28FAYS3618701000003100'};
export async function onRequestGet({env}){
  try{const {results=[]}=await env.DB.prepare('SELECT key,value FROM store_settings WHERE key IN (?,?,?,?)').bind('bankName','accountTitle','accountNo','iban').all();const settings={...defaults};for(const row of results)settings[row.key]=row.value;return json({settings});}
  catch{return json({settings:defaults});}
}
