import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '../db';

export interface AuthNonce {
  wallet_address: string;
  nonce: string;
  expires_at: Date;
  created_at: Date;
}

export interface AuthSession {
  id: number;
  wallet_address: string;
  session_token: string;
  expires_at: Date;
  created_at: Date;
}

export class AuthRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || getSupabase();
  }

  // Nonce methods
  async createOrUpdateNonce(
    walletAddress: string,
    nonce: string,
    expiresAt: Date
  ): Promise<void> {
    const { error } = await this.supabase
      .from('auth_nonces')
      .upsert({
        wallet_address: walletAddress,
        nonce,
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'wallet_address',
      });
    
    if (error) throw error;
  }

  async getNonce(walletAddress: string): Promise<AuthNonce | undefined> {
    const { data, error } = await this.supabase
      .from('auth_nonces')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data as AuthNonce;
  }

  async deleteNonce(walletAddress: string): Promise<void> {
    const { error } = await this.supabase
      .from('auth_nonces')
      .delete()
      .eq('wallet_address', walletAddress);
    
    if (error) throw error;
  }

  async cleanupExpiredNonces(): Promise<void> {
    const { error } = await this.supabase
      .from('auth_nonces')
      .delete()
      .lt('expires_at', new Date().toISOString());
    
    if (error) throw error;
  }

  // Session methods
  async createSession(
    walletAddress: string,
    sessionToken: string,
    expiresAt: Date
  ): Promise<AuthSession> {
    const { data, error } = await this.supabase
      .from('auth_sessions')
      .insert({
        wallet_address: walletAddress,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as AuthSession;
  }

  async getSessionByToken(sessionToken: string): Promise<AuthSession | undefined> {
    const { data, error } = await this.supabase
      .from('auth_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data as AuthSession;
  }

  async deleteSession(sessionToken: string): Promise<void> {
    const { error } = await this.supabase
      .from('auth_sessions')
      .delete()
      .eq('session_token', sessionToken);
    
    if (error) throw error;
  }

  async deleteAllUserSessions(walletAddress: string): Promise<void> {
    const { error } = await this.supabase
      .from('auth_sessions')
      .delete()
      .eq('wallet_address', walletAddress);
    
    if (error) throw error;
  }

  async cleanupExpiredSessions(): Promise<void> {
    const { error } = await this.supabase
      .from('auth_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());
    
    if (error) throw error;
  }
}

