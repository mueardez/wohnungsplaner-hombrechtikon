import {useCallback,useEffect,useRef,useState} from "react";
import type {PlanItem} from "./geometry";
export const PLAN_KEY="hombrechtikon-v2-plan";
type Snapshot={items:PlanItem[]};
export function usePlan(){
 const [items,setItems]=useState<PlanItem[]>([]),[ready,setReady]=useState(false),[history,setHistory]=useState({canUndo:false,canRedo:false}),[storageError,setStorageError]=useState("");
 const current=useRef(items),past=useRef<Snapshot[]>([]),future=useRef<Snapshot[]>([]),before=useRef<PlanItem[]|null>(null);
 const assign=useCallback((next:PlanItem[])=>{current.current=next;setItems(next)},[]);
 const refresh=useCallback(()=>setHistory({canUndo:past.current.length>0,canRedo:future.current.length>0}),[]);
 const change=useCallback((next:PlanItem[])=>{if(JSON.stringify(next)===JSON.stringify(current.current))return;past.current=[...past.current.slice(-49),{items:current.current}];future.current=[];assign(next);refresh()},[assign,refresh]);
 const begin=useCallback(()=>{if(!before.current)before.current=current.current},[]);
 const preview=useCallback((item:PlanItem)=>{assign(current.current.map(f=>f.id===item.id?item:f))},[assign]);
 const end=useCallback(()=>{if(before.current&&JSON.stringify(before.current)!==JSON.stringify(current.current)){past.current=[...past.current.slice(-49),{items:before.current}];future.current=[];refresh()}before.current=null},[refresh]);
 const undo=useCallback(()=>{const snapshot=past.current.pop();if(!snapshot)return;future.current.push({items:current.current});assign(snapshot.items);refresh()},[assign,refresh]);
 const redo=useCallback(()=>{const snapshot=future.current.pop();if(!snapshot)return;past.current.push({items:current.current});assign(snapshot.items);refresh()},[assign,refresh]);
 useEffect(()=>{let alive=true;queueMicrotask(()=>{if(!alive)return;try{const raw=JSON.parse(localStorage.getItem(PLAN_KEY)||"[]");if(!Array.isArray(raw)||raw.some(f=>typeof f.id!=="string"||typeof f.inventoryId!=="string"||typeof f.name!=="string"||typeof f.room!=="string"||typeof f.color!=="string"||!["box","table","chair","sofa","bed","shelf"].includes(f.kind)||![f.x,f.y,f.w,f.d,f.h,f.rot].every(Number.isFinite)||f.w<=0||f.d<=0||f.h<=0))throw Error("invalid");assign(raw)}catch{setStorageError("Der gespeicherte Testplan konnte nicht gelesen werden. Er wurde nicht überschrieben.");return}setReady(true)});return()=>{alive=false}},[assign]);
 useEffect(()=>{if(!ready)return;const id=setTimeout(()=>{try{localStorage.setItem(PLAN_KEY,JSON.stringify(items));setStorageError("")}catch{setStorageError("Testplan konnte nicht gespeichert werden. Bitte Browser-Speicher prüfen.")}},300);return()=>clearTimeout(id)},[items,ready]);
 return{items,current,change,begin,preview,end,undo,redo,...history,storageError,ready};
}
