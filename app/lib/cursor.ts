export function parseCursorQuery(url: URL) {
  const cursorQuery = url.searchParams.get("cursor");

  if (cursorQuery === null || !cursorQuery) {
    return null;
  }

  return cursorQuery;
}

export function resetCursorQuery(url: URL) {
  url.searchParams.delete("cursor");
}
