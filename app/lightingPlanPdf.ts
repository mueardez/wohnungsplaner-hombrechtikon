import {jsPDF} from 'jspdf';
import {rooms,walls,openings,bounds,wallPolygon,doorSector,type Point} from './plan/geometry.ts';

// Independent vector export: never hides, deletes or changes saved inventory.
export function lightingLayout(width:number,height:number){
  return ([{orientation:'portrait' as const,w:210,h:297},{orientation:'landscape' as const,w:297,h:210}])
    .map(p=>({...p,scale:Math.min((p.w-24)/width,(p.h-60)/height)}))
    .sort((a,b)=>b.scale-a.scale)[0];
}
export function createLightingPlanPdf(){
  const apartmentWalls=walls.filter(w=>w.a[0]<17&&w.b[0]<17);
  const b=bounds(apartmentWalls.flatMap(wallPolygon));
  const layout=lightingLayout(b.maxX-b.minX,b.maxY-b.minY);
  const {w,h,scale}=layout;
  const doc=new jsPDF({orientation:layout.orientation,unit:'mm',format:'a4'});
  const ox=(w-(b.maxX-b.minX)*scale)/2,oy=32;
  const pt=([x,y]:Point):Point=>[ox+(x-b.minX)*scale,oy+(y-b.minY)*scale];
  const line=(a:Point,b:Point)=>doc.line(...pt(a),...pt(b));
  doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text('Leuchtenplan',12,16);
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(90);
  doc.text('Wohnung ohne Möblierung - Platz für eure Deckenleuchten',12,23);
  doc.setFillColor(55,55,55);doc.setDrawColor(55);
  for(const wall of apartmentWalls){
    const p=wallPolygon(wall).map(pt);
    doc.lines(p.slice(1).map((v,i)=>[v[0]-p[i][0],v[1]-p[i][1]]),p[0][0],p[0][1],[1,1],'F',true);
  }
  doc.setLineWidth(.18);doc.setDrawColor(110);
  for(const o of openings){
    if(o.kind==='door'){
      const arc=doorSector(o);for(let i=2;i<arc.length;i++)line(arc[i-1],arc[i]);
      line(o.a,arc[arc.length-1]);
    }else{
      const dx=o.b[0]-o.a[0],dy=o.b[1]-o.a[1],len=Math.hypot(dx,dy);
      for(const offset of[-.05,.05]){
        const nx=-dy/len*offset,ny=dx/len*offset;
        line([o.a[0]+nx,o.a[1]+ny],[o.b[0]+nx,o.b[1]+ny]);
      }
      for(const p of[o.a,o.b])line([p[0]-dy/len*.10,p[1]+dx/len*.10],[p[0]+dy/len*.10,p[1]-dx/len*.10]);
    }
  }
  // Small edge labels keep the room centres free for handwritten symbols.
  doc.setTextColor(95);
  for(const r of rooms.filter(r=>r.id!=='keller'&&(!r.zone||r.id==='kueche'))){
    const rb=bounds(r.poly);
    let anchor:Point=[(rb.minX+rb.maxX)/2,rb.minY+.5];
    if(r.id==='entree')anchor=[4.8,4.35];
    if(r.id==='noa')anchor=[10.2,13.48];
    if(r.id==='gang')anchor=[10.15,11.48];
    if(r.id==='kueche')anchor=[6.5,8.0];
    if(r.id==='wohnen')anchor=[2.4,8.0];
    const [x,y]=pt(anchor);
    doc.setFontSize(7);doc.text(r.name,x,y,{align:'center'});
    if(r.measured){doc.setFontSize(r.id==='wc'?5:6);doc.text(r.measured,x,y+3,{align:'center'});}
  }
  const bottom=oy+(b.maxY-b.minY)*scale;
  const sy=bottom+10;
  doc.setDrawColor(50);doc.setLineWidth(.25);
  doc.line(12,sy,12+2*scale,sy);
  for(let i=0;i<=2;i++)doc.line(12+i*scale,sy-1,12+i*scale,sy+1);
  doc.setFontSize(7);doc.text('0',12,sy+4);doc.text('2 m',12+2*scale,sy+4,{align:'right'});
  doc.text(`Massstab ca. 1:${Math.round(1000/scale)} bei Druck in Originalgrösse (100%).`,12,sy+10);
  doc.setDrawColor(210);doc.line(12,h-29,w-12,h-29);
  doc.setFontSize(8);doc.text('Notizen / Legende:',12,h-23);
  doc.setFontSize(7);doc.text('Planungsskizze nach V2-Grundriss. Masse vor Ort prüfen. Keller separat, hier nicht dargestellt.',12,h-10);
  doc.setProperties({title:'Leuchtenplan - Wohnung ohne Möbel',subject:'Handschriftliche Planung der Deckenleuchten'});
  return doc;
}
export function downloadLightingPlanPdf(){createLightingPlanPdf().save('Leuchtenplan-Wohnung.pdf');}
