import {useEffect,useState} from 'react';
import {watchPurchaseFlags} from './cloud';
import {PURCHASE_COLOR} from './purchaseStyle';
export function usePurchases() {
  const [flags,setFlags]=useState<Record<string,boolean>>({});
  const [error,setError]=useState(false);
  useEffect(()=>watchPurchaseFlags(value=>{setFlags(value);setError(false)},()=>setError(true)),[]);
  return {flags,error};
}
export function PurchaseLegend({error=false}:{error?:boolean}) {
  return <p style={{fontSize:12,margin:'10px 16px'}}><span aria-hidden="true" style={{display:'inline-block',width:12,height:12,background:PURCHASE_COLOR,marginRight:6}}/>Violett: Neubeschaffung · nicht im Umzugs-PDF{error&&<span role="status"> · Kennzeichnung konnte nicht aktualisiert werden. Bitte neu laden.</span>}</p>;
}
