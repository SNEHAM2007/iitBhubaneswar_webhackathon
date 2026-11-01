import { Filter, LayoutGrid, RotateCcw, Search, Rows3 } from "lucide-react";

function TimetableFilters({
    departments = [],
    years = [],
    selectedDepartment,
    selectedYear,
    search,
    view,
    resultCount,
    onDepartmentChange,
    onYearChange,
    onSearchChange,
    onViewChange,
    onReset,
})
{
    const selectClass =
        "min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

    return (
        <section
            aria-label="Timetable filters"
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
        >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <div className="flex shrink-0 items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Filter size={17} />
                    </span>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">
                            Find a class
                        </h2>
                        <p className="text-xs text-slate-500">
                            {resultCount} {resultCount === 1 ? "result" : "results"}
                        </p>
                    </div>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_170px_145px_auto]">
                    <label className="relative">
                        <Search
                            size={17}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => onSearchChange?.(event.target.value)}
                            placeholder="Course, faculty or room"
                            aria-label="Search courses, faculty or rooms"
                            className={`${selectClass} w-full pl-10`}
                        />
                    </label>

                    <select
                        value={selectedDepartment}
                        onChange={(event) => onDepartmentChange?.(event.target.value)}
                        aria-label="Filter by department"
                        className={selectClass}
                    >
                        <option value="">All departments</option>
                        {departments.map((department) => (
                            <option key={department} value={department}>
                                {department}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedYear}
                        onChange={(event) => onYearChange?.(event.target.value)}
                        aria-label="Filter by year"
                        className={selectClass}
                    >
                        <option value="">All years</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                Year {year}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center gap-2">
                        <div
                            className="flex flex-1 rounded-xl bg-slate-100 p-1 sm:flex-none"
                            role="group"
                            aria-label="Schedule view"
                        >
                            <button
                                type="button"
                                onClick={() => onViewChange?.("weekly")}
                                aria-pressed={view === "weekly"}
                                className={`inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition sm:flex-none ${
                                    view === "weekly"
                                        ? "bg-white text-indigo-700 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                <LayoutGrid size={15} />
                                Week
                            </button>
                            <button
                                type="button"
                                onClick={() => onViewChange?.("daily")}
                                aria-pressed={view === "daily"}
                                className={`inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition sm:flex-none ${
                                    view === "daily"
                                        ? "bg-white text-indigo-700 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                <Rows3 size={15} />
                                Day
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={onReset}
                            disabled={!search && !selectedDepartment && !selectedYear}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <RotateCcw size={15} />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TimetableFilters;
