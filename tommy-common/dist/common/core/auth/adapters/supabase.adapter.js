"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupabaseAdapter = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const createSupabaseAdapter = (supabaseUrl, supabaseAnonKey) => {
    const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
    return {
        async signInWithProvider(provider, redirectTo) {
            // Strava와 custom은 Supabase가 지원하지 않음
            if (provider === 'strava' || provider === 'custom') {
                throw new Error(`${provider} is not supported by Supabase. Use a custom adapter instead.`);
            }
            // Supabase가 지원하는 provider만 처리
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider, // google, apple, kakao 등
                options: {
                    redirectTo: redirectTo || window.location.origin,
                }
            });
            if (error)
                throw error;
            return data;
        },
        async signOut() {
            await supabase.auth.signOut();
        },
        async getUser() {
            const { data, error } = await supabase.auth.getUser();
            if (error)
                throw error;
            return data.user;
        },
        async getSession() {
            const { data, error } = await supabase.auth.getSession();
            if (error)
                throw error;
            return data.session;
        },
        async setSession(accessToken, refreshToken) {
            const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });
            if (error)
                throw error;
            return data.session;
        },
    };
};
exports.createSupabaseAdapter = createSupabaseAdapter;
