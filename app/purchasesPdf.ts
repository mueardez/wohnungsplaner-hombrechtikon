import {jsPDF} from 'jspdf';
import type {InventoryItem} from './InventoryPanel';
import {chf,purchasePrice,purchaseTotals} from './purchasePrice.ts';
import {safeInventoryUrl} from './inventoryUrl.ts';

export function createPurchasesPdf(all:InventoryItem[],roomNames:string[]):jsPDF {
  const items=all.filter(item=>item.isNewPurchase===true),totals=purchaseTotals(items);
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const left=16,right=194,bottom=276;
  let y=20;
  const font=(size=10,bold=false)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(40);};
  const heading=(title:string)=>{
    doc.setFillColor(192,132,232);doc.rect(0,0,210,7,'F');font(19,true);
    for(const line of doc.splitTextToSize(title,178) as string[]){doc.text(line,left,y);y+=8;}
    y+=6;
  };
  const page=(title:string)=>{doc.addPage();y=20;heading(title);};
  const text=(value:string,x=left,width=178,size=10,bold=false,continued='Neubeschaffungen - Fortsetzung')=>{
    font(size,bold);const lines=doc.splitTextToSize(value||'-',width) as string[];
    for(const line of lines){if(y+5>bottom)page(continued);font(size,bold);doc.text(line,x,y);y+=5;}
  };
  heading('Neubeschaffungen');
  text(`Erstellt am ${new Date().toLocaleDateString('de-CH')}`,left,178,9);
  text(`${items.length} Positionen / ${items.reduce((sum,item)=>sum+item.quantity,0)} Stück`,left,178,11,true);
  text('Artikelliste nach Raum. Die separate Preisübersicht folgt am Ende.',left,178,9);
  y+=7;
  if(!items.length)text('Keine Inventarpositionen als Neubeschaffung markiert.');
  const rooms=[...new Set([...roomNames,...items.map(item=>item.room)])];
  let first=true;
  for(const room of rooms){
    const values=items.filter(item=>item.room===room);if(!values.length)continue;
    if(!first)page('Neubeschaffungen');first=false;
    text(room,left,178,15,true);y+=5;
    for(const item of values){
      if(y+42>bottom)page('Neubeschaffungen - Fortsetzung');
      const start=y,startPage=doc.getNumberOfPages();
      if(item.photo){const p=doc.getImageProperties(item.photo),scale=Math.min(34/p.width,28/p.height);doc.addImage(item.photo,'JPEG',left+(34-p.width*scale)/2,y, p.width*scale,p.height*scale,undefined,'FAST');}
      text(`${item.quantity}× ${item.title}`,56,138,11,true);
      text(item.description.trim()||'-',56,138,9);
      if([item.width,item.depth,item.height].some(v=>typeof v==='number'&&v>0))text(`B × T × H: ${[item.width,item.depth,item.height].map(v=>v===undefined?'-':v.toFixed(2)).join(' × ')} m`,56,138,9);
      const url=safeInventoryUrl(item.url);
      if(url){if(y+6>bottom)page('Neubeschaffungen - Fortsetzung');font(9);doc.setTextColor(91,51,120);doc.textWithLink('Produktlink öffnen',56,y,{url});y+=6;}
      y=doc.getNumberOfPages()===startPage?Math.max(y+7,start+36):y+7;
      doc.setDrawColor(220);doc.line(left,Math.min(y-3,bottom),right,Math.min(y-3,bottom));y+=3;
    }
  }
  // Price overview always begins on a separate page, with repeated column headings.
  const pricePage=()=>{page('Preisübersicht - CHF');font(9,true);doc.text('Position / Raum',left,y);doc.text('Anzahl',111,y,{align:'right'});doc.text('Einzelpreis',153,y,{align:'right'});doc.text('Positionssumme',right,y,{align:'right'});y+=4;doc.setDrawColor(180);doc.line(left,y,right,y);y+=7;};
  pricePage();
  items.forEach((item,index)=>{
    font(9);const lines=doc.splitTextToSize(`${index+1}. ${item.title}\n${item.room}`,83) as string[];
    if(y+Math.min(lines.length*4.5+5,40)>bottom)pricePage();
    const price=purchasePrice(item.purchasePriceCHF);
    font(9);doc.text(String(item.quantity),111,y,{align:'right'});
    doc.text(price===undefined?'nicht erfasst':chf(price),153,y,{align:'right'});
    doc.text(price===undefined?'-':chf(Math.round(price*100)*item.quantity/100),right,y,{align:'right'});
    for(const line of lines){if(y+5>bottom)pricePage();font(9);doc.text(line,left,y);y+=4.5;}
    y+=4;doc.setDrawColor(225);doc.line(left,y-2,right,y-2);y+=3;
  });
  if(y+35>bottom)pricePage();y+=5;
  font(12,true);doc.text(totals.missing?'Zwischentotal erfasster Preise':'Gesamttotal',left,y);doc.text(`CHF ${chf(totals.total)}`,right,y,{align:'right'});y+=9;
  if(totals.missing)text(`${totals.missing} Position(en) ohne Preis. Diese sind nicht im Total enthalten.`,left,178,9);
  text('Einzelpreis pro Stück. Positionssumme = Einzelpreis × Anzahl.',left,178,9);
  const pages=doc.getNumberOfPages();for(let n=1;n<=pages;n++){doc.setPage(n);font(8);doc.setTextColor(110);doc.text(`Neubeschaffungen - Seite ${n} / ${pages}`,left,289);}
  return doc;
}
