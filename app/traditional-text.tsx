export default function TraditionalText({
  traditional,
  simplified,
}: {
  traditional: string;
  simplified: string;
}) {
  const simp = Array.from(simplified);
  return (
    <span lang="zh-Hant">
      {Array.from(traditional).map((c, i) => (
        <span
          key={i}
          className={c !== simp[i] ? "traditional-different" : undefined}
        >
          {c}
        </span>
      ))}
    </span>
  );
}
