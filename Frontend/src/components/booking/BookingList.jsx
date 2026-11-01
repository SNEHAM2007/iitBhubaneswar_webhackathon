
import BookingCard from "./BookingCard";

function BookingList({
    bookings = [],
    loading = false,
    error = "",
    showActions = false,
    onApprove,
    onReject,
})
{
    if (loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                Loading bookings...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                {error}
            </div>
        );
    }

    if (!bookings.length) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <h3 className="font-semibold text-slate-700">
                    No bookings found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                    Booking requests will appear here when they are submitted.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {bookings.map((booking) => (
                <BookingCard
                    key={booking.id}
                    booking={booking}
                    showActions={showActions}
                    onApprove={onApprove}
                    onReject={onReject}
                />
            ))}
        </div>
    );
}

export default BookingList;
