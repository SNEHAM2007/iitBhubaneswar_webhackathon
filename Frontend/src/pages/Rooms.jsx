
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, X, RefreshCw } from "lucide-react";

import RoomCard from "../components/rooms/RoomCard";
import RoomFilters from "../components/rooms/RoomFilters";
import RoomDetails from "../components/rooms/RoomDetails";
import RoomSummary from "../components/rooms/RoomSummary";

import { getRooms, createRoom } from "../services/room";

const initialForm = {
    name: "",
    type: "CLASSROOM",
    capacity: "",
    building: "",
};

function normalizeRooms(response)
{
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.rooms)) return response.rooms;
    if (Array.isArray(response?.data?.rooms)) return response.data.rooms;
    if (Array.isArray(response?.data)) return response.data;

    throw new Error("Invalid rooms response received from the server.");
}

function Rooms()
{
    const [rooms, setRooms] = useState([]);
    const [search, setSearch] = useState("");
    const [type, setType] = useState("ALL");
    const [availability, setAvailability] = useState("ALL");

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(initialForm);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadRooms = useCallback(async () =>
    {
        try {
            setLoading(true);
            setError("");

            const response = await getRooms();
            setRooms(normalizeRooms(response));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load rooms."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() =>
    {
        loadRooms();
    }, [loadRooms]);

    const filteredRooms = useMemo(() =>
    {
        return rooms.filter((room) =>
        {
            const roomType = (room.type || room.category || "").toUpperCase();
            const available = room.isAvailable ?? room.available ?? true;

            const matchesType = type === "ALL" || roomType === type;

            const matchesAvailability =
                availability === "ALL" ||
                (availability === "AVAILABLE" && available) ||
                (availability === "UNAVAILABLE" && !available);

            const searchText = search.trim().toLowerCase();

            const matchesSearch =
                !searchText ||
                (room.name || room.roomNumber || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (room.building || room.location || "")
                    .toLowerCase()
                    .includes(searchText);

            return matchesType && matchesAvailability && matchesSearch;
        });
    }, [rooms, search, type, availability]);

    const handleCreateRoom = async (event) =>
    {
        event.preventDefault();

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            await createRoom({
                ...form,
                capacity: Number(form.capacity),
            });

            setForm(initialForm);
            setShowForm(false);
            setSuccess("Room created successfully.");

            await loadRooms();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to create room."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const resetFilters = () =>
    {
        setSearch("");
        setType("ALL");
        setAvailability("ALL");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Room Management
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage classrooms, laboratories, and campus facilities.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={loadRooms}
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
                        {showForm ? "Close Form" : "Add Room"}
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
                    <h2 className="mb-4 text-lg font-semibold text-slate-800">
                        Add New Room
                    </h2>

                    <form
                        onSubmit={handleCreateRoom}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    >
                        <input
                            required
                            maxLength={100}
                            placeholder="Room name"
                            value={form.name}
                            onChange={(event) =>
                                setForm({ ...form, name: event.target.value })
                            }
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />

                        <select
                            required
                            value={form.type}
                            onChange={(event) =>
                                setForm({ ...form, type: event.target.value })
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        >
                            <option value="CLASSROOM">Classroom</option>
                            <option value="LAB">Laboratory</option>
                            <option value="AUDITORIUM">Auditorium</option>
                            <option value="SEMINAR_HALL">Seminar Hall</option>
                        </select>

                        <input
                            required
                            type="number"
                            min="1"
                            value={form.capacity}
                            onChange={(event) =>
                                setForm({ ...form, capacity: event.target.value })
                            }
                            placeholder="Capacity"
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />

                        <input
                            required
                            maxLength={100}
                            value={form.building}
                            onChange={(event) =>
                                setForm({ ...form, building: event.target.value })
                            }
                            placeholder="Building / Location"
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
                                {submitting ? "Saving..." : "Save Room"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <RoomSummary rooms={rooms} />

            <RoomFilters
                search={search}
                type={type}
                availability={availability}
                onSearchChange={setSearch}
                onTypeChange={setType}
                onAvailabilityChange={setAvailability}
                onReset={resetFilters}
            />

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                    Campus Rooms
                </h2>
                <span className="text-sm text-slate-500">
                    {filteredRooms.length} result(s)
                </span>
            </div>

            {loading ? (
                <div className="rounded-xl bg-white p-8 text-center text-slate-500">
                    Loading rooms...
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                    No rooms found.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredRooms.map((room) => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            onView={setSelectedRoom}
                        />
                    ))}
                </div>
            )}

            {selectedRoom && (
                <RoomDetails
                    room={selectedRoom}
                    onClose={() => setSelectedRoom(null)}
                />
            )}
        </div>
    );
}

export default Rooms;
