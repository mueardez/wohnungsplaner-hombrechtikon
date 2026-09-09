"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type Furniture={id:number;name:string;x:number;y:number;w:number;d:number;h:number;rot:number;color:string};
export type Area={name:string;poly:[number,number][];color:string};
export type Wall=[[number,number],[number,number]];

type Props={areas:Area[];walls:Wall[];items:Furniture[];focus:string;top:boolean;selected:number|null;onSelect:(id:number|null)=>void;onMove:(id:number,x:number,y:number)=>void};

export default function ModelViewer({areas,walls,items,focus,top,selected,onSelect,onMove}:Props){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=host.current;if(!el)return;const scene=new THREE.Scene();scene.background=new THREE.Color(0xf3efe6);
  const camera=new THREE.PerspectiveCamera(36,el.clientWidth/el.clientHeight,.05,100);const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(el.clientWidth,el.clientHeight);renderer.shadowMap.enabled=true;el.replaceChildren(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff,0xb9aa91,2.2));const sun=new THREE.DirectionalLight(0xffffff,2.4);sun.position.set(-8,16,10);sun.castShadow=true;scene.add(sun);
  const root=new THREE.Group();scene.add(root);const mat=(c:string)=>new THREE.MeshStandardMaterial({color:c,roughness:.82});
  areas.forEach(a=>{const sh=new THREE.Shape();a.poly.forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),mat(a.color));m.rotation.x=-Math.PI/2;m.position.y=.01;m.receiveShadow=true;m.userData.area=a.name;if(focus!=="Gesamtwohnung"&&a.name!==focus)(m.material as THREE.MeshStandardMaterial).transparent=true,(m.material as THREE.MeshStandardMaterial).opacity=.17;root.add(m)});
  areas.forEach(a=>{if(!a.name||(!top&&a.name!==focus))return;const xs=a.poly.map(p=>p[0]),ys=a.poly.map(p=>p[1]),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2,cv=document.createElement("canvas");cv.width=320;cv.height=82;const g=cv.getContext("2d")!;g.fillStyle="rgba(247,244,237,.88)";g.fillRect(0,0,320,82);g.fillStyle="#292722";g.textAlign="center";g.font="600 21px Arial";g.fillText(a.name,160,31);g.font="17px Arial";g.fillText(`${(Math.max(...xs)-Math.min(...xs)).toFixed(2).replace(".",",")} × ${(Math.max(...ys)-Math.min(...ys)).toFixed(2).replace(".",",")} m`,160,59);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false}));sprite.position.set(cx,.12,-cy);sprite.scale.set(2.25,.58,1);sprite.renderOrder=10;root.add(sprite)});
  const wallMat=mat("#eee9df");const wall=([[x1,y1],[x2,y2]]:Wall)=>{const len=Math.hypot(x2-x1,y2-y1),m=new THREE.Mesh(new THREE.BoxGeometry(len,2.39,.14),wallMat);m.position.set((x1+x2)/2,1.195,-(y1+y2)/2);m.rotation.y=Math.atan2(y2-y1,x2-x1);m.castShadow=m.receiveShadow=true;root.add(m)};
  walls.forEach(w=>{const [[x1,y1],[x2,y2]]=w;if(x1===0&&x2===0&&y1===0&&y2===15.56)return;if(y1===0&&y2===0&&((x1===0&&x2===7.9)||(x1===8.15&&x2===16.05)))return;wall(w)});
  // Fassadenstücke zwischen den bodentiefen Terrassentüren.
  [[[0,0],[0,.9]],[[0,2.1],[0,4.9]],[[0,6.1],[0,8.55]],[[0,9.55],[0,11.95]],[[0,12.95],[0,13.75]],[[0,14.75],[0,15.56]],[[0,0],[.4,0]],[[2.3,0],[3.2,0]],[[6.2,0],[7.9,0]],[[8.15,0],[8.52,0]],[[10.38,0],[13.12,0]],[[14.98,0],[16.05,0]]].forEach(w=>wall(w as Wall));
  const box=(name:string,x:number,y:number,w:number,d:number,h:number,color="#ece8df",ry=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,h/2,-y);m.rotation.y=ry;m.castShadow=m.receiveShadow=true;m.userData.fixture=name;root.add(m);return m};
  const cyl=(name:string,x:number,y:number,r:number,h:number,color="#f7f5ef")=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,28),mat(color));m.position.set(x,h/2,-y);m.userData.fixture=name;root.add(m);return m};
  const glass=new THREE.MeshStandardMaterial({color:0xaecbd0,transparent:true,opacity:.42,roughness:.18,metalness:.05});
  const frameMat=mat("#77736b"),doorMat=mat("#a78d6d");
  const windowX=(x:number,y:number,w:number,sill=.72,h=1.28)=>{const p=new THREE.Mesh(new THREE.BoxGeometry(w,h,.035),glass);p.position.set(x,sill+h/2,-y);root.add(p);[[x-w/2,sill+h/2,.045,h],[x+w/2,sill+h/2,.045,h],[x,sill,w,.045],[x,sill+h,w,.045]].forEach(([px,py,pw,ph])=>{const f=new THREE.Mesh(new THREE.BoxGeometry(pw,ph,.07),frameMat);f.position.set(px,py,-y);root.add(f)})};
  const windowY=(x:number,y:number,w:number,sill=.72,h=1.28)=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.035,h,w),glass);p.position.set(x,sill+h/2,-y);root.add(p);[[y-w/2,sill+h/2,.045,h],[y+w/2,sill+h/2,.045,h],[y,sill,w,.045],[y,sill+h,w,.045]].forEach(([pz,py,pw,ph],i)=>{const f=new THREE.Mesh(new THREE.BoxGeometry(.07,ph,i<2?.045:pw),frameMat);f.position.set(x,py,-pz);root.add(f)})};
  const door=(name:string,x:number,y:number,w=.86,rot=0)=>{const g=new THREE.Group(),leaf=new THREE.Mesh(new THREE.BoxGeometry(w,2.02,.045),doorMat);leaf.position.set(w/2,1.01,0);g.add(leaf);const handle=cyl("Türgriff",0,0,.035,.09,"#3c3934");root.remove(handle);handle.rotation.z=Math.PI/2;handle.position.set(w*.82,1.02,.07);g.add(handle);g.position.set(x,0,-y);g.rotation.y=rot;g.userData.fixture=name;root.add(g)};
  // Fenster und Fenstertüren gemäss den im Plan erkennbaren Fassadenfeldern.
  windowX(1.35,0,1.85,.08,2.16);windowX(4.7,0,3,.08,2.16);windowX(9.45,0,1.86,.08,2.16);windowX(14.05,0,1.86,.08,2.16);
  windowY(0,1.5,1.2,.08,2.16);windowY(0,5.5,1.2,.08,2.16);windowY(0,9.05,1,.08,2.16);windowY(0,12.45,1,.08,2.16);windowY(0,14.25,1,.08,2.16);
  // Türblätter zeigen die Öffnungsrichtung; Durchgänge und Nischen bleiben möblierbar.
  door("Tür Kind 2",3.51,9.05,.86,-Math.PI/2);door("Tür Kind 1",3.51,12.45,.86,-Math.PI/2);door("Tür Bad",4.05,11.2,.75,0);door("Tür WC",6.12,11.2,.73,0);door("Tür Reduit",4.62,8.55,.86,Math.PI/2);door("Tür Büro",8.15,3.05,.88,0);door("Tür Eltern",12.37,4.12,.88,Math.PI/2);door("Tür Dusche",14.67,5.15,.73,Math.PI/2);
  // Bad und WC: Badewanne, Lavabos und Toiletten bleiben feste, nicht nutzbare Einbauten.
  box("Badewanne",4.12,12.87,.72,1.7,.58);box("Badewannenrand",4.12,12.87,.55,1.5,.64,"#cfdad7");
  box("Lavabo Bad",5.42,11.62,.58,.48,.82);cyl("Waschbecken Bad",5.42,11.62,.21,.12,"#ffffff");
  box("WC",6.48,12.72,.42,.68,.42);cyl("WC-Schüssel",6.48,12.45,.28,.42);box("WC-Spülkasten",6.48,13.05,.45,.2,.72);
  box("Lavabo WC",7.46,11.62,.48,.4,.78);cyl("Waschbecken WC",7.46,11.62,.18,.1,"#ffffff");
  // Dusche mit Duschtasse, Glaswand und Lavabo.
  box("Duschtasse",13.17,5.92,1.45,.9,.08,"#dfe7e5");box("Duschwand",12.47,5.92,.04,.9,1.9,"#b8d4d8");box("Lavabo Dusche",14.22,5.35,.65,.46,.82);cyl("Waschbecken Dusche",14.22,5.35,.2,.1,"#ffffff");
  // Küche: Hochschrank, Unterschränke, Arbeitsplatte, Spüle, Kochfeld und Insel.
  box("Küchenzeile",7.55,6.25,.6,2.7,.88,"#c7b493");box("Arbeitsplatte",7.55,6.25,.66,2.74,.05,"#55514a").position.y=.91;
  box("Hochschrank",7.55,7.55,.6,.58,2.1,"#b7a485");box("Kücheninsel",5.55,6.2,1.65,.82,.88,"#c7b493");box("Inselplatte",5.55,6.2,1.72,.88,.05,"#55514a").position.y=.91;
  const sink=box("Spüle",7.55,5.72,.46,.58,.035,"#aab3b2");sink.position.y=.95;for(let i=-1;i<=1;i++)cyl("Kochfeld",5.55+i*.32,6.2,.12,.025,"#191919").position.y=.95;
  items.forEach(f=>{const g=new THREE.Group(),m=new THREE.Mesh(new THREE.BoxGeometry(f.w,f.h,f.d),mat(f.color));m.position.y=f.h/2;m.castShadow=true;g.add(m);g.position.set(f.x,0,-f.y);g.rotation.y=-f.rot;g.userData.furnitureId=f.id;if(f.id===selected){const outline=new THREE.BoxHelper(m,0xdbe765);g.add(outline)}root.add(g)});
  const active=focus==="Gesamtwohnung"?undefined:areas.find(a=>a.name===focus),xs=active?.poly.map(p=>p[0]),ys=active?.poly.map(p=>p[1]),cx=xs?(Math.min(...xs)+Math.max(...xs))/2:8.1,cy=ys?(Math.min(...ys)+Math.max(...ys))/2:7.7,span=xs&&ys?Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)):16;
  const distance=span*(camera.aspect<1?1.35:.82);if(top)camera.position.set(cx,Math.max(11,span*1.45),-cy+.01);else camera.position.set(cx+distance*.72,Math.max(7,span*.9),-cy+distance*.72);camera.lookAt(cx,0,-cy);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(cx,0,-cy);controls.enableDamping=true;if(top){controls.enableRotate=false;camera.up.set(0,0,-1);camera.lookAt(cx,0,-cy)}
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);let dragging:number|null=null;
  const hit=(e:PointerEvent)=>{const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray};
  const down=(e:PointerEvent)=>{const hits=hit(e).intersectObjects(root.children,true);const obj=hits.find(h=>{let o:THREE.Object3D|null=h.object;while(o&&!o.userData.furnitureId)o=o.parent;return !!o?.userData.furnitureId});if(!obj){onSelect(null);return}let o:THREE.Object3D|null=obj.object;while(o&&!o.userData.furnitureId)o=o.parent;dragging=o!.userData.furnitureId;onSelect(dragging);controls.enabled=false;renderer.domElement.setPointerCapture(e.pointerId)};
  const move=(e:PointerEvent)=>{if(dragging==null)return;const p=new THREE.Vector3();if(hit(e).ray.intersectPlane(plane,p))onMove(dragging,Math.max(.2,Math.min(15.85,p.x)),Math.max(.2,Math.min(15.36,-p.z)))};const up=()=>{dragging=null;controls.enabled=true};renderer.domElement.addEventListener("pointerdown",down);renderer.domElement.addEventListener("pointermove",move);renderer.domElement.addEventListener("pointerup",up);
  let frame=0;const animate=()=>{controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(animate)};animate();const resize=()=>{camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)};addEventListener("resize",resize);
  return()=>{cancelAnimationFrame(frame);removeEventListener("resize",resize);renderer.dispose();controls.dispose()};
 },[areas,walls,items,focus,top,selected,onSelect,onMove]);return <div className="modelViewer" ref={host}/>;
}
