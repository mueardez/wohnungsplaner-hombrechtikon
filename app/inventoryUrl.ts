export function inventoryUrl(value: unknown): string | undefined {
  if(value===undefined||value===null||value==='')return undefined;
  if(typeof value!=='string')throw new Error('Bitte einen gültigen Link mit https:// oder http:// eingeben.');
  const trimmed=value.trim();if(!trimmed)return undefined;
  if(trimmed.length>4000)throw new Error('Der Link darf höchstens 4000 Zeichen enthalten.');
  try {
    const url=new URL(trimmed);
    if(!['https:','http:'].includes(url.protocol)||!url.hostname||url.username||url.password)throw new Error();
    return url.href;
  } catch {throw new Error('Bitte einen gültigen Link mit https:// oder http:// eingeben (ohne Zugangsdaten).');}
}
export function safeInventoryUrl(value: unknown): string | undefined {
  try{return inventoryUrl(value)}catch{return undefined}
}
