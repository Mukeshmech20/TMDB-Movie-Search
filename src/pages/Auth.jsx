import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const USERNAME = /^[A-Za-z0-9_]{3,24}$/;

export default function Auth() {
  useDocumentTitle('Sign in');
  const { enabled, user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  if (!enabled) {
    return (
      <div className="page py-16">
        <div className="stub mx-auto max-w-lg text-center">
          <h1 className="text-3xl font-bold">Accounts are not set up</h1>
          <p className="mt-2 text-mute">This deployment has no Supabase project configured, so sign-in and shared community reviews are switched off. You can still rate and review movies; they are saved on this device.</p>
          <Link to="/discover" className="btn-primary mt-5">Browse movies</Link>
        </div>
      </div>
    );
  }
  if (user && !loading) return <Navigate to={location.state?.from || '/'} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    const email = form.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    if (form.password.length < 8) return setError('Passwords need at least 8 characters.');
    if (mode === 'signup' && !USERNAME.test(form.username)) return setError('Usernames use 3 to 24 letters, numbers or underscores.');
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, form.password);
        navigate(location.state?.from || '/', { replace: true });
      } else {
        const { needsConfirmation } = await signUp(email, form.password, form.username);
        if (needsConfirmation) setNotice('Account created. Check your email and click the confirmation link, then sign in.');
        else navigate('/', { replace: true });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page py-12">
      <div className="stub mx-auto max-w-md">
        <div className="mb-4 text-2xl"><Logo /></div>
        <h1 className="text-3xl font-bold">{mode === 'signin' ? 'Welcome back' : 'Join the community'}</h1>
        <p className="mt-1 text-sm text-mute">{mode === 'signin' ? 'Sign in to publish ratings and reviews.' : 'Create an account to rate, review and vote on reviews.'}</p>

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-pill border border-line p-1" role="tablist" aria-label="Account">
          {[['signin', 'Sign in'], ['signup', 'Create account']].map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={mode === id} className={`btn !min-h-[40px] ${mode === id ? 'bg-gold text-night' : 'text-mute hover:text-paper'}`} onClick={() => { setMode(id); setError(''); setNotice(''); }}>{label}</button>
          ))}
        </div>

        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="a-user" className="mb-1 block text-sm font-medium">Username</label>
              <input id="a-user" className="field" autoComplete="username" value={form.username} onChange={set('username')} maxLength={24} aria-describedby="a-user-help" />
              <p id="a-user-help" className="mt-1 text-xs text-mute">3 to 24 letters, numbers or underscores. This is shown on your public reviews.</p>
            </div>
          )}
          <div>
            <label htmlFor="a-email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="a-email" type="email" className="field" autoComplete="email" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label htmlFor="a-pass" className="mb-1 block text-sm font-medium">Password</label>
            <input id="a-pass" type="password" className="field" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={form.password} onChange={set('password')} />
          </div>
          {error && <p className="rounded-poster border border-crimson/60 bg-crimson/10 px-3 py-2 text-sm" role="alert">{error}</p>}
          {notice && <p className="rounded-poster border border-royal/50 bg-royal/10 px-3 py-2 text-sm" role="status">{notice}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
        </form>
      </div>
    </div>
  );
}
