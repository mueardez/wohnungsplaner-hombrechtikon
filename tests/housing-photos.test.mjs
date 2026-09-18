import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createInventoryPdf} from '../app/inventoryPdf.ts';
import {photoFixture} from './photoFixture.mjs';
const home={address:'Testweg 1',floor:'2',rooms:'4',staircase:'Breit',elevator:false,parking:'Vor dem Haus',photos:[]};
test('three housing photos and captions share a dedicated A4 page per home',()=>{
 const photos=[photoFixture(),photoFixture(90,160),photoFixture(120,120)];
 const pdf=createInventoryPdf([],[],{oldHome:{...home,photos,photoDescriptions:['Eingang','Treppenhaus','Parkplatz']},newHome:{...home,photos,photoDescriptions:['Neuer Eingang','Neuer Lift','Neue Zufahrt']}});
 assert.equal(pdf.getNumberOfPages(),4);
 const old=pdf.internal.pages[2].join('\n'),next=pdf.internal.pages[4].join('\n');
 for(const text of ['Fotos - Alte Wohnung','Bild 1','Bild 2','Bild 3','Eingang','Treppenhaus','Parkplatz'])assert.ok(old.includes(text));
 assert.ok(!pdf.internal.pages[1].join('\n').includes('/I0 Do'));
 assert.ok(next.includes('Fotos - Neue Wohnung'));assert.ok(next.includes('Neuer Lift'));
});
test('legacy photos without descriptions remain supported; empty slots retain captions by index',()=>{
 const pdf=createInventoryPdf([],[],{oldHome:{...home,photos:[photoFixture()]},newHome:{...home,photos:['','',photoFixture()],photoDescriptions:['unused','','Drittes Bild']}});
 assert.equal(pdf.getNumberOfPages(),4);const last=pdf.internal.pages[4].join('\n');
 assert.ok(last.includes('Bild 3'));assert.ok(last.includes('Drittes Bild'));assert.ok(!last.includes('unused'));
});
test('255-character descriptions fit without extra photo pages',()=>{
 const pdf=createInventoryPdf([],[],{oldHome:{...home,photos:Array(3).fill(photoFixture()),photoDescriptions:Array(3).fill('W'.repeat(255))},newHome:home});
 assert.equal(pdf.getNumberOfPages(),3);
 const page=pdf.internal.pages[2].join('\n');
 const text=[...page.matchAll(/\(([^()]*)\) Tj/g)].map(m=>m[1]).join('');
 assert.equal((text.match(/W/g)||[]).length,3*255+1);
});
