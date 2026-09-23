/** Letter-by-letter vertical roll on hover. Pure CSS; put `roll-host` on the interactive parent. */
export function RollText({ text }: { text: string }) {
  const letters = [...text];
  const row = (clone: boolean) => (
    <span className={`roll__row${clone ? " roll__row--clone" : ""}`}>
      {letters.map((ch, i) => (
        <span key={i} className="roll__ch" style={{ "--i": i } as React.CSSProperties}>
          {ch}
        </span>
      ))}
    </span>
  );
  return (
    <>
      <span className="roll" aria-hidden="true">
        {row(false)}
        {row(true)}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
