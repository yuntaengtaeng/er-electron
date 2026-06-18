import { useMemo, useState } from 'react'
import styled, { css } from 'styled-components'
import { Text } from '@repo/ui'
import { getAllCharacters, getCharacterById, normalizeImageUrl } from '../../../shared/utils/meta'

const FilterCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.comfortable};
  padding: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
`

const SearchInput = styled.input`
  flex: 1;
  min-width: 160px;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.subtle};
  border: 1px solid ${({ theme }) => theme.colors.background.elevated};
  background-color: ${({ theme }) => theme.colors.background.elevated};
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ theme }) => css(theme.typography.styles.body)}
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brand.green};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`

const ClearButton = styled.button`
  ${({ theme }) => css(theme.typography.styles.captionBold)}
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.subtle};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.brand.greenBorder};
  }
`

const CharGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: ${({ theme }) => theme.spacing[2]};
  max-height: 220px;
  overflow-y: auto;
`

const CharButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  padding: 0;
  border-radius: ${({ theme }) => theme.radius.medium};
  border: 2px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.brand.green : theme.colors.border.subtle};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.background.elevated : theme.colors.background.surface};
  cursor: pointer;
  transition: border-color 0.15s;
  overflow: hidden;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brand.greenBorder};
  }
`

const CharImg = styled.img`
  width: 52px;
  height: 52px;
  object-fit: cover;
`

type Props = {
  selectedId: number | null
  onSelect: (id: number | null) => void
}

export const CharacterFilter = ({ selectedId, onSelect }: Props) => {
  const [query, setQuery] = useState('')

  const characters = useMemo(() => {
    const all = getAllCharacters()
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.key.toLowerCase().includes(q),
    )
  }, [query])

  const selected = selectedId != null ? getCharacterById(selectedId) : null

  return (
    <FilterCard>
      <FilterHeader>
        <Text variant="bodyBold">실험체 필터</Text>
        {selected && (
          <Text variant="caption" color="secondary">
            선택: {selected.name}
          </Text>
        )}
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="실험체 이름 검색..."
        />
        {selectedId != null && (
          <ClearButton type="button" onClick={() => onSelect(null)}>
            전체
          </ClearButton>
        )}
      </FilterHeader>

      <CharGrid>
        {characters.map((char) => (
          <CharButton
            key={char.id}
            type="button"
            $active={selectedId === char.id}
            title={char.name}
            onClick={() => onSelect(selectedId === char.id ? null : char.id)}
          >
            <CharImg
              src={normalizeImageUrl(char.imageUrl)}
              alt={char.name}
            />
          </CharButton>
        ))}
      </CharGrid>
    </FilterCard>
  )
}
