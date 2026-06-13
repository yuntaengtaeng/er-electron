import { useEffect, useState } from "react";
import { getAllClubMembers } from "@repo/service";
import type { ClubMember } from "@repo/service";

export function useRankingMembers(): ClubMember[] {
  const [members, setMembers] = useState<ClubMember[]>([]);

  useEffect(() => {
    getAllClubMembers().then(setMembers).catch(() => {});
  }, []);

  return members;
}
