// Minimal inline markup for lesson text: **bold**, *italic* and `code`.
export function tokenize(text) {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s](?:[^*]*[^*\s])?\*)/g)
    .filter(Boolean)
    .map((t) =>
      /^\*\*[^*]+\*\*$/.test(t) ? { b: t.slice(2, -2) } : /^`[^`]+`$/.test(t) ? { c: t.slice(1, -1) } : /^\*[^*\s](?:[^*]*[^*\s])?\*$/.test(t) ? { i: t.slice(1, -1) } : { t }
    );
}
