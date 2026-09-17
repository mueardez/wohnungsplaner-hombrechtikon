import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {createScalePeople,showScalePeople,personPosition} from '../app/scalePeople.ts';
const rooms=[{name:'Zimmer',poly:[[0,0],[4,0],[4,3],[0,3]]},{name:'Gang',poly:[[5,0],[8,0],[8,1],[6,1],[6,3],[5,3]]}];
test('each room receives a 1.85 m figure with 48 cm shoulder width',()=>{
 const group=createScalePeople(rooms);
 assert.equal(group.children.length,rooms.length);
 for(const person of group.children){const box=new Box3().setFromObject(person),size=box.getSize(new Vector3());assert.ok(Math.abs(size.y-1.85)<1e-6);assert.ok(Math.abs(size.x-.48)<1e-6);assert.ok(Math.abs(box.min.y)<1e-6);}
});
test('figures can be hidden or scoped to one room without being furniture',()=>{
 const group=createScalePeople(rooms);
 showScalePeople(group,true,'Gang');assert.equal(group.children[0].visible,false);assert.equal(group.children[1].visible,true);
 showScalePeople(group,false);assert.equal(group.visible,false);
 showScalePeople(group,true);assert.equal(group.children.every(p=>p.visible),true);
 assert.ok(group.children.every(p=>p.userData.furnitureId===undefined));
});
test('concave room position and opposite plan axes are supported',()=>{
 const [x,y]=personPosition(rooms[1].poly);assert.ok(x>=5&&x<=8&&y>=0&&y<=3&&(x<=6||y<=1));
 const a=createScalePeople(rooms,1),b=createScalePeople(rooms,-1);
 assert.equal(a.children[0].position.z,-b.children[0].position.z);
});
