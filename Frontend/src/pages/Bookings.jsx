
import { useEffect, useState } from "react";
import
    {
        Plus,
        Search,
        CalendarDays,
        Clock,
        MapPin,
        X,
    } from "lucide-react";

import BookingForm from "../components/booking/BookingForm";
import { createBooking, getBookings } from "../services/booking";

const statusStyles = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    REJECTED: "bg-red-100 text-red-700",
};

function Bookings()
{
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadBookings = async () =>
    {
        try {
            setError("");
            const response = await getBookings();

            const records =
                Array.isArray(response)
                    ? response
                    : response.bookings ||
                    response.data?.bookings ||
                    response.data ||
                    [];

            setBookings(Array.isArray(records) ? records : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load bookings. Please check your backend."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() =>
    {
        loadBookings();
    }, []);

    const handleCreateBooking = async (bookingData) =>
    {
        try {
            setError("");
            await createBooking(bookingData);
            setShowForm(false);
            await loadBookings();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to submit booking request."
            );
            throw err;
        }
    };

    const filteredBookings = bookings.filter((booking) =>
    {
        const title = booking.title || "";
        const requester = booking.requester || "";
        const room = booking.requestedRoomId || "";

        const matchesSearch = [title, requester, room]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase());

        const status = (booking.status || "PENDING").toUpperCase();
        const matchesStatus = filter === "ALL" || status === filter;

        return matchesSearch && matchesStatus;
    });

    const getBookingDate = (booking) =>
    {
        const windows = Array.isArray(booking.windows)
            ? booking.windows
            : [];

        return windows[0]?.date || "Not specified";
    };

    const getBookingTime = (booking) =>
    {
        const windows = Array.isArray(booking.windows)
            ? booking.windows
            : [];

        return windows[0]?.startTime || "Not specified";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Room Bookings
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage and track campus room booking requests.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    <Plus size={18} />
                    New Booking
                </button>
            </div>

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {showForm && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">
                            Create Booking Request
                        </h2>

                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            aria-label="Close booking form"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <BookingForm
                        onSubmit={handleCreateBooking}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search bookings..."
                        className="w-full bg-transparent py-3 outline-none"
                    />
                </div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                >
                    <option value="ALL">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Loading bookings...
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <p className="font-medium text-slate-700">
                        No bookings found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Submit a booking request or change your search filters.
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredBookings.map((booking, index) =>
                    {
                        const status = (booking.status || "PENDING").toUpperCase();

                        return (
                            <div
                                key={booking.id || index}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="font-semibold text-slate-800">
                                        {booking.title || "Untitled Booking"}
                                    </h2>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] ||
                                            "bg-slate-100 text-slate-600"
                                            }`}
                                    >
                                        {status}
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-slate-500">
                                    {booking.requester || "Requester not specified"}
                                </p>

                                <div className="mt-5 space-y-3 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} />
                                        {booking.requestedRoomId || booking.requestedCategory || "Room not specified"}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <CalendarDays size={16} />
                                        {getBookingDate(booking)}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        {getBookingTime(booking)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Bookings;
