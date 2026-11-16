import { tokenize } from "../lib/tokenize";

function Inline({ text }) {
  return tokenize(text).map((tok, i) =>
    tok.b ? <strong key={i}>{tok.b}</strong> : tok.c ? <code key={i}>{tok.c}</code> : tok.i ? <em key={i}>{tok.i}</em> : tok.t
  );
}

// Lines starting with "- " become a bullet list; every other non-empty line is a paragraph.
export default function Prose({ text }) {
  const blocks = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const bullet = line.match(/^- (.*)/);
    const last = blocks[blocks.length - 1];
    if (!bullet) blocks.push({ p: line });
    else if (last?.ul) last.ul.push(bullet[1]);
    else blocks.push({ ul: [bullet[1]] });
  }
  return (
    <div className="prose">
      {blocks.map((b, i) =>
        b.ul ? (
          <ul key={i}>
            {b.ul.map((item, j) => (
              <li key={j}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            <Inline text={b.p} />
          </p>
        )
      )}
    </div>
  );
}
