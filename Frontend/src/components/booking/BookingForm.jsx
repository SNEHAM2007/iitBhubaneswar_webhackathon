
import { useState } from "react";
import { CalendarDays, Clock, Users, MapPin, Send } from "lucide-react";

function BookingForm({ onSubmit, onCancel, initialData, loading: parentLoading = false })
{
    const [formData, setFormData] = useState(() => ({
        title: initialData?.title || "",
        requester: initialData?.requester || "",
        departmentCode: initialData?.departmentCode || "",
        requestedCategory: initialData?.requestedCategory || "CLASSROOM",
        attendance: initialData?.attendance || "",
        date: initialData?.date || "",
        startTime: initialData?.startTime || "",
        durationPeriods: initialData?.durationPeriods || "1",
        requestedRoomId: initialData?.requestedRoomId || "",
        roomTypes: initialData?.roomTypes || [],
        needs: initialData?.needs || [],
        mandatoryGroupIds: initialData?.mandatoryGroupIds || [],
        rawText: initialData?.rawText || "",
    }));

    const [submitting, setSubmitting] = useState(false);

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

        if (!onSubmit || submitting || parentLoading) return;

        try {
            setSubmitting(true);

            await onSubmit({
                ...formData,
                attendance: Number(formData.attendance),
                durationPeriods: Number(formData.durationPeriods),
                roomTypes: parseList(formData.roomTypes),
                needs: parseList(formData.needs),
                mandatoryGroupIds: parseList(formData.mandatoryGroupIds),
                windows: [
                    {
                        date: formData.date,
                        startTime: formData.startTime,
                    },
                ],
            });
        } finally {
            setSubmitting(false);
        }
    };

    const parseList = (value) =>
        (Array.isArray(value) ? value : String(value || "").split(","))
            .map((item) => item.trim())
            .filter(Boolean);

    const isLoading = submitting || parentLoading;
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

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Suitable Room Types
                    </label>
                    <input
                        name="roomTypes"
                        value={Array.isArray(formData.roomTypes) ? formData.roomTypes.join(", ") : formData.roomTypes}
                        onChange={handleChange}
                        placeholder="e.g. seminar_hall, auditorium"
                        className={inputClass}
                    />
                    <p className="mt-1 text-xs text-slate-500">Separate multiple types with commas.</p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Facilities and Needs
                    </label>
                    <input
                        name="needs"
                        value={Array.isArray(formData.needs) ? formData.needs.join(", ") : formData.needs}
                        onChange={handleChange}
                        placeholder="e.g. projector, pa_system, accessible"
                        className={inputClass}
                    />
                    <p className="mt-1 text-xs text-slate-500">Separate multiple needs with commas.</p>
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Mandatory Student Group IDs (Optional)
                </label>
                <input
                    name="mandatoryGroupIds"
                    value={Array.isArray(formData.mandatoryGroupIds) ? formData.mandatoryGroupIds.join(", ") : formData.mandatoryGroupIds}
                    onChange={handleChange}
                    placeholder="e.g. Y3-CSE-A, Y3-CSE-B"
                    className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-500">Separate multiple group IDs with commas.</p>
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
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                    <Send size={16} />
                    {isLoading ? "Submitting..." : "Submit Booking"}
                </button>
            </div>
        </form>
    );
}

export default BookingForm;
