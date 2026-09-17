import * as THREE from 'three';
export const PERSON_HEIGHT=1.85;
export const PERSON_WIDTH=.48;
type Point=[number,number];
type Room={name:string;poly:Point[]};
function inside([x,y]:Point,poly:Point[]){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [a,b]=poly[i],[c,d]=poly[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)yes=!yes;}return yes;}
// Choose an interior point even for L-shaped rooms; never use a bounding-box centre outside the room.
export function personPosition(poly:Point[]):Point {
 const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
 let best:Point=poly[0],score=-Infinity;
 for(let y=top+.25;y<bottom;y+=.15)for(let x=left+.25;x<right;x+=.15){
  if(![[-.25,-.16],[.25,-.16],[.25,.16],[-.25,.16]].every(([dx,dy])=>inside([x+dx,y+dy],poly)))continue;
  const s=-((x-(left+(right-left)*.30))**2+(y-(top+(bottom-top)*.68))**2);if(s>score){score=s;best=[x,y];}
 }return best;
}
export function createScalePeople(rooms:Room[],axis=1){
 const group=new THREE.Group();
 const material=new THREE.MeshStandardMaterial({color:'#496b86',roughness:.9});
 for(const room of rooms){
  const person=new THREE.Group(),[x,y]=personPosition(room.poly);person.position.set(x,0,axis*y);person.userData.room=room.name;
  const box=(w:number,h:number,d:number,x:number,y:number,z=0)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);person.add(mesh);};
  // Feet at 0 m, top of head exactly 1.85 m. Shoulder width approximately 48 cm.
  for(const side of [-1,1]){box(.12,.08,.26,side*.10,.04,-.04);box(.12,.82,.14,side*.10,.49);box(.075,.57,.10,side*.2025,1.145);}
  box(.32,.57,.21,0,1.155);box(.11,.12,.11,0,1.50);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.145,12,10),material);head.scale.set(.76,1,.79);head.position.y=PERSON_HEIGHT-.145;person.add(head);
  group.add(person);
 }return group;
}
export function showScalePeople(group:THREE.Group,enabled:boolean,room?:string){group.visible=enabled;for(const person of group.children)person.visible=!room||person.userData.room===room;}
