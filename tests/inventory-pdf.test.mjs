import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createInventoryPdf} from '../app/inventoryPdf.ts';
const home={address:'Testadresse',floor:'2',rooms:'4',area:120,staircase:'Breit',elevator:true,parking:'Vor dem Haus',photos:[]};
const details={oldHome:home,newHome:home,persons:3};
const base={id:'one',title:'Testmöbel',description:'',room:'Keller',quantity:1,includeInPlan:false,needsPacking:false,needsAssembly:false,updatedAt:'2026-09-17'};
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
