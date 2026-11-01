import DashboardOverview from "../../components/dashboard/DashboardOverview";

function AdminDashboard()
{
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Admin Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage and monitor your entire campus scheduling system.
                </p>
            </div>

            <DashboardOverview />
        </div>
    );
}

export default AdminDashboard;