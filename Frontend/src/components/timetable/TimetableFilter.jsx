
import { Filter, RotateCcw } from "lucide-react";

function TimetableFilters({
    departments = [],
    semesters = [],
    selectedDepartment,
    selectedSemester,
    view,
    onDepartmentChange,
    onSemesterChange,
    onViewChange,
    onReset,
})
{
    const selectClass =
        "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500";

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
                <Filter size={19} className="text-indigo-600" />
                <h2 className="font-semibold text-slate-800">
                    Timetable Filters
                </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <select
                    value={selectedDepartment}
                    onChange={(e) => onDepartmentChange?.(e.target.value)}
                    className={selectClass}
                >
                    <option value="">All Departments</option>
                    {departments.map((department) => (
                        <option key={department} value={department}>
                            {department}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedSemester}
                    onChange={(e) => onSemesterChange?.(e.target.value)}
                    className={selectClass}
                >
                    <option value="">All Semesters</option>
                    {semesters.map((semester) => (
                        <option key={semester} value={semester}>
                            Semester {semester}
                        </option>
                    ))}
                </select>

                <select
                    value={view}
                    onChange={(e) => onViewChange?.(e.target.value)}
                    className={selectClass}
                >
                    <option value="weekly">Weekly View</option>
                    <option value="daily">Daily View</option>
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
        </div>
    );
}

export default TimetableFilters;
