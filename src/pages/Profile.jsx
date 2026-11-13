import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../context/ReviewsContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { friendlyError } from '../services/reviewService';

export default function Profile() {
  useDocumentTitle('Your profile');
  const { enabled, user, profile, loading, updateProfile } = useAuth();
  const { reviews } = useReviews();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!enabled) return <Navigate to="/auth" replace />;
  if (loading) return <div className="page py-12"><div className="skeleton h-40" /></div>;
  if (!user) return <Navigate to="/auth" replace state={{ from: '/profile' }} />;
  if (!profile) return <div className="page py-12"><div className="skeleton h-40" /></div>;

  const values = form || { username: profile.username, display_name: profile.display_name || '', bio: profile.bio || '' };
  const set = (key) => (e) => { setForm({ ...values, [key]: e.target.value }); setSaved(false); };
  const count = Object.keys(reviews).length;
  const written = Object.values(reviews).filter((r) => r.text).length;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!/^[A-Za-z0-9_]{3,24}$/.test(values.username)) return setError('Usernames use 3 to 24 letters, numbers or underscores.');
    setBusy(true);
    try {
      await updateProfile({ username: values.username, display_name: values.display_name.trim() || null, bio: values.bio.trim() || null });
      setSaved(true);
      setForm(null);
    } catch (e) {
      setError(e.message || friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page py-10">
      <p className="eyebrow">Your profile</p>
      <h1 className="mt-1 text-4xl font-bold">{profile.display_name || profile.username}</h1>
      <p className="mt-1 text-mute">@{profile.username} · {user.email}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={submit} noValidate className="stub space-y-4">
          <div><label htmlFor="p-user" className="mb-1 block text-sm font-medium">Username</label><input id="p-user" className="field" value={values.username} onChange={set('username')} maxLength={24} /></div>
          <div><label htmlFor="p-name" className="mb-1 block text-sm font-medium">Display name</label><input id="p-name" className="field" value={values.display_name} onChange={set('display_name')} maxLength={50} /></div>
          <div><label htmlFor="p-bio" className="mb-1 block text-sm font-medium">Bio</label><textarea id="p-bio" className="field min-h-[90px] py-2" value={values.bio} onChange={set('bio')} maxLength={280} /><p className="mt-1 text-xs text-mute">{values.bio.length} / 280</p></div>
          {error && <p className="rounded-poster border border-crimson/60 bg-crimson/10 px-3 py-2 text-sm" role="alert">{error}</p>}
          {saved && <p className="rounded-poster border border-royal/50 bg-royal/10 px-3 py-2 text-sm" role="status">Profile saved.</p>}
          <div className="flex flex-wrap gap-2"><button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save profile'}</button><Link to={`/u/${profile.username}`} className="btn-ghost">View public profile</Link></div>
        </form>
        <aside className="stub self-start"><h2 className="text-xl font-bold">Your activity</h2><p className="mt-3 text-3xl font-display font-bold text-gold">{count}</p><p className="text-sm text-mute">{count === 1 ? 'rating' : 'ratings'} · {written} written {written === 1 ? 'review' : 'reviews'}</p><Link to="/diary" className="btn-ghost mt-4">Open diary & reviews</Link></aside>
      </div>
    </div>
  );
}
