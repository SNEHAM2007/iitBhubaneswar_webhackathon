
import { useEffect, useMemo, useState } from "react";
import { Plus, X, RefreshCw, Sparkles } from "lucide-react";

import BookingForm from "../components/booking/BookingForm";
import BookingList from "../components/booking/BookingList";
import BookingFilters from "../components/booking/BookingFilters";
import BookingSummary from "../components/booking/BookingSummary";

import {
    getBookings,
    createBooking,
    parseBookingRequest,
} from "../services/booking";
import { useAuth } from "../../context/AuthContext";

function Bookings()
{
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [success, setSuccess] = useState("");
    const [requestText, setRequestText] = useState("");
    const [parsing, setParsing] = useState(false);
    const [parseError, setParseError] = useState("");
    const [parsedBooking, setParsedBooking] = useState(null);
    const [draftVersion, setDraftVersion] = useState(0);

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

    const handleParseRequest = async (event) =>
    {
        event.preventDefault();
        setParseError("");

        try {
            setParsing(true);
            const response = await parseBookingRequest(requestText);
            const draft = response?.data;

            if (!draft || typeof draft !== "object") {
                throw new Error("The parser returned an invalid booking draft.");
            }

            setParsedBooking({
                ...draft,
                requester: user?.name || "",
                departmentCode: user?.departmentCode || "",
            });
            setDraftVersion((version) => version + 1);
        } catch (err) {
            setParseError(
                err.response?.data?.message ||
                err.message ||
                "Unable to parse the venue request.",
            );
        } finally {
            setParsing(false);
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
                        onClick={() =>
                        {
                            setShowForm((current) => !current);
                            setParsedBooking(null);
                            setRequestText("");
                            setParseError("");
                        }}
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

                    <form onSubmit={handleParseRequest} className="mb-6 space-y-3 rounded-xl bg-indigo-50 p-4">
                        <label htmlFor="booking-request-text" className="block text-sm font-semibold text-slate-800">
                            Describe the venue request in English or Hinglish
                        </label>
                        <textarea
                            id="booking-request-text"
                            value={requestText}
                            onChange={(event) => setRequestText(event.target.value)}
                            rows={3}
                            maxLength={4000}
                            placeholder="e.g. Thursday shaam 6 baje 2 ghante ke liye seminar hall chahiye, 100 log aur mic ke saath."
                            className="w-full rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                            required
                        />
                        {parseError && (
                            <p role="alert" className="text-sm text-red-700">{parseError}</p>
                        )}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-slate-500">
                                We’ll prepare a draft. Review and edit every detail before submitting.
                            </p>
                            <button
                                type="submit"
                                disabled={parsing || !requestText.trim()}
                                className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
                            >
                                <Sparkles size={16} />
                                {parsing ? "Preparing draft..." : "Create editable draft"}
                            </button>
                        </div>
                    </form>

                    {parsedBooking?.followUp && (
                        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            {parsedBooking.followUp}
                        </p>
                    )}

                    <BookingForm
                        key={draftVersion}
                        onSubmit={handleCreateBooking}
                        loading={submitting}
                        initialData={parsedBooking}
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
