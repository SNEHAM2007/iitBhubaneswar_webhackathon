
import { Search, RotateCcw } from "lucide-react";

function ReschedulingFilters({
    search = "",
    status = "ALL",
    onSearchChange,
    onStatusChange,
    onReset,
})
{
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(event) => onSearchChange?.(event.target.value)}
                    placeholder="Search by title or requester..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
            </div>

            <select
                value={status}
                onChange={(event) => onStatusChange?.(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="COMPLETED">Completed</option>
            </select>

            <button
                type="button"
                onClick={onReset}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
                <RotateCcw size={16} />
                Reset
            </button>
        </div>
    );
}

export default ReschedulingFilters;
