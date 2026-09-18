import { jsPDF } from 'jspdf';
import type { InventoryItem } from './InventoryPanel';
import type { Apartment, MoveDetails } from './moveTypes';

export function createInventoryPdf(items: InventoryItem[], roomNames: string[], details: MoveDetails): jsPDF {
  items=items.filter(item=>item.isNewPurchase!==true);
  const doc=new jsPDF({unit:'mm',format:'a4'}),margin=16,width=178,bottom=278;
  let y=18;
  const font=(size:number,bold=false,color=40)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(color);};
  const footer=()=>{font(8,false,110);doc.text(`Umzugsinventar · Seite ${doc.getNumberOfPages()}`,margin,288);};
  const page=()=>{footer();doc.addPage();y=18;};
  const heading=(text:string)=>{doc.setFillColor(219,231,101);doc.rect(0,0,210,7,'F');font(20,true);const lines=doc.splitTextToSize(text,width) as string[];for(const line of lines){if(y+9>bottom)page();font(20,true);doc.text(line,margin,y);y+=9;}y+=3;};
  const text=(value:string,x=margin,maxWidth=width,size=10,bold=false)=>{
    font(size,bold);const lines=doc.splitTextToSize(value||'-',maxWidth) as string[];
    for(const line of lines){if(y+5>bottom)page();font(size,bold);doc.text(line,x,y);y+=5;}
  };
  const image=(value:string,x:number,top:number,w:number,h:number)=>{
    const p=doc.getImageProperties(value),scale=Math.min(w/p.width,h/p.height),iw=p.width*scale,ih=p.height*scale;
    doc.addImage(value,'JPEG',x+(w-iw)/2,top+(h-ih)/2,iw,ih,undefined,'FAST');
  };
  const address=(value:string)=>value.trim().replace(/\s+/g,' ')||'-';
  heading(`Umzug - ${address(details.oldHome.address)} > ${address(details.newHome.address)}`);
  text(`Erstellt am ${new Date().toLocaleDateString('de-CH')}`,margin,width,9);
  y+=4;text(`Familie: ${details.persons??'-'} Personen`,margin,width,12,true);
  text(`${items.length} Inventarpositionen · ${items.reduce((sum,item)=>sum+item.quantity,0)} Stück`);
  y+=9;
  const home=(title:string,home:Apartment)=>{
    font(16,true);doc.text(title,margin,y);y+=10;
    const fields:[string,string][]=[['Adresse',home.address],['Etage',home.floor],['Anzahl Räume',home.rooms],['Quadratmeter',home.area===undefined?'-':`${home.area.toLocaleString('de-CH')} m²`],['Treppenhaus',home.staircase],['Lift vorhanden',home.elevator?'Ja':'Nein'],['Parkplatzsituation',home.parking]];
    for(const [label,value] of fields){if(y+12>bottom)page();text(label,margin,width,9,true);text(value.trim()||'-');y+=3;}
  };
  const homePhotos=(title:string,home:Apartment)=>{
    const photos=home.photos.map((value,index)=>({value,index})).filter(p=>p.value);
    if(!photos.length)return;
    page();heading(`Fotos - ${title}`);
    const start=y;
    photos.forEach(({value,index},i)=>{
      const top=start+i*82;
      font(9);const caption=(home.photoDescriptions?.[index]??'').slice(0,255).trim().replace(/\s+/g,' ');
      const lines=caption?doc.splitTextToSize(caption,width) as string[]:[];
      const imageHeight=72-lines.length*4;
      font(9,true);doc.text(`Bild ${index+1}`,margin,top);
      image(value,margin,top+3,width,imageHeight);
      font(9);lines.forEach((line,j)=>doc.text(line,margin,top+imageHeight+8+j*4));
    });
    y=start+photos.length*82;
  };
  home('Alte Wohnung',details.oldHome);homePhotos('Alte Wohnung',details.oldHome);
  page();heading('Neue Wohnung');home('Angaben zum Zielort',details.newHome);homePhotos('Neue Wohnung',details.newHome);
  const names=[...new Set([...roomNames,...items.map(item=>item.room)])];
  const metric=(value?:number)=>value?.toFixed(2).replace('.',',')??'–';
  for(const room of names){
    const values=items.filter(item=>item.room===room);if(!values.length)continue;
    page();heading(room);
    for(const item of values){
      const x=56,tw=138;
      font(11,true);const title=doc.splitTextToSize(`${item.quantity}× ${item.title}`,tw) as string[];
      font(9);const description=doc.splitTextToSize(item.description.trim()||'-',tw) as string[];
      const hasMeasures=[item.width,item.depth,item.height].some(v=>typeof v==='number'&&Number.isFinite(v)&&v>0);
      const lines:{value:string;bold:boolean;size:number}[]=[...title.map(value=>({value,bold:true,size:11}))];
      if(hasMeasures)lines.push({value:`B × T × H: ${metric(item.width)} × ${metric(item.depth)} × ${metric(item.height)} m`,bold:false,size:9});
      if(item.needsPacking)lines.push({value:'Muss verpackt werden',bold:true,size:9});
      if(item.needsAssembly)lines.push({value:'Kann De-/Montiert werden: Ja',bold:true,size:9});
      lines.push(...description.map(value=>({value,bold:false,size:9})));
      const rowHeight=Math.max(item.photo?34:18,lines.length*5+7);
      if(y+Math.min(rowHeight,60)>bottom){page();heading(`${room} · Fortsetzung`);}
      const top=y,startPage=doc.getNumberOfPages();
      if(item.photo)image(item.photo,margin,top,34,27);
      y+=5;
      for(const line of lines){if(y+5>bottom){page();heading(`${room} · Fortsetzung`);}font(line.size,line.bold);doc.text(line.value,x,y);y+=5;}
      y=doc.getNumberOfPages()===startPage?Math.max(y+4,top+rowHeight):y+4;
      // A row split across pages must not inherit its first-page vertical offset.
      if(y>bottom)y=bottom;
      doc.setDrawColor(215);doc.line(margin,y-2,194,y-2);
    }
  }
  footer();return doc;
}
