

export function selectCheckboxes(novels: novelupdates.NovelDetails[]) {
  novels.forEach(novel => novel.checkbox.click())
  return novels
}
