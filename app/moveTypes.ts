export type Apartment = {
  address: string; floor: string; rooms: string; area?: number;
  staircase: string; elevator: boolean; parking: string; photos: string[];
};
export type MoveDetails = { oldHome: Apartment; newHome: Apartment; persons?: number; revision?: number };
export const emptyApartment = (): Apartment => ({ address: '', floor: '', rooms: '', staircase: '', elevator: false, parking: '', photos: [] });
export const emptyMove = (): MoveDetails => ({ oldHome: emptyApartment(), newHome: emptyApartment() });
