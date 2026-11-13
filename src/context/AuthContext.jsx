import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { IS_COMMUNITY_ENABLED } from '../config';
import { fetchProfile, friendlyError, saveProfile } from '../services/reviewService';
import { getSupabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profileState, setProfile] = useState({ id: null, value: null });
  const [loading, setLoading] = useState(IS_COMMUNITY_ENABLED);

  useEffect(() => {
    if (!IS_COMMUNITY_ENABLED) return undefined;
    let unsubscribe = () => {};
    let cancelled = false;
    getSupabase().then(async (client) => {
      const { data } = await client.auth.getSession();
      if (cancelled) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
      const sub = client.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
      unsubscribe = () => sub.data.subscription.unsubscribe();
    }).catch(() => setLoading(false));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const userId = user?.id;
  const profile = userId && profileState.id === userId ? profileState.value : null;
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    fetchProfile(userId).then((p) => !cancelled && setProfile({ id: userId, value: p })).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signIn = useCallback(async (email, password) => {
    const client = await getSupabase();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(friendlyError(error));
  }, []);

  const signUp = useCallback(async (email, password, username) => {
    const client = await getSupabase();
    const { data, error } = await client.auth.signUp({ email, password, options: { data: { username } } });
    if (error) throw new Error(friendlyError(error));
    return { needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    const client = await getSupabase();
    await client.auth.signOut();
  }, []);

  const updateProfile = useCallback(async (patch) => {
    const next = await saveProfile(userId, patch);
    setProfile({ id: userId, value: next });
    return next;
  }, [userId]);

  const value = useMemo(
    () => ({ enabled: IS_COMMUNITY_ENABLED, user, profile, loading, signIn, signUp, signOut, updateProfile }),
    [user, profile, loading, signIn, signUp, signOut, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
