
import { useEffect, useMemo, useState } from "react";
import { Plus, X, RefreshCw } from "lucide-react";

import BookingForm from "../components/booking/BookingForm";
import BookingList from "../components/booking/BookingList";
import BookingFilters from "../components/booking/BookingFilters";
import BookingSummary from "../components/booking/BookingSummary";

import { getBookings, createBooking } from "../services/booking";

function Bookings()
{
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [success, setSuccess] = useState("");

    const loadBookings = async () =>
    {
        try {
            setLoading(true);
            setError("");

            const response = await getBookings();

            const list = Array.isArray(response)
                ? response
                : response?.bookings ||
                response?.data?.bookings ||
                response?.data ||
                [];

            if (!Array.isArray(list)) {
                throw new Error("The server returned an invalid bookings response.");
            }

            setBookings(list);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load bookings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() =>
    {
        loadBookings();
    }, []);

    const filteredBookings = useMemo(() =>
    {
        return bookings.filter((booking) =>
        {
            const bookingStatus = (
                booking.status || "PENDING"
            ).toUpperCase();

            const matchesStatus =
                status === "ALL" || bookingStatus === status;

            const searchText = search.trim().toLowerCase();

            const matchesSearch =
                !searchText ||
                (booking.title || "").toLowerCase().includes(searchText) ||
                (booking.requester || "").toLowerCase().includes(searchText);

            return matchesStatus && matchesSearch;
        });
    }, [bookings, search, status]);

    const handleCreateBooking = async (bookingData) =>
    {
        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            await createBooking(bookingData);

            setShowForm(false);
            setSuccess("Booking request submitted successfully.");

            await loadBookings();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to submit booking request."
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
                        Room Bookings
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Create and track campus room booking requests.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={loadBookings}
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
                        {showForm ? "Close Form" : "New Booking"}
                    </button>
                </div>
            </div>

            {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    {success}
                </div>
            )}

            {showForm && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold text-slate-800">
                        Create Booking Request
                    </h2>

                    <BookingForm
                        onSubmit={handleCreateBooking}
                        loading={submitting}
                    />
                </section>
            )}

            <BookingSummary bookings={bookings} />

            <BookingFilters
                search={search}
                status={status}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onReset={resetFilters}
            />

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                    Booking Requests
                </h2>

                <span className="text-sm text-slate-500">
                    {filteredBookings.length} result(s)
                </span>
            </div>

            <BookingList
                bookings={filteredBookings}
                loading={loading}
                error={error}
            />
        </div>
    );
}

export default Bookings;
