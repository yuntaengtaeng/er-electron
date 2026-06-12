import { useCallback, useEffect, useState } from "react";
import type { CharacterStat, UserGame, UserStats } from "@repo/er-type";
import { getUserByNickname, getUserGames, getUserStats } from "@repo/service";

export interface CharacterGameStats extends CharacterStat {
  avgKillsRecent: number;
  avgTKRecent: number;
  avgDamageRecent: number;
  recentGameCount: number;
}

interface PlayerData {
  games: UserGame[];
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  wins: number;
  losses: number;
  winRate: string;
  avgKills: string;
  avgAssists: string;
  avgDamage: number;
  avgPlacement: string;
  topCharacters: CharacterGameStats[];
  page: number;
  hasPrev: boolean;
  hasNext: boolean;
  goNext: () => void;
  goPrev: () => void;
}

export function usePlayerData(nickname: string): PlayerData {
  const [userId, setUserId] = useState<string | null>(null);
  const [games, setGames] = useState<UserGame[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursors, setCursors] = useState<Array<number | undefined>>([undefined]);
  const [page, setPage] = useState(0);
  const [nextCursor, setNextCursor] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!nickname) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setGames([]);
    setStats(null);
    setCursors([undefined]);
    setPage(0);
    setNextCursor(undefined);

    (async () => {
      try {
        const userInfo = await getUserByNickname(nickname);
        if (cancelled) return;
        setUserId(userInfo.userId);

        const [gamesResult, statsData] = await Promise.all([
          getUserGames(userInfo.userId),
          getUserStats(userInfo.userId),
        ]);
        if (cancelled) return;
        setGames(gamesResult.games);
        setNextCursor(gamesResult.next);
        setStats(statsData);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [nickname]);

  const goNext = useCallback(() => {
    if (!userId || nextCursor == null) return;
    setLoading(true);
    setError(null);

    getUserGames(userId, nextCursor)
      .then(({ games: newGames, next }) => {
        setGames(newGames);
        setNextCursor(next);
        setCursors((prev) => [...prev, nextCursor]);
        setPage((p) => p + 1);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      })
      .finally(() => setLoading(false));
  }, [userId, nextCursor]);

  const goPrev = useCallback(() => {
    if (!userId || page === 0) return;
    setLoading(true);
    setError(null);

    const prevCursor = cursors[page - 1];
    getUserGames(userId, prevCursor)
      .then(({ games: newGames, next }) => {
        setGames(newGames);
        setNextCursor(next);
        setCursors((prev) => prev.slice(0, page));
        setPage((p) => p - 1);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      })
      .finally(() => setLoading(false));
  }, [userId, page, cursors]);

  const wins = games.filter((g) => g.gameRank === 1).length;
  const losses = games.length - wins;
  const winRate =
    games.length > 0 ? ((wins / games.length) * 100).toFixed(1) : "0.0";
  const avgKills =
    games.length > 0
      ? (games.reduce((s, g) => s + g.playerKill, 0) / games.length).toFixed(1)
      : "0.0";
  const avgAssists =
    games.length > 0
      ? (games.reduce((s, g) => s + g.playerAssistant, 0) / games.length).toFixed(1)
      : "0.0";
  const avgDamage =
    games.length > 0
      ? Math.round(games.reduce((s, g) => s + g.damageToPlayer, 0) / games.length)
      : 0;
  const avgPlacement =
    games.length > 0
      ? (games.reduce((s, g) => s + g.gameRank, 0) / games.length).toFixed(1)
      : "0.0";

  const topCharacters: CharacterGameStats[] = (stats?.characterStats ?? [])
    .sort((a, b) => b.totalGames - a.totalGames)
    .slice(0, 8)
    .map((cs) => {
      const charGames = games.filter((g) => g.characterNum === cs.characterCode);
      const n = charGames.length;
      return {
        ...cs,
        recentGameCount: n,
        avgKillsRecent:  n > 0 ? charGames.reduce((s, g) => s + g.playerKill, 0) / n : 0,
        avgTKRecent:     n > 0 ? charGames.reduce((s, g) => s + g.teamKill, 0) / n : 0,
        avgDamageRecent: n > 0 ? Math.round(charGames.reduce((s, g) => s + g.damageToPlayer, 0) / n) : 0,
      };
    });

  return {
    games, stats, loading, error,
    wins, losses, winRate,
    avgKills, avgAssists, avgDamage, avgPlacement,
    topCharacters,
    page,
    hasPrev: page > 0,
    hasNext: nextCursor != null,
    goNext,
    goPrev,
  };
}
