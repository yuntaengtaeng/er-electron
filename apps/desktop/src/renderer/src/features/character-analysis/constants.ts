export const EQUIPMENT_SLOT_LABELS: Record<string, string> = {
  '0': '무기',
  '1': '갑옷',
  '2': '투구',
  '3': '장갑',
  '4': '신발',
}

export const ITEM_GRADE_FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'Epic', label: '에픽' },
  { key: 'Legend', label: '전설' },
  { key: 'Mythic', label: '신화' },
] as const

export type ItemGradeFilterKey = (typeof ITEM_GRADE_FILTERS)[number]['key']
