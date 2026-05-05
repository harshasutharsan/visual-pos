import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { seedDatabase } from '../services/database';

export const useAuth = () => {
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      seedDatabase(session.user.id);
    }
  }, [session]);

  const handleAuth = async (mode: 'login' | 'signup', payload: any) => {
    setAuthError('');
    setIsAuthLoading(true);
    const { phone, password, shopName } = payload;
    const loginId = phone.includes('@') ? phone : `u.${phone.replace(/\s+/g, '')}@pos-mail.com`;

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: loginId, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email: loginId, 
          password, 
          options: { data: { shop_name: shopName, phone_number: phone } }
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('merchants').upsert({ 
            id: data.user.id, 
            email: data.user.email, 
            shop_name: shopName, 
            phone: phone.includes('@') ? '' : phone 
          });
          return true;
        }
      }
    } catch (error: any) {
      setAuthError(error.message);
      return false;
    } finally {
      setIsAuthLoading(false);
    }
    return false;
  };

  const logout = () => supabase.auth.signOut();

  return { session, isAuthLoading, authError, handleAuth, logout };
};
