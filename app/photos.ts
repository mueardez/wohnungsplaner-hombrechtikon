export function compressPhoto(file: File): Promise<string> {
  if (file.size > 15_000_000) return Promise.reject(new Error('Das Foto ist grösser als 15 MB.'));
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) return Promise.reject(new Error('Bitte ein JPEG-, PNG- oder WebP-Foto auswählen.'));
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onerror=()=>reject(reader.error);
    reader.onload=()=>{const image=new Image();image.onerror=()=>reject(new Error('Bild konnte nicht gelesen werden.'));image.onload=()=>{
      const scale=Math.min(1,1200/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);
      const context=canvas.getContext('2d');if(!context){reject(new Error('Foto konnte nicht vorbereitet werden.'));return;}
      context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.8));
    };image.src=String(reader.result);};reader.readAsDataURL(file);
  });
}
