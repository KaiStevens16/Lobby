import {
  easternMinutesSinceMidnight,
  formatAxisTime,
  formatShortDate,
  formatTime,
  MEMBERS,
  type DayLog,
  type Member,
} from "@/lib/types";

const MEMBER_COLORS: Record<Member, string> = {
  roman: "#a8894a",
  kai: "#c9a962",
};

type PhotoConfig = {
  src: string;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
  anchor?: "center" | "top";
};

const MEMBER_PHOTOS: Partial<Record<Member, PhotoConfig>> = {
  roman: { src: "/roman.png", zoom: 1.55, offsetY: 1, anchor: "top" },
  kai: { src: "/kai.png", zoom: 1.65, offsetY: 0, anchor: "top" },
};

const PHOTO_SIZE = 28;
const PHOTO_R = PHOTO_SIZE / 2;

function photoLayout(photo: PhotoConfig) {
  const zoom = photo.zoom ?? 1.4;
  const size = PHOTO_SIZE * zoom;
  const base = (PHOTO_SIZE - size) / 2;
  return {
    x: base + (photo.offsetX ?? 0),
    y: base + (photo.offsetY ?? 0),
    size,
    preserveAspectRatio:
      photo.anchor === "top" ? "xMidYMin slice" : "xMidYMid slice",
  };
}

const PAD = { top: 20, right: 16, bottom: 36, left: 52 };
const HEIGHT = 220;

type Props = {
  logs: DayLog[];
};

export function CheckInTimeSeries({ logs }: Props) {
  const dates = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  if (dates.length === 0) return null;

  const series = MEMBERS.map(({ id, name }) => ({
    id,
    name,
    points: dates
      .map((log, index) => {
        const checkIn = log.checkIns[id];
        if (!checkIn) return null;
        return {
          index,
          date: log.date,
          minutes: easternMinutesSinceMidnight(checkIn.timestamp),
          label: formatTime(checkIn.timestamp),
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null),
  }));

  const allMinutes = series.flatMap((s) => s.points.map((p) => p.minutes));
  if (allMinutes.length === 0) return null;

  const rawMin = Math.min(...allMinutes);
  const rawMax = Math.max(...allMinutes);
  const yMin = Math.max(0, Math.floor((rawMin - 60) / 60) * 60);
  const yMax = Math.min(24 * 60, Math.ceil((rawMax + 60) / 60) * 60);
  const yRange = Math.max(yMax - yMin, 60);

  const width = Math.max(320, dates.length * 72);
  const chartW = width - PAD.left - PAD.right;
  const chartH = HEIGHT - PAD.top - PAD.bottom;

  const xAt = (index: number) =>
    PAD.left + (dates.length === 1 ? chartW / 2 : (index / (dates.length - 1)) * chartW);
  const yAt = (minutes: number) =>
    PAD.top + ((minutes - yMin) / yRange) * chartH;

  const yTicks = Array.from(
    { length: Math.min(5, yRange / 60 + 1) },
    (_, i) => yMin + (i * yRange) / Math.max(1, Math.min(4, yRange / 60)),
  );

  const latestIndex = dates.length - 1;

  return (
    <section className="glass rounded-sm p-8 sm:p-10 mb-8">
      <p className="text-xs tracking-[0.2em] uppercase text-black/60 mb-6">
        A chart of who&apos;s been on top of their shit
      </p>

      <div className="overflow-x-auto -mx-2 px-2">
        <svg
          viewBox={`0 0 ${width} ${HEIGHT}`}
          className="w-full min-w-[320px]"
          role="img"
          aria-label="Check-in time series chart"
        >
          <defs>
            <clipPath id="member-avatar-clip">
              <circle cx={PHOTO_R} cy={PHOTO_R} r={PHOTO_R} />
            </clipPath>
          </defs>

          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={yAt(tick)}
                x2={width - PAD.right}
                y2={yAt(tick)}
                stroke="rgba(0,0,0,0.06)"
              />
              <text
                x={PAD.left - 8}
                y={yAt(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fill="rgba(0,0,0,0.6)"
                fontSize="10"
              >
                {formatAxisTime(tick)}
              </text>
            </g>
          ))}

          {dates.map((log, index) => (
            <text
              key={log.date}
              x={xAt(index)}
              y={HEIGHT - 10}
              textAnchor="middle"
              fill="rgba(0,0,0,0.65)"
              fontSize="10"
            >
              {formatShortDate(log.date)}
            </text>
          ))}

          {series.map(({ id, name, points }) => {
            const color = MEMBER_COLORS[id];
            const path = points
              .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(p.index)} ${yAt(p.minutes)}`)
              .join(" ");

            return (
              <g key={id}>
                {points.length > 1 && (
                  <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                  />
                )}
                {points.map((p) => {
                  const cx = xAt(p.index);
                  const cy = yAt(p.minutes);
                  const photo = MEMBER_PHOTOS[id];
                  const showPhoto = Boolean(photo) && p.index === latestIndex;
                  const layout = photo ? photoLayout(photo) : null;

                  return (
                    <g key={`${id}-${p.date}`}>
                      {showPhoto && layout ? (
                        <g transform={`translate(${cx - PHOTO_R}, ${cy - PHOTO_R})`}>
                          <circle
                            cx={PHOTO_R}
                            cy={PHOTO_R}
                            r={PHOTO_R + 1.5}
                            fill="#ffffff"
                            stroke={color}
                            strokeWidth="1.5"
                          />
                          <image
                            href={photo!.src}
                            x={layout.x}
                            y={layout.y}
                            width={layout.size}
                            height={layout.size}
                            clipPath="url(#member-avatar-clip)"
                            preserveAspectRatio={layout.preserveAspectRatio}
                          />
                        </g>
                      ) : (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="4"
                          fill={color}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      )}
                      <title>
                        {name} — {formatShortDate(p.date)} at {p.label}
                      </title>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex gap-6 mt-4 text-xs">
        {MEMBERS.map(({ id, name }) => (
          <span key={id} className="flex items-center gap-2 text-black/75">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: MEMBER_COLORS[id] }}
            />
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
