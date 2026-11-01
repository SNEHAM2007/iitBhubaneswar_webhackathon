
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

import TimetableGrid from "../components/timetable/TimetableGrid";
import TimetableFilters from "../components/timetable/TimetableFilters";
import TimetableDetails from "../components/timetable/TimetableDetails";

function Timetable()
{
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [view, setView] = useState("weekly");
    const [selectedEntry, setSelectedEntry] = useState(null);

    // Temporary sample entries until the timetable API is connected.
    const entries = [
        {
            id: 1,
            day: "Monday",
            time: "09:00 - 10:00",
            subject: "Data Structures",
            faculty: "Dr. Sharma",
            room: "Room 101",
            department: "CSE",
            semester: "3",
        },
        {
            id: 2,
            day: "Monday",
            time: "10:00 - 11:00",
            subject: "Database Management",
            faculty: "Prof. Das",
            room: "Room 204",
            department: "CSE",
            semester: "3",
        },
        {
            id: 3,
            day: "Tuesday",
            time: "11:00 - 12:00",
            subject: "Operating Systems",
            faculty: "Dr. Mohanty",
            room: "Room 105",
            department: "CSE",
            semester: "5",
        },
        {
            id: 4,
            day: "Wednesday",
            time: "09:00 - 10:00",
            subject: "Computer Networks",
            faculty: "Prof. Mishra",
            room: "Room 202",
            department: "CSE",
            semester: "5",
        },
        {
            id: 5,
            day: "Thursday",
            time: "02:00 - 03:00",
            subject: "Software Engineering",
            faculty: "Dr. Patnaik",
            room: "Room 301",
            department: "IT",
            semester: "3",
        },
        {
            id: 6,
            day: "Friday",
            time: "03:00 - 04:00",
            subject: "Computer Architecture",
            faculty: "Prof. Sahu",
            room: "Room 103",
            department: "CSE",
            semester: "5",
        },
    ];

    const departments = ["CSE", "IT"];
    const semesters = ["3", "5"];

    const filteredEntries = useMemo(() =>
    {
        return entries.filter((entry) =>
        {
            const departmentMatch =
                !selectedDepartment ||
                entry.department === selectedDepartment;

            const semesterMatch =
                !selectedSemester ||
                entry.semester === selectedSemester;

            return departmentMatch && semesterMatch;
        });
    }, [selectedDepartment, selectedSemester]);

    const formatWeek = () =>
    {
        const today = new Date();
        const monday = new Date(today);

        monday.setDate(
            today.getDate() -
            ((today.getDay() + 6) % 7) +
            weekOffset * 7
        );

        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);

        return `${monday.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
        })} - ${friday.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })}`;
    };

    const resetFilters = () =>
    {
        setSelectedDepartment("");
        setSelectedSemester("");
        setView("weekly");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Academic Timetable
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        View classes by department and semester.
                    </p>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
                    <button
                        type="button"
                        onClick={() => setWeekOffset((value) => value - 1)}
                        className="rounded-lg p-2 hover:bg-slate-100"
                        aria-label="Previous week"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <span className="min-w-36 text-center text-sm font-semibold text-slate-700">
                        {formatWeek()}
                    </span>

                    <button
                        type="button"
                        onClick={() => setWeekOffset((value) => value + 1)}
                        className="rounded-lg p-2 hover:bg-slate-100"
                        aria-label="Next week"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-indigo-600">
                <CalendarDays size={18} />
                <span>Weekly academic schedule</span>
            </div>

            <TimetableFilters
                departments={departments}
                semesters={semesters}
                selectedDepartment={selectedDepartment}
                selectedSemester={selectedSemester}
                view={view}
                onDepartmentChange={setSelectedDepartment}
                onSemesterChange={setSelectedSemester}
                onViewChange={setView}
                onReset={resetFilters}
            />

            {view === "weekly" ? (
                <TimetableGrid
                    entries={filteredEntries}
                    onEntryClick={setSelectedEntry}
                />
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="text-sm text-slate-500">
                        Daily view will be implemented with the timetable API.
                    </p>
                </div>
            )}

            <TimetableDetails
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
            />
        </div>
    );
}

export default Timetable;
