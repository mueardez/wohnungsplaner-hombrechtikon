export function purchasePrice(value: unknown): number | undefined {
  if(value===undefined||value===null||value==='')return undefined;
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>9999999.99)throw new Error('Bitte einen gültigen Anschaffungspreis zwischen CHF 0 und 9’999’999.99 eingeben.');
  const cents=Math.round(value*100);
  if(Math.abs(value*100-cents)>0.00001)throw new Error('Der Anschaffungspreis darf höchstens zwei Nachkommastellen enthalten.');
  return cents/100;
}
export function chf(value:number):string {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,"'");
}
export function purchaseTotals(items: {purchasePriceCHF?:number;quantity:number}[]) {
  let cents=0,missing=0;
  for(const item of items){const price=purchasePrice(item.purchasePriceCHF);if(price===undefined){missing++;continue;}
    if(!Number.isInteger(item.quantity)||item.quantity<1)throw new Error('Ungültige Stückzahl.');
    cents+=Math.round(price*100)*item.quantity;
    if(!Number.isSafeInteger(cents))throw new Error('Das Preistotal ist zu gross. Bitte Positionen prüfen.');
  }
  return {total:cents/100,missing};
}
