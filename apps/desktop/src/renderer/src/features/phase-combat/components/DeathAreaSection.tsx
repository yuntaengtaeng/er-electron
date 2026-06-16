import styled from "styled-components";
import { Text } from "@repo/ui";
import type { AreaDeathStat } from "@repo/service";
import { getAreaById, getCharacterByKey, normalizeImageUrl } from "../../../shared/utils/meta";

const MAP_W = 453;
const MAP_H = 515;

// key = area id (from areas.json), value = label center on 453×515 map
const AREA_POSITIONS: Record<number, { x: number; y: number }> = {
  10:  { x: 240, y: 450 }, // 항구
  20:  { x: 190, y: 440 }, // 창고
  30:  { x: 300, y: 250 }, // 연못
  40:  { x: 370, y: 200 }, // 개울
  50:  { x: 68,  y: 320 }, // 모래사장
  60:  { x: 110, y: 380 }, // 고급 주택가
  70:  { x: 255, y: 50  }, // 골목길
  80:  { x: 160, y: 55  }, // 주유소
  90:  { x: 73,  y: 220 }, // 호텔
  100: { x: 285, y: 130 }, // 경찰서
  110: { x: 230, y: 180 }, // 소방서
  120: { x: 380, y: 270 }, // 병원
  130: { x: 370, y: 130 }, // 절
  140: { x: 104, y: 135 }, // 양궁장
  150: { x: 296, y: 305 }, // 묘지
  160: { x: 183, y: 300 }, // 숲
  170: { x: 380, y: 360 }, // 공장
  180: { x: 250, y: 390 }, // 성당
  190: { x: 166, y: 180 }, // 학교
  200: { x: 310, y: 490 }, // 바지선
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[5]};
`;

const CardTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding-bottom: ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: ${({ theme }) => theme.spacing[5]};
  align-items: start;
`;

const MapContainer = styled.div`
  position: relative;
  width: 320px;
`;

const MapImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
`;

const AreaPin = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
`;

const NameTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.78);
  padding: 0 3px;
  line-height: 18px;
  white-space: nowrap;
`;

const CharacterAvatar = styled.img<{ $opacity: number }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.semantic.negative};
  object-fit: cover;
  opacity: ${({ $opacity }) => $opacity};
  background-color: ${({ theme }) => theme.colors.background.elevated};
`;

const RankList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const RankRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const RankNum = styled.div`
  flex-shrink: 0;
  width: 16px;
  text-align: right;
`;

const AreaName = styled.div`
  flex-shrink: 0;
  width: 72px;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-radius: 3px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $pct: number }>`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.semantic.negative};
  opacity: 0.75;
  border-radius: 3px;
`;

const CountText = styled.div`
  flex-shrink: 0;
  width: 28px;
  text-align: right;
`;

interface Props {
  deathAreaStats: AreaDeathStat[];
}

export const DeathAreaSection = ({ deathAreaStats }: Props) => {
  const top = deathAreaStats.slice(0, 7);
  const maxCount = Math.max(...deathAreaStats.map((s) => s.count), 1);
  const countMap = new Map(
    deathAreaStats.map((s) => [Number(s.areaKey), s.count]),
  );

  return (
    <Wrapper>
      <Text variant="bodyBold">사망 지역</Text>
      <Card>
        <CardTitle>
          <Text variant="bodyBold">지역별 사망 횟수</Text>
        </CardTitle>
        <Layout>
          <MapContainer>
            <MapImage
              src="https://cdn.dak.gg/er/images/routes/map.png?20260430"
              alt="루미아 섬 지도"
            />
            {Object.entries(AREA_POSITIONS).map(([idStr, { x, y }]) => {
              const id = Number(idStr);
              const count = countMap.get(id) ?? 0;
              const name = getAreaById(id)?.name ?? idStr;
              const areaStat = deathAreaStats.find((s) => Number(s.areaKey) === id);
              const killerChar = areaStat?.topKillerKey
                ? getCharacterByKey(areaStat.topKillerKey)
                : null;
              return (
                <AreaPin
                  key={idStr}
                  style={{
                    left: `${(x / MAP_W) * 100}%`,
                    top: `${(y / MAP_H) * 100}%`,
                  }}
                >
                  <NameTag>{name}</NameTag>
                  {count > 0 && killerChar && (
                    <CharacterAvatar
                      src={normalizeImageUrl(killerChar.imageUrl)}
                      alt={killerChar.name}
                      $opacity={0.5 + (count / maxCount) * 0.5}
                    />
                  )}
                </AreaPin>
              );
            })}
          </MapContainer>

          <RankList>
            {top.map((area, i) => {
              const name = getAreaById(Number(area.areaKey))?.name ?? area.areaKey;
              return (
                <RankRow key={area.areaKey}>
                  <RankNum>
                    <Text variant="caption" color="secondary">{i + 1}</Text>
                  </RankNum>
                  <AreaName>
                    <Text variant="caption">{name}</Text>
                  </AreaName>
                  <BarTrack>
                    <BarFill $pct={(area.count / maxCount) * 100} />
                  </BarTrack>
                  <CountText>
                    <Text variant="caption">{area.count}회</Text>
                  </CountText>
                </RankRow>
              );
            })}
          </RankList>
        </Layout>
      </Card>
    </Wrapper>
  );
};
