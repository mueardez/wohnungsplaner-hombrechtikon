import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getFirestore, initializeFirestore, memoryLocalCache, onSnapshot, runTransaction } from 'firebase/firestore';
import { getBlob, getStorage, ref, uploadString } from 'firebase/storage';
import type { InventoryItem } from './InventoryPanel';
import { emptyMove, type MoveDetails } from './moveTypes';

// Public client configuration, not a credential. Access is enforced by Firebase rules.
const existingApp = getApps().some(app => app.name === '[DEFAULT]');
const app = existingApp ? getApp() : initializeApp({
  projectId: 'wohnungsplaner-hombrechtikon',
  appId: '1:1061220479871:web:2fcf4de63fee916c34604a',
  apiKey: 'AIzaSyDngmRqPyLJm2EtjZSWkw95N89HEVnErB4',
  authDomain: 'wohnungsplaner-hombrechtikon.firebaseapp.com',
  storageBucket: 'wohnungsplaner-hombrechtikon.firebasestorage.app',
});
export const auth = getAuth(app);
const db = existingApp ? getFirestore(app) : initializeFirestore(app, { localCache: memoryLocalCache(), ignoreUndefinedProperties: true });
const storage = getStorage(app);
const base = 'households/hombrechtikon';
const itemsRef = collection(db, base + '/items');
const moveRef = doc(db, base + '/settings/move');
const photos = new Map<string, Promise<string>>();
const uploaded = new Map<string, string>();
export function clearPhotoCache() { photos.clear(); uploaded.clear(); }
export async function permitted() {
  const u = auth.currentUser;
  return !!u?.email && u.emailVerified && (await getDoc(doc(db, 'access', u.email))).exists();
}
export async function login() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithPopup(auth, provider);
}
export async function logout() { clearPhotoCache(); await signOut(auth); }
export function errorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code === 'auth/popup-closed-by-user') return 'Anmeldung abgebrochen.';
  if (code === 'auth/popup-blocked') return 'Bitte das Google-Anmeldefenster im Browser erlauben.';
  if (code === 'permission-denied' || code === 'storage/unauthorized') return 'Keine Zugriffsberechtigung. Bitte mit einem freigegebenen Google-Konto anmelden.';
  if (code === 'unavailable' || code === 'auth/network-request-failed') return 'Keine Verbindung. Bitte Internetverbindung prüfen und erneut versuchen.';
  return error instanceof Error ? error.message : 'Die Aktion konnte nicht abgeschlossen werden. Bitte erneut versuchen.';
}
function dataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(reader.error); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(blob); });
}
async function readPhoto(path?: string): Promise<string | undefined> {
  if (!path) return undefined;
  if (!path.startsWith(base + '/photos/')) throw new Error('Ungültiger privater Fotopfad.');
  if (!photos.has(path)) photos.set(path, getBlob(ref(storage, path), 5 * 1024 * 1024).then(dataURL).then(value => { uploaded.set(value, path); return value; }).catch(error => { photos.delete(path); throw error; }));
  return photos.get(path)!;
}
async function savePhoto(value?: string): Promise<string | undefined> {
  if (!value) return undefined;
  if (uploaded.has(value)) return uploaded.get(value);
  if (!value.startsWith('data:image/jpeg;base64,') || value.length > 7_000_000) throw new Error('Ungültiges oder zu grosses Foto. Bitte als Foto neu auswählen.');
  const path = base + '/photos/' + crypto.randomUUID() + '.jpg';
  await uploadString(ref(storage, path), value, 'data_url', { contentType: 'image/jpeg' });
  uploaded.set(value, path);
  return path;
}
export function watchItems(next: (items: InventoryItem[]) => void, fail: (error: unknown) => void) {
  let sequence = 0, active = true;
  const stop = onSnapshot(itemsRef, async snapshot => {
    const version = ++sequence;
    try {
      const values = await Promise.all(snapshot.docs.map(async d => { const value = d.data() as InventoryItem; return { ...value, photo: await readPhoto(value.photo) }; }));
      if (active && sequence === version) next(values.sort((a,b) => a.room.localeCompare(b.room) || a.title.localeCompare(b.title)));
    } catch (error) { if (active && sequence === version) fail(error); }
  }, fail);
  return () => { active = false; stop(); };
}
export async function saveCloudItem(item: InventoryItem, onlyNew = false): Promise<boolean> {
  const target = doc(itemsRef, item.id);
  if (onlyNew && (await getDoc(target)).exists()) return false;
  const photo = await savePhoto(item.photo);
  return runTransaction(db, async tx => {
    const current = await tx.get(target);
    if (onlyNew && current.exists()) return false;
    if (!onlyNew && (current.data()?.revision ?? 0) !== (item.revision ?? 0)) throw new Error('Dieser Eintrag wurde inzwischen geändert. Bitte erneut öffnen und deine Änderung wiederholen.');
    if (!onlyNew && !current.exists() && item.revision) throw new Error('Dieser Eintrag wurde inzwischen gelöscht.');
    const value = { ...item, revision: (current.data()?.revision ?? 0) + 1, updatedAt: new Date().toISOString() };
    // Omit removed photos instead of retaining stale paths.
    const clean = JSON.parse(JSON.stringify({ ...value, photo }));
    tx.set(target, clean);
    return true;
  });
}
export async function removeCloudItem(item: InventoryItem) {
  await runTransaction(db, async tx => {
    const target = doc(itemsRef, item.id), current = await tx.get(target);
    if (!current.exists()) return;
    if ((current.data()?.revision ?? 0) !== (item.revision ?? 0)) throw new Error('Der Eintrag wurde inzwischen geändert. Bitte vor dem Löschen nochmals prüfen.');
    tx.delete(target);
  });
}
export function watchMove(next: (value: MoveDetails) => void, fail: (error: unknown) => void) {
  let sequence = 0, active = true;
  const stop = onSnapshot(moveRef, async snapshot => {
    const version = ++sequence;
    try {
      const value = snapshot.exists() ? snapshot.data() as MoveDetails : emptyMove();
      const oldPhotos = await Promise.all(value.oldHome.photos.map(p => p ? readPhoto(p) : Promise.resolve('')));
      const newPhotos = await Promise.all(value.newHome.photos.map(p => p ? readPhoto(p) : Promise.resolve('')));
      if (active && version === sequence) next({ ...value, oldHome: { ...value.oldHome, photos: oldPhotos.map(p => p ?? '') }, newHome: { ...value.newHome, photos: newPhotos.map(p => p ?? '') } });
    } catch (error) { if (active && version === sequence) fail(error); }
  }, fail);
  return () => { active = false; stop(); };
}
export async function saveMove(value: MoveDetails) {
  if (value.persons !== undefined && (!Number.isInteger(value.persons) || value.persons < 1 || value.persons > 100)) throw new Error('Bitte eine ganze Personenzahl zwischen 1 und 100 eingeben.');
  for (const home of [value.oldHome, value.newHome]) {
    if (home.area !== undefined && (!Number.isFinite(home.area) || home.area < 0)) throw new Error('Bitte eine gültige Quadratmeterzahl eingeben.');
    if (home.photos.length > 3) throw new Error('Pro Wohnung sind höchstens drei Fotos möglich.');
  }
  const oldPhotos = await Promise.all(value.oldHome.photos.map(async p => await savePhoto(p) ?? ''));
  const newPhotos = await Promise.all(value.newHome.photos.map(async p => await savePhoto(p) ?? ''));
  await runTransaction(db, async tx => {
    const current = await tx.get(moveRef);
    if ((current.data()?.revision ?? 0) !== (value.revision ?? 0)) throw new Error('Die Umzugsdaten wurden inzwischen geändert. Bitte zuerst den aktuellen Stand laden. Deine Eingaben sind noch im Formular.');
    tx.set(moveRef, JSON.parse(JSON.stringify({ ...value, revision: (current.data()?.revision ?? 0) + 1, oldHome: { ...value.oldHome, photos: oldPhotos }, newHome: { ...value.newHome, photos: newPhotos } })));
  });
}
