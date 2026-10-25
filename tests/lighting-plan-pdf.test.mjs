import test from 'node:test';
import assert from 'node:assert/strict';
import {createLightingPlanPdf,lightingLayout} from '../app/lightingPlanPdf.ts';

test('A4 orientation maximizes usable drawing scale',()=>{
  for(const [w,h] of [[16.35,15.46],[30,8],[8,30]]){
    const p=lightingLayout(w,h);
    assert.equal(p.scale,Math.max(Math.min(186/w,237/h),Math.min(273/w,150/h)));
    assert.ok(w*p.scale<=p.w-24+.001);
    assert.ok(h*p.scale<=p.h-60+.001);
  }
});
test('blank apartment plan is one vector A4 portrait page',()=>{
  const doc=createLightingPlanPdf();
  assert.equal(doc.getNumberOfPages(),1);
  assert.ok(Math.abs(doc.internal.pageSize.getWidth()-210)<.1);
  assert.ok(Math.abs(doc.internal.pageSize.getHeight()-297)<.1);
  const pdf=doc.output();
  assert.match(pdf,/Leuchtenplan/);
  assert.match(pdf,/Kinderzimmer Noa/);
  assert.match(pdf,/Wohnen \/ Essen/);
  assert.doesNotMatch(pdf,/\/Subtype \/Image/);
  assert.doesNotMatch(pdf,/Sideboard|Bürotisch|Massstabsfigur/);
});
