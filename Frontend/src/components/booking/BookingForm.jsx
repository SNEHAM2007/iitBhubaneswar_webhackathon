
import { useState } from "react";
import { CalendarDays, Clock, Users, MapPin, Send } from "lucide-react";

function BookingForm({ onSubmit, onCancel })
{
    const [formData, setFormData] = useState({
        title: "",
        requester: "",
        departmentCode: "",
        requestedCategory: "CLASSROOM",
        attendance: "",
        date: "",
        startTime: "",
        durationPeriods: "1",
        requestedRoomId: "",
        rawText: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
    {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) =>
    {
        e.preventDefault();

        if (!onSubmit || loading) return;

        try {
            setLoading(true);

            await onSubmit({
                ...formData,
                attendance: Number(formData.attendance),
                durationPeriods: Number(formData.durationPeriods),
                windows: [
                    {
                        date: formData.date,
                        startTime: formData.startTime,
                    },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Booking Title
                </label>
                <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Technical Workshop"
                    className={inputClass}
                    required
                />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Requester
                    </label>
                    <input
                        name="requester"
                        value={formData.requester}
                        onChange={handleChange}
                        placeholder="Your name or club name"
                        className={inputClass}
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Department Code
                    </label>
                    <input
                        name="departmentCode"
                        value={formData.departmentCode}
                        onChange={handleChange}
                        placeholder="e.g. CSE"
                        className={inputClass}
                        required
                    />
                </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Room Category
                    </label>
                    <select
                        name="requestedCategory"
                        value={formData.requestedCategory}
                        onChange={handleChange}
                        className={inputClass}
                    >
                        <option value="CLASSROOM">Classroom</option>
                        <option value="LAB">Computer Lab</option>
                        <option value="SEMINAR_HALL">Seminar Hall</option>
                        <option value="AUDITORIUM">Auditorium</option>
                        <option value="MEETING_ROOM">Meeting Room</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Users size={16} />
                        Expected Attendance
                    </label>
                    <input
                        type="number"
                        name="attendance"
                        min="1"
                        value={formData.attendance}
                        onChange={handleChange}
                        placeholder="Number of participants"
                        className={inputClass}
                        required
                    />
                </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CalendarDays size={16} />
                        Booking Date
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className={inputClass}
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Clock size={16} />
                        Start Time
                    </label>
                    <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className={inputClass}
                        required
                    />
                </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Duration (Periods)
                    </label>
                    <input
                        type="number"
                        name="durationPeriods"
                        min="1"
                        value={formData.durationPeriods}
                        onChange={handleChange}
                        className={inputClass}
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <MapPin size={16} />
                        Preferred Room ID (Optional)
                    </label>
                    <input
                        name="requestedRoomId"
                        value={formData.requestedRoomId}
                        onChange={handleChange}
                        placeholder="Enter room ID"
                        className={inputClass}
                    />
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Additional Requirements
                </label>
                <textarea
                    name="rawText"
                    value={formData.rawText}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe equipment, facilities or other requirements..."
                    className={inputClass}
                />
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                    <Send size={16} />
                    {loading ? "Submitting..." : "Submit Booking"}
                </button>
            </div>
        </form>
    );
}

export default BookingForm;
