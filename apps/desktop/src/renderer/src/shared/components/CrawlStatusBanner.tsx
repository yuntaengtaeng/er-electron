import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Text } from '@repo/ui';
import { getCrawlStatus } from '@repo/service';
import type { CrawlStatusRow } from '@repo/service';

const POLL_INTERVAL_MS = 30_000;

const useCrawlStatus = () => {
  const [status, setStatus] = useState<CrawlStatusRow | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getCrawlStatus();
        setStatus(result);
      } catch {
        // Supabase 연결 실패 시 무시
      }
    };

    fetch();
    const id = setInterval(fetch, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return status;
};

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const Banner = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[8]};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const Spinner = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid ${({ theme }) => theme.colors.brand.green};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  flex-shrink: 0;
`;

export const CrawlStatusBanner = () => {
  const status = useCrawlStatus();

  if (!status || status.status === 'idle') return null;

  const { progress_current: cur, progress_total: total } = status;
  const hasProgress = total > 0;

  if (status.status === 'collecting') {
    return (
      <Banner>
        <Spinner />
        <Text variant="caption" color="secondary">
          랭커 데이터 수집 중{hasProgress ? ` (${cur} / ${total}명)` : '...'}
        </Text>
      </Banner>
    );
  }

  if (status.status === 'error') {
    return (
      <Banner>
        <Text variant="caption" color="secondary">
          데이터 수집 중 오류가 발생했습니다
        </Text>
      </Banner>
    );
  }

  return null;
};
