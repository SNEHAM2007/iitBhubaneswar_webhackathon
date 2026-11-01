import { Filter, RotateCcw, Search } from "lucide-react";

function ExamFilters({
    search,
    status,
    onSearchChange,
    onStatusChange,
    onReset,
})
{
    const inputClass =
        "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500";

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
                <Filter size={19} className="text-indigo-600" />
                <h2 className="font-semibold text-slate-800">
                    Exam Filters
                </h2>
            </div>

            <label className="relative flex-1">
                <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                    type="search"
                    value={search}
                    onChange={(event) => onSearchChange?.(event.target.value)}
                    placeholder="Search exams or course codes"
                    className={`${inputClass} w-full pl-10`}
                />
            </label>

            <select
                value={status}
                onChange={(event) => onStatusChange?.(event.target.value)}
                className={inputClass}
            >
                <option value="ALL">All statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
            </select>

            <button
                type="button"
                onClick={onReset}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
                <RotateCcw size={16} />
                Reset
            </button>
        </div>
    );
}

export default ExamFilters;