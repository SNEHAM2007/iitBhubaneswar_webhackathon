
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TIME_SLOTS = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 01:00",
    "02:00 - 03:00",
    "03:00 - 04:00",
];

function TimetableGrid({ entries = [], onEntryClick })
{
    const getEntry = (day, time) =>
        entries.find(
            (entry) => entry.day === day && entry.time === time
        );

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                    <tr className="bg-slate-50">
                        <th className="border-b border-r border-slate-200 p-4 text-left">
                            Time
                        </th>

                        {DAYS.map((day) => (
                            <th
                                key={day}
                                className="border-b border-r border-slate-200 p-4 text-center font-semibold text-slate-700"
                            >
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {TIME_SLOTS.map((time) => (
                        <tr key={time}>
                            <td className="whitespace-nowrap border-b border-r border-slate-200 bg-slate-50 p-4 font-medium text-slate-600">
                                {time}
                            </td>

                            {DAYS.map((day) =>
                            {
                                const entry = getEntry(day, time);

                                return (
                                    <td
                                        key={`${day}-${time}`}
                                        className="h-24 border-b border-r border-slate-200 p-2 align-top"
                                    >
                                        {entry ? (
                                            <button
                                                type="button"
                                                onClick={() => onEntryClick?.(entry)}
                                                className="h-full w-full rounded-lg bg-indigo-50 p-2 text-left transition hover:bg-indigo-100"
                                            >
                                                <p className="font-semibold text-indigo-800">
                                                    {entry.subject}
                                                </p>

                                                <p className="mt-1 text-xs text-indigo-600">
                                                    {entry.faculty || "Faculty not assigned"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {entry.room || "Room not assigned"}
                                                </p>
                                            </button>
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-slate-300">
                                                —
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
