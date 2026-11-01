import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

function Unauthorized()
{
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                    <ShieldAlert size={32} />
                </div>

                <h1 className="mt-6 text-3xl font-bold text-slate-900">
                    Access Denied
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                    You don't have permission to access this page. Please contact your
                    campus administrator if you believe this is a mistake.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        to="/"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <ArrowLeft size={17} />
                        Go Back
                    </Link>

                    <Link
                        to="/login"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        <Home size={17} />
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Unauthorized;