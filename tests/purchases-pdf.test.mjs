import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPurchasesPdf} from '../app/purchasesPdf.ts';
import {purchasePrice,purchaseTotals,chf} from '../app/purchasePrice.ts';
const base={id:'one',title:'Sofa',description:'Bezug beige',room:'Wohnen',quantity:2,isNewPurchase:true,includeInPlan:true,needsPacking:false,needsAssembly:false,updatedAt:'',purchasePriceCHF:249.90,url:'https://shop.example/sofa'};
const contents=doc=>doc.internal.pages.flat().join('\n');
test('optional prices distinguish missing from zero and reject invalid inputs',()=>{
 assert.equal(purchasePrice(undefined),undefined);assert.equal(purchasePrice(''),undefined);assert.equal(purchasePrice(0),0);
 for(const value of [-1,NaN,Infinity,1.234,'19.90',10000000])assert.throws(()=>purchasePrice(value));
});
test('totals use integer cents and quantity',()=>{
 assert.deepEqual(purchaseTotals([{purchasePriceCHF:.1,quantity:3},{purchasePriceCHF:.2,quantity:2},{quantity:1}]),{total:.7,missing:1});
 assert.equal(chf(1234.5),"1'234.50");
});
test('only purchases included, with a separate price page and product hyperlink',()=>{
 const pdf=createPurchasesPdf([base,{...base,id:'existing',title:'OLD ITEM',isNewPurchase:false}],['Wohnen']);
 assert.equal(pdf.getNumberOfPages(),2);const all=contents(pdf),last=pdf.internal.pages[2].join('\n');
 assert.ok(!all.includes('OLD ITEM'));assert.ok(last.includes('Preisübersicht - CHF'));assert.ok(last.includes('249.90'));assert.ok(last.includes('499.80'));assert.ok(last.includes('Gesamttotal'));
 assert.ok(pdf.output().includes('https://shop.example/sofa'));
});
test('missing prices are explicit and the total is labelled partial',()=>{
 const pdf=createPurchasesPdf([{...base,purchasePriceCHF:undefined},{...base,id:'free',purchasePriceCHF:0}],[]);
 const last=pdf.internal.pages[2].join('\n');
 assert.ok(last.includes('nicht erfasst'));assert.ok(last.includes('Zwischentotal erfasster Preise'));assert.ok(last.includes('0.00'));
});
test('no purchases produces an explanatory document and zero total',()=>{
 const pdf=createPurchasesPdf([],[]);assert.equal(pdf.getNumberOfPages(),2);
 assert.ok(contents(pdf).includes('Keine Inventarpositionen'));assert.ok(contents(pdf).includes('CHF 0.00'));
});
test('multiple rooms, many positions and long descriptions paginate without dropping items',()=>{
 const items=Array.from({length:60},(_,i)=>({...base,id:String(i),title:'Artikel '+i+' lang '.repeat(20),room:i%2?'Büro':'Wohnen',description:i===0?'Beschreibung '.repeat(700):'Text'}));
 const pdf=createPurchasesPdf(items,['Wohnen','Büro']),all=contents(pdf);
 assert.ok(pdf.getNumberOfPages()>6);assert.ok(all.includes('Artikel 59'));assert.ok(all.includes("29'988.00"));
 assert.ok(all.split('Preisübersicht - CHF').length>2);
});
