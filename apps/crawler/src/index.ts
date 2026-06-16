import path from 'path';
import dotenv from 'dotenv';
import { createSupabaseClient, writeStatus } from './supabase';
import { collect } from './collect';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const apiKey = process.env['API_KEY'];
const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_KEY'];

if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
  console.error('필수 환경변수가 없습니다.');
  console.error('필요: API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

const main = async () => {
  try {
    await collect(supabase, apiKey);
  } catch (err) {
    console.error('[crawler] 오류 발생:', err);
    await writeStatus(supabase, {
      status: 'error',
      progress_current: 0,
      progress_total: 0,
      error_message: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
  }
};

main();
