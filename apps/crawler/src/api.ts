import { ErApiClient } from '@repo/er-api-client';

export const createClient = (apiKey: string) => {
  const client = new ErApiClient(apiKey);
  let nextAllowedAt = 0;

  const throttle = async () => {
    const now = Date.now();
    const wait = nextAllowedAt - now;
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    nextAllowedAt = Date.now() + 1000;
  };

  return {
    getTopRankersByServer: async (seasonId: number, teamMode: number, serverCode: string) => {
      await throttle();
      return client.getTopRankersByServer(seasonId, teamMode, serverCode);
    },
    getUserGamesByUserNum: async (userNum: number, next?: number) => {
      await throttle();
      return client.getUserGamesByUserNum(userNum, next);
    },
  };
};
