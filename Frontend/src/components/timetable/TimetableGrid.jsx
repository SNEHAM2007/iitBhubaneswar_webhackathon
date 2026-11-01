const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TIME_SLOTS = [
    { start: "08:00", label: "08:00 – 09:00" },
    { start: "09:00", label: "09:00 – 10:00" },
    { start: "10:00", label: "10:00 – 11:00" },
    { start: "11:00", label: "11:00 – 12:00" },
    { start: "12:00", label: "12:00 – 13:00" },
    { start: "14:00", label: "14:00 – 15:00" },
    { start: "15:00", label: "15:00 – 16:00" },
    { start: "16:00", label: "16:00 – 17:00" },
    { start: "17:00", label: "17:00 – 18:00" },
];

const DAY_ACCENTS = [
    "bg-indigo-100 text-indigo-700",
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
];

function TimetableGrid({ entries = [], onEntryClick })
{
    const entriesByCell = new Map();

    for (const entry of entries)
    {
        const key = `${entry.day}-${entry.startTime}`;
        const cellEntries = entriesByCell.get(key) || [];
        cellEntries.push(entry);
        entriesByCell.set(key, cellEntries);
    }

    const dayCounts = DAYS.map(
        (day) => entries.filter((entry) => entry.day === day).length
    );

    return (
        <div
            className="overflow-x-auto"
            role="region"
            aria-label="Weekly timetable grid"
            tabIndex={0}
        >
            <table className="w-full min-w-[1050px] border-collapse text-sm">
                <thead>
                    <tr className="bg-slate-50/80">
                        <th
                            scope="col"
                            className="sticky left-0 z-10 w-36 border-b border-r border-slate-200 bg-slate-50 px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                            Time
                        </th>
                        {DAYS.map((day, index) => (
                            <th
                                key={day}
                                scope="col"
                                className="min-w-44 border-b border-r border-slate-200 px-4 py-3 text-left"
                            >
                                <span className="block font-semibold text-slate-800">
                                    {day}
                                </span>
                                <span className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                    <span className={`h-1.5 w-1.5 rounded-full ${DAY_ACCENTS[index].split(" ")[0]}`} />
                                    {dayCounts[index]} {dayCounts[index] === 1 ? "class" : "classes"}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {TIME_SLOTS.map((time, rowIndex) => (
                        <tr key={time.start} className="group">
                            <th
                                scope="row"
                                className="sticky left-0 z-10 whitespace-nowrap border-b border-r border-slate-100 bg-white px-4 py-3 text-left align-top text-xs font-medium tabular-nums text-slate-500 group-hover:bg-slate-50"
                            >
                                <span>{time.label}</span>
                                {time.start === "14:00" && (
                                    <span className="mt-2 block text-[10px] font-medium uppercase tracking-wide text-amber-600">
                                        After lunch
                                    </span>
                                )}
                            </th>

                            {DAYS.map((day, dayIndex) =>
                            {
                                const cellEntries =
                                    entriesByCell.get(`${day}-${time.start}`) || [];

                                return (
                                    <td
                                        key={`${day}-${time.start}`}
                                        className={`min-h-24 border-b border-r border-slate-100 p-2 align-top transition-colors group-hover:bg-slate-50/60 ${
                                            rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                                        }`}
                                    >
                                        {cellEntries.length ? (
                                            <div className="space-y-2">
                                                {cellEntries.map((entry) => (
                                                    <button
                                                        key={entry.id}
                                                        type="button"
                                                        onClick={() => onEntryClick?.(entry)}
                                                        aria-label={`${entry.courseCode}, ${entry.subject}, ${entry.time}, ${entry.room}`}
                                                        className={`w-full rounded-xl border border-transparent p-3 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${DAY_ACCENTS[dayIndex]}`}
                                                    >
                                                        <span className="flex items-start justify-between gap-2">
                                                            <span className="line-clamp-2 text-xs font-bold leading-4">
                                                                {entry.courseCode}
                                                            </span>
                                                            {entry.duration > 1 && (
                                                                <span className="shrink-0 rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold">
                                                                    {entry.duration}h
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="mt-1 block line-clamp-2 text-xs leading-4 text-slate-700">
                                                            {entry.subject}
                                                        </span>
                                                        <span className="mt-2 block truncate text-[11px] text-slate-600">
                                                            {entry.faculty}
                                                        </span>
                                                        <span className="mt-1 block truncate text-[11px] font-medium text-slate-700">
                                                            {entry.room}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div
                                                aria-hidden="true"
                                                className="flex min-h-20 items-center justify-center text-slate-200"
                                            >
                                                <span className="h-px w-4 bg-slate-100" />
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TimetableGrid;
