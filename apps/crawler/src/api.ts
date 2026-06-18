import { ErApiClient } from '@repo/er-api-client';

const THROTTLE_MS = 1100;
const RETRY_BASE_DELAY_MS = 15000;
const MAX_RETRIES = 3;

export const createClient = (apiKey: string) => {
  const client = new ErApiClient(apiKey);
  let nextAllowedAt = 0;

  const throttle = async () => {
    const now = Date.now();
    const wait = nextAllowedAt - now;
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    nextAllowedAt = Date.now() + THROTTLE_MS;
  };

  const request = async <T>(fn: () => Promise<T>, attempt = 0): Promise<T> => {
    await throttle();
    try {
      return await fn();
    } catch (err) {
      if (attempt < MAX_RETRIES && err instanceof Error && err.message.startsWith('HTTP 429')) {
        const delay = RETRY_BASE_DELAY_MS * (attempt + 1);
        console.log(`[crawler] 429 rate limit — ${delay / 1000}초 대기 후 재시도 (${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((r) => setTimeout(r, delay));
        return request(fn, attempt + 1);
      }
      throw err;
    }
  };

  return {
    getTopRankersByServer: (seasonId: number, teamMode: number, serverCode: number) =>
      request(() => client.getTopRankersByServer(seasonId, teamMode, serverCode)),
    getUserByNickname: (nickname: string) =>
      request(() => client.getUserByNickname(nickname)),
    getUserGamesByUserId: (userId: string, next?: number) =>
      request(() => client.getUserGamesByUserId(userId, next)),
    getGame: (gameId: number) =>
      request(() => client.getGame(gameId)),
  };
};
