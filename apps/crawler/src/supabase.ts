import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const createSupabaseClient = (url: string, serviceKey: string): SupabaseClient =>
  createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

export type CrawlStatus = {
  status: 'idle' | 'collecting' | 'error';
  started_at?: string;
  completed_at?: string;
  progress_current: number;
  progress_total: number;
  error_message?: string;
};

export const writeStatus = async (supabase: SupabaseClient, status: CrawlStatus) => {
  await supabase
    .from('crawl_status')
    .upsert({ id: 1, ...status }, { onConflict: 'id' });
};
