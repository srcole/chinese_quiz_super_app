import type { Attempt } from "@/lib/study";

export default function AnswerHistory({
  attempts,
  current,
}: {
  attempts: Attempt[];
  current: Attempt;
}) {
  const previous = attempts
    .filter(
      (a) =>
        a.id !== current.id &&
        a.item_id === current.item_id &&
        a.mode === current.mode &&
        a.direction === current.direction &&
        a.created_at <= current.created_at,
    )
    .sort(
      (a, b) =>
        b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id),
    )
    .slice(0, 5);

  return (
    <div className="answer-history">
      <p className="helper">
        Previous attempts · newest first · same quiz and direction
      </p>
      <ol aria-label="Previous five attempts">
        {Array.from({ length: 5 }, (_, index) => {
          const attempt = previous[index];
          const result = attempt
            ? attempt.correct
              ? "correct"
              : "incorrect"
            : "unseen";
          const date = attempt ? new Date(attempt.created_at) : null;
          const label = `${index + 1} attempt${index === 0 ? "" : "s"} ago: ${attempt ? result : "no previous attempt"}${date ? `, ${date.toLocaleDateString()}` : ""}`;
          return (
            <li
              key={index}
              className={`history-${result}`}
              aria-label={label}
              title={label}
            >
              {date && attempt ? (
                <time
                  className="history-date"
                  dateTime={attempt.created_at}
                  aria-hidden="true"
                >
                  {date.getMonth() + 1}/{date.getDate()}
                </time>
              ) : (
                <span aria-hidden="true">—</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
