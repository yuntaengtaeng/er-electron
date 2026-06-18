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

/** 타임아웃·강제 종료 시 배너가 collecting에 멈추지 않도록 idle 복구 */
export const resetCrawlStatusToIdle = async (supabase: SupabaseClient) => {
  await supabase.from('crawl_status').upsert(
    {
      id: 1,
      status: 'idle',
      completed_at: new Date().toISOString(),
      progress_current: 0,
      progress_total: 0,
      error_message: null,
    },
    { onConflict: 'id' },
  );
};
