
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, X, RefreshCw } from "lucide-react";

import ExamCard from "../components/exams/ExamCard";
import ExamFilters from "../components/exams/ExamFilter";
import ExamDetails from "../components/exams/ExamDetails.jsx";
import ExamSummary from "../components/exams/ExamSummary";

import { getExams, createExam } from "../services/exam";

const initialForm = {
    subject: "",
    courseCode: "",
    date: "",
    startTime: "",
    room: "",
    studentCount: "",
    duration: "",
    department: "",
};

function normalizeExams(response)
{
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.exams)) return response.exams;
    if (Array.isArray(response?.data?.exams)) return response.data.exams;
    if (Array.isArray(response?.data)) return response.data;

    throw new Error("Invalid exams response received from the server.");
}

function Exams()
{
    const [exams, setExams] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [selectedExam, setSelectedExam] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(initialForm);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadExams = useCallback(async () =>
    {
        try {
            setLoading(true);
            setError("");

            const response = await getExams();
            setExams(normalizeExams(response));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load examinations."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() =>
    {
        loadExams();
    }, [loadExams]);

    const filteredExams = useMemo(() =>
    {
        return exams.filter((exam) =>
        {
            const examStatus = (exam.status || "SCHEDULED").toUpperCase();

            const matchesStatus =
                status === "ALL" || examStatus === status;

            const searchText = search.trim().toLowerCase();

            const matchesSearch =
                !searchText ||
                (exam.subject || exam.title || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (exam.courseCode || exam.code || "")
                    .toLowerCase()
                    .includes(searchText);

            return matchesStatus && matchesSearch;
        });
    }, [exams, search, status]);

    const handleCreateExam = async (event) =>
    {
        event.preventDefault();

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            await createExam({
                ...form,
                studentCount: Number(form.studentCount),
            });

            setForm(initialForm);
            setShowForm(false);
            setSuccess("Examination created successfully.");

            await loadExams();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to create examination."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const resetFilters = () =>
    {
        setSearch("");
        setStatus("ALL");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Exam Scheduling
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        View and manage campus examination schedules.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={loadExams}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowForm((current) => !current)}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        {showForm ? <X size={17} /> : <Plus size={17} />}
                        {showForm ? "Close Form" : "Create Exam"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    {success}
                </div>
            )}

            {showForm && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold text-slate-800">
                        Create Examination
                    </h2>

                    <form
                        onSubmit={handleCreateExam}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    >
                        <input
                            required
                            placeholder="Subject name"
                            value={form.subject}
                            onChange={(event) =>
                                setForm({ ...form, subject: event.target.value })
                            }
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />

                        <input
                            required
                            placeholder="Course code"
                            value={form.courseCode}
                            onChange={(event) =>
                                setForm({ ...form, courseCode: event.target.value })
                            }
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />

                        <input
                            required
                            type="date"
                            value={form.date}
                            onChange={(event) =>
                                setForm({ ...form, date: event.target.value })
                            }
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />

                        <input
                            required
                            type="time"
                            value={form.startTime}
                            onChange={(event) =>
                                setForm({ ...form, startTime: event.target.value })
                            }
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />

                        <input
                            required
                            placeholder="Examination room"
                            value={form.room}
                            onChange={(event) =>
                                setForm({ ...form, room: event.target.value })
                            }
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />

                        <input
                            required
                            type="number"
                            min="1"
                            placeholder="Number of students"
                            value={form.studentCount}
                            onChange={(event) =>
                                setForm({ ...form, studentCount: event.target.value })
                            }
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />

                        <input
                            required
                            placeholder="Duration"
                            value={form.duration}
                            onChange={(event) =>
                                setForm({ ...form, duration: event.target.value })
                            }
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />

                        <input
                            required
                            placeholder="Department"
                            value={form.department}
                            onChange={(event) =>
                                setForm({ ...form, department: event.target.value })
                            }
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />

                        <div className="flex justify-end gap-3 sm:col-span-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {submitting ? "Saving..." : "Create Exam"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <ExamSummary exams={exams} />

            <ExamFilters
                search={search}
                status={status}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onReset={resetFilters}
            />

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                    Examination List
                </h2>
                <span className="text-sm text-slate-500">
                    {filteredExams.length} result(s)
                </span>
            </div>

            {loading ? (
                <div className="rounded-xl bg-white p-8 text-center text-slate-500">
                    Loading examinations...
                </div>
            ) : filteredExams.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                    No examinations found.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredExams.map((exam) => (
                        <ExamCard
                            key={exam.id}
                            exam={exam}
                            onView={setSelectedExam}
                        />
                    ))}
                </div>
            )}

            {selectedExam && (
                <ExamDetails
                    exam={selectedExam}
                    onClose={() => setSelectedExam(null)}
                />
            )}
        </div>
    );
}

export default Exams;
