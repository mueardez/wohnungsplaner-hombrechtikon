import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inventoryUrl,safeInventoryUrl} from '../app/inventoryUrl.ts';
test('optional URLs remain absent or can be cleared',()=>{
 for(const value of [undefined,null,'','   '])assert.equal(inventoryUrl(value),undefined);
});
test('product links retain their path, parameters and fragment',()=>{
 assert.equal(inventoryUrl(' https://shop.example/product?id=12&variant=blue#details '),'https://shop.example/product?id=12&variant=blue#details');
 assert.equal(inventoryUrl('http://example.com'),'http://example.com/');
});
test('unsafe and malformed URLs cannot become clickable links',()=>{
 for(const value of ['javascript:alert(1)','data:text/html,test','file:///tmp/test','ftp://example.com','https://user:secret@example.com','not a url',{},'https://example.com/'+ 'a'.repeat(4000)]){
  assert.throws(()=>inventoryUrl(value));assert.equal(safeInventoryUrl(value),undefined);
 }
});
test('URL remains compatible with inventory backup round trips',()=>{
 const item={id:'test',title:'Sofa',url:inventoryUrl('https://shop.example/sofa')};
 assert.deepEqual(JSON.parse(JSON.stringify(item)),item);
 assert.equal(safeInventoryUrl(JSON.parse(JSON.stringify(item)).url),item.url);
});
