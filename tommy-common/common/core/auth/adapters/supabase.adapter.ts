import { createClient } from '@supabase/supabase-js';
import { AuthAdapter, OAuthProvider } from '../auth.interface';

export const createSupabaseAdapter = (supabaseUrl: string, supabaseAnonKey: string): AuthAdapter => {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return {
    async signInWithProvider(provider: OAuthProvider, redirectTo?: string) {
      // Strava와 custom은 Supabase가 지원하지 않음
      if (provider === 'strava' || provider === 'custom') {
        throw new Error(`${provider} is not supported by Supabase. Use a custom adapter instead.`);
      }

      // Supabase가 지원하는 provider만 처리
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any, // google, apple, kakao 등
        options: {
          redirectTo: redirectTo || window.location.origin,
        }
      });
      if (error) throw error;
      return data;
    },

    async signOut() {
      await supabase.auth.signOut();
    },

    async getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },

    async getSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },

    async setSession(accessToken: string, refreshToken: string) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) throw error;
      return data.session;
    },
  };
};