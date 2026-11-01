import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    BookOpen,
    Building2,
    CalendarDays,
    Check,
    Clock3,
    RefreshCw,
    Search,
    Sparkles,
    Users,
    X,
} from "lucide-react";

import TimetableGrid from "../components/timetable/TimetableGrid";
import TimetableFilters from "../components/timetable/TimetableFilter";
import TimetableDetails from "../components/timetable/TimetableDetails";
import { generateTimetable, getLatestTimetable } from "../services/scheduling";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function Timetable()
{
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedDay, setSelectedDay] = useState(DAYS[0]);
    const [search, setSearch] = useState("");
    const [view, setView] = useState("weekly");
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [entries, setEntries] = useState([]);
    const [solverStatus, setSolverStatus] = useState("");
    const [lastGenerated, setLastGenerated] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState("");

    const loadSchedule = useCallback(async () =>
    {
        try
        {
            setInitialLoading(true);
            const result = await getLatestTimetable();

            if (Array.isArray(result?.timetable) && result.timetable.length > 0)
            {
                setEntries(result.timetable);
                setSolverStatus(result.solver_status || "OPTIMAL");
                if (result.generatedAt)
                {
                    setLastGenerated(new Date(result.generatedAt));
                }
            }
        }
        catch (requestError)
        {
            console.warn("Could not load initial timetable:", requestError);
        }
        finally
        {
            setInitialLoading(false);
        }
    }, []);

    useEffect(() =>
    {
        loadSchedule();
    }, [loadSchedule]);

    const departments = useMemo(
        () => [...new Set(entries.map((entry) => entry.department))].sort(),
        [entries]
    );
    const years = useMemo(
        () => [...new Set(entries.map((entry) => String(entry.year)))].sort(),
        [entries]
    );

    const filteredEntries = useMemo(() =>
    {
        const searchTerm = search.trim().toLowerCase();

        return entries.filter((entry) =>
        {
            const departmentMatch =
                !selectedDepartment ||
                entry.department === selectedDepartment;
            const yearMatch =
                !selectedYear ||
                String(entry.year) === selectedYear;
            const searchMatch =
                !searchTerm ||
                [
                    entry.courseCode,
                    entry.subject,
                    entry.faculty,
                    entry.room,
                    entry.department,
                ]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(searchTerm));

            return departmentMatch && yearMatch && searchMatch;
        });
    }, [entries, search, selectedDepartment, selectedYear]);

    const dailyEntries = useMemo(
        () => filteredEntries
            .filter((entry) => entry.day === selectedDay)
            .sort((first, second) =>
                first.startTime.localeCompare(second.startTime)
            ),
        [filteredEntries, selectedDay]
    );

    const handleGenerate = async () =>
    {
        try
        {
            setGenerating(true);
            setError("");

            const result = await generateTimetable();

            if (!Array.isArray(result?.timetable))
            {
                throw new Error("The scheduling service returned an invalid timetable.");
            }

            setEntries(result.timetable);
            setSolverStatus(result.solver_status || "");
            setLastGenerated(new Date());
        }
        catch (requestError)
        {
            setError(
                requestError.response?.data?.detail ||
                requestError.response?.data?.message ||
                requestError.message ||
                "Unable to generate the timetable."
            );
        }
        finally
        {
            setGenerating(false);
        }
    };

    const resetFilters = () =>
    {
        setSelectedDepartment("");
        setSelectedYear("");
        setSearch("");
    };

    const sessionsToday = filteredEntries.filter(
        (entry) => entry.day === selectedDay
    ).length;

    const statCards = [
        {
            label: "Scheduled sessions",
            value: entries.length,
            note: "Across the full week",
            icon: BookOpen,
            iconClass: "bg-indigo-50 text-indigo-600",
        },
        {
            label: "Departments",
            value: new Set(entries.map((entry) => entry.department)).size,
            note: "Represented in this schedule",
            icon: Building2,
            iconClass: "bg-sky-50 text-sky-600",
        },
        {
            label: "Student years",
            value: new Set(entries.map((entry) => entry.year)).size,
            note: "With scheduled classes",
            icon: Users,
            iconClass: "bg-violet-50 text-violet-600",
        },
        {
            label: "Sessions today",
            value: sessionsToday,
            note: selectedDay,
            icon: Clock3,
            iconClass: "bg-emerald-50 text-emerald-600",
        },
    ];

    return (
        <div className="mx-auto max-w-[1600px] space-y-6">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 px-6 py-7 text-white shadow-lg sm:px-8 sm:py-9">
                <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
                <div className="pointer-events-none absolute bottom-[-8rem] right-1/3 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div className="max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100">
                            <CalendarDays size={14} />
                            Monday – Friday · Academic schedule
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Timetable
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100/80 sm:text-base">
                            Your campus week, organized. Generate a conflict-aware
                            schedule, then find a class by course, faculty, room,
                            department or year.
                        </p>
                        {lastGenerated && (
                            <p className="mt-4 flex items-center gap-2 text-xs text-indigo-100/70">
                                <Check size={14} />
                                Updated {lastGenerated.toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                })}
                                {solverStatus && ` · ${solverStatus.toLowerCase()}`}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={generating || initialLoading}
                        className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-950 shadow-md transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {generating ? (
                            <RefreshCw size={17} className="animate-spin" />
                        ) : (
                            <Sparkles size={17} />
                        )}
                        {generating
                            ? "Building your schedule..."
                            : entries.length
                                ? "Regenerate schedule"
                                : "Generate schedule"}
                    </button>
                </div>
            </section>

            {error && (
                <div
                    role="alert"
                    className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />
                        <div>
                            <p className="font-semibold">Schedule could not be updated</p>
                            <p className="mt-1 text-red-700">{error}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={generating}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                        <RefreshCw size={15} />
                        Try again
                    </button>
                </div>
            )}

            <section
                aria-label="Schedule summary"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                {statCards.map(({ label, value, note, icon: Icon, iconClass }) => (
                    <div
                        key={label}
                        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    {label}
                                </p>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                    {value}
                                </p>
                            </div>
                            <span className={`rounded-xl p-3 ${iconClass}`}>
                                <Icon size={20} />
                            </span>
                        </div>
                        <p className="mt-3 text-xs text-slate-500">{note}</p>
                    </div>
                ))}
            </section>

            <TimetableFilters
                departments={departments}
                years={years}
                selectedDepartment={selectedDepartment}
                selectedYear={selectedYear}
                search={search}
                view={view}
                resultCount={filteredEntries.length}
                onDepartmentChange={setSelectedDepartment}
                onYearChange={setSelectedYear}
                onSearchChange={setSearch}
                onViewChange={setView}
                onReset={resetFilters}
            />

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            {view === "weekly" ? "Weekly schedule" : `${selectedDay} schedule`}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            {entries.length
                                ? `${filteredEntries.length} of ${entries.length} sessions shown`
                                : "Your generated classes will appear here"}
                        </p>
                    </div>
                    {view === "daily" && entries.length > 0 && (
                        <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
                            {DAYS.map((day) => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => setSelectedDay(day)}
                                    aria-pressed={selectedDay === day}
                                    className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                        selectedDay === day
                                            ? "bg-white text-indigo-700 shadow-sm"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    {day.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {generating && entries.length > 0 && (
                    <div className="flex items-center gap-2 border-b border-indigo-100 bg-indigo-50 px-5 py-2.5 text-xs font-medium text-indigo-700">
                        <RefreshCw size={14} className="animate-spin" />
                        Generating an updated schedule. Your current timetable is still available.
                    </div>
                )}

                {initialLoading ? (
                    <div className="px-6 py-16 text-center sm:py-20">
                        <RefreshCw size={28} className="mx-auto animate-spin text-indigo-600" />
                        <h3 className="mt-4 font-semibold text-slate-800">
                            Loading campus timetable...
                        </h3>
                    </div>
                ) : !entries.length ? (
                    <div className="px-6 py-16 text-center sm:py-20">
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            {generating
                                ? <RefreshCw size={24} className="animate-spin" />
                                : <CalendarDays size={24} />}
                        </span>
                        <h3 className="mt-5 text-lg font-semibold text-slate-900">
                            {generating ? "Creating your timetable" : "No timetable yet"}
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            {generating
                                ? "The scheduler is placing classes while checking faculty, room and student-group conflicts."
                                : "Generate a schedule to see classes, rooms and faculty assignments for the week."}
                        </p>
                        {!generating && (
                            <button
                                type="button"
                                onClick={handleGenerate}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                <Sparkles size={16} />
                                Generate timetable
                            </button>
                        )}
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <Search size={22} className="mx-auto text-slate-400" />
                        <h3 className="mt-3 font-semibold text-slate-800">
                            No matching classes
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Try another search or clear the selected filters.
                        </p>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                        >
                            <X size={15} />
                            Clear filters
                        </button>
                    </div>
                ) : view === "weekly" ? (
                    <TimetableGrid
                        entries={filteredEntries}
                        onEntryClick={setSelectedEntry}
                    />
                ) : dailyEntries.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <CalendarDays size={22} className="mx-auto text-slate-400" />
                        <h3 className="mt-3 font-semibold text-slate-800">
                            Nothing scheduled on {selectedDay}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Choose another day to see its classes.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 px-5 sm:px-6">
                        {dailyEntries.map((entry) => (
                            <button
                                key={entry.id}
                                type="button"
                                onClick={() => setSelectedEntry(entry)}
                                className="group flex w-full flex-col gap-3 py-4 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center"
                            >
                                <span className="w-32 shrink-0 text-sm font-semibold tabular-nums text-indigo-700">
                                    {entry.time}
                                </span>
                                <span className="hidden h-10 w-1 shrink-0 rounded-full bg-indigo-200 group-hover:bg-indigo-500 sm:block" />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-semibold text-slate-900">
                                        {entry.subject}
                                    </span>
                                    <span className="mt-1 block text-xs text-slate-500">
                                        {entry.courseCode} · {entry.department} · Year {entry.year}
                                        {entry.duration > 1 && ` · ${entry.duration} hours`}
                                    </span>
                                </span>
                                <span className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 sm:justify-end">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Users size={14} />
                                        {entry.faculty}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Building2 size={14} />
                                        {entry.room}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <TimetableDetails
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
            />
        </div>
    );
}

export default Timetable;
