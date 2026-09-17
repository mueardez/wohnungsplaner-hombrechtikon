import { type ReactNode, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, clearPhotoCache, errorMessage, login, logout, permitted } from './cloud';
import './shared.css';

export default function AuthGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading'|'out'|'in'|'denied'>('loading');
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => {
    let sequence = 0;
    const stop = onAuthStateChanged(auth, async user => {
      const current = ++sequence; clearPhotoCache(); setState('loading');
      if (!user) { setState('out'); return; }
      try { const allowed = await permitted(); if (current === sequence) setState(allowed ? 'in' : 'denied'); }
      catch (error) { if (current === sequence) { setMessage(errorMessage(error)); setState('denied'); } }
    });
    return () => { sequence++; stop(); };
  }, []);
  const signIn = async () => { setBusy(true); setMessage(''); try { await login(); } catch (error) { setMessage(errorMessage(error)); } finally { setBusy(false); } };
  if (state === 'in') return <><div className="accountBar"><span>Gemeinsamer Datenbestand · {auth.currentUser?.email}</span><button onClick={() => { void logout().catch(e => setMessage(errorMessage(e))); }}>Abmelden</button>{message && <span role="alert">{message}</span>}</div>{children}</>;
  return <main className="authPage"><section className="authCard"><span className="kicker">HOMBRECHTIKON</span><h1>Euer Umzugsplaner</h1><p>Inventar, Fotos und Umzugsdaten sind nur für die freigegebenen Google-Konten zugänglich.</p>{state === 'loading' ? <p role="status">Anmeldung wird geprüft …</p> : <><button className="primaryButton" disabled={busy} onClick={signIn}>{busy ? 'Anmeldung läuft …' : 'Mit Google anmelden'}</button>{state === 'denied' && <p role="alert">Dieses Konto hat keinen Zugriff oder die Freigabe konnte nicht geprüft werden. Bitte mit dem freigegebenen Konto anmelden.</p>}{auth.currentUser && <button onClick={() => void logout()}>Konto abmelden</button>}</>}{message && <p role="alert">{message}</p>}</section></main>;
}
