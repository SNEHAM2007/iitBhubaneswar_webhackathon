
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import ReschedulingCard from "../components/rescheduling/ReschedulingCard";
import ReschedulingFilters from "../components/rescheduling/ReschedulingFilters";
import ReschedulingDetails from "../components/rescheduling/ReschedulingDetails";
import ReschedulingSummary from "../components/rescheduling/ReschedulingSummary";

import { getReschedulingRequests } from "../services/rescheduling";

function normalizeRequests(response)
{
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.requests)) return response.requests;
    if (Array.isArray(response?.data?.requests)) return response.data.requests;
    if (Array.isArray(response?.data)) return response.data;

    throw new Error("Invalid rescheduling response received from the server.");
}

function Rescheduling()
{
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadRequests = useCallback(async () =>
    {
        try {
            setLoading(true);
            setError("");

            const response = await getReschedulingRequests();
            setRequests(normalizeRequests(response));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load rescheduling requests."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() =>
    {
        loadRequests();
    }, [loadRequests]);

    const filteredRequests = useMemo(() =>
    {
        return requests.filter((request) =>
        {
            const requestStatus = (
                request.status || "PENDING"
            ).toUpperCase();

            const matchesStatus =
                status === "ALL" || requestStatus === status;

            const searchText = search.trim().toLowerCase();

            const matchesSearch =
                !searchText ||
                (request.title || "").toLowerCase().includes(searchText) ||
                (request.requester || "").toLowerCase().includes(searchText);

            return matchesStatus && matchesSearch;
        });
    }, [requests, search, status]);

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
                        Rescheduling Management
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Review requests for changes to existing class schedules.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadRequests}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <ReschedulingSummary requests={requests} />

            <ReschedulingFilters
                search={search}
                status={status}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onReset={resetFilters}
            />

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                    Rescheduling Requests
                </h2>
                <span className="text-sm text-slate-500">
                    {filteredRequests.length} result(s)
                </span>
            </div>

            {loading ? (
                <div className="rounded-xl bg-white p-8 text-center text-slate-500">
                    Loading rescheduling requests...
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                    No rescheduling requests found.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredRequests.map((request) => (
                        <ReschedulingCard
                            key={request.id}
                            request={request}
                            onView={setSelectedRequest}
                        />
                    ))}
                </div>
            )}

            {selectedRequest && (
                <ReschedulingDetails
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                />
            )}
        </div>
    );
}

export default Rescheduling;
