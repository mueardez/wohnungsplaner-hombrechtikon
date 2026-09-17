import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createInventoryPdf} from '../app/inventoryPdf.ts';
import {purchaseColor,PURCHASE_COLOR} from '../app/purchaseStyle.ts';
test('new purchases use violet without changing the base colour',()=>{
 assert.equal(purchaseColor(true,'#758a7b'),PURCHASE_COLOR);
 assert.equal(purchaseColor(false,'#758a7b'),'#758a7b');
 assert.equal(purchaseColor(undefined,'#758a7b'),'#758a7b');
});
const home={address:'Testadresse',floor:'2',rooms:'4',area:120,staircase:'Breit',elevator:true,parking:'Vor dem Haus',photos:[]};
const details={oldHome:home,newHome:home,persons:3};
const base={id:'one',title:'Testmöbel',description:'',room:'Keller',quantity:1,includeInPlan:false,needsPacking:false,needsAssembly:false,updatedAt:'2026-09-17'};
test('cover title uses both saved addresses and normalizes line breaks',()=>{
 const pdf=createInventoryPdf([],[],{...details,oldHome:{...home,address:'  Altweg 1\n8000 Zürich  '},newHome:{...home,address:'Neuweg 2\n8634 Hombrechtikon'}});
 const text=[...pdf.internal.pages[1].join('\n').matchAll(/\(([^()]*)\) Tj/g)].map(match=>match[1]).join(' ');
 assert.ok(text.includes('Umzug - Altweg 1 8000 Zürich >'));
 assert.ok(text.includes('Neuweg 2 8634 Hombrechtikon'));
 assert.ok(!text.includes('Wohnungen & Familie'));
});
test('empty addresses use neutral placeholders',()=>{
 const pdf=createInventoryPdf([],[],{...details,oldHome:{...home,address:''},newHome:{...home,address:'  '}});
 assert.ok(pdf.internal.pages[1].join('\n').includes('Umzug - - > -'));
});
test('housing comes first and every populated room starts a new page',()=>{
 const pdf=createInventoryPdf([base,{...base,id:'two',room:'Terrasse'}],['Keller','Terrasse'],details);
 assert.equal(pdf.getNumberOfPages(),4);
 const pages=pdf.internal.pages;
 assert.ok(pages[3].join('\n').includes('Keller'));
 assert.ok(!pages[3].join('\n').includes('Terrasse'));
 assert.ok(pages[4].join('\n').includes('Terrasse'));
});
test('missing measures and negative assembly flags are omitted',()=>{
 const text=createInventoryPdf([base],['Keller'],details).internal.pages[3].join('\n');
 assert.ok(!text.includes('B × T × H'));
 assert.ok(!text.includes('De-/Montiert'));
 assert.ok(!text.includes('verpackt'));
});
test('partial measures and positive services remain',()=>{
 const text=createInventoryPdf([{...base,width:1.2,needsAssembly:true,needsPacking:true}],['Keller'],details).internal.pages[3].join('\n');
 assert.ok(text.includes('1,20'));
 assert.ok(text.includes('Kann De-/Montiert werden: Ja'));
 assert.ok(text.includes('Muss verpackt werden'));
});
test('long descriptions paginate and unknown rooms are not silently lost',()=>{
 const pdf=createInventoryPdf([{...base,room:'Anderer Bereich',description:'Lange Beschreibung. '.repeat(1000)}],['Keller'],details);
 assert.ok(pdf.getNumberOfPages()>4);
 assert.ok(pdf.internal.pages[3].join('\n').includes('Anderer Bereich'));
});
test('housing PDF is available without inventory',()=>assert.equal(createInventoryPdf([],[],details).getNumberOfPages(),2));
test('new purchases are excluded from pages and totals, legacy records remain',()=>{
 const values=[base,{...base,id:'new',title:'NEW PURCHASE',room:'New-only room',quantity:8,isNewPurchase:true}];
 const pdf=createInventoryPdf(values,['Keller','New-only room'],details);
 assert.equal(pdf.getNumberOfPages(),3);
 const content=pdf.internal.pages.flat().join('\n');
 assert.ok(!content.includes('NEW PURCHASE'));
 assert.ok(!content.includes('New-only room'));
 assert.ok(content.includes('1 Inventarpositionen'));
 assert.ok(content.includes('1 Stück'));
 assert.equal(values.length,2);
 assert.equal(createInventoryPdf([values[1]],[],details).getNumberOfPages(),2);
});
