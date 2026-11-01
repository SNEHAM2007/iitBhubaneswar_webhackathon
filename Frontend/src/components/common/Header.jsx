
import { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Header({ title = "Dashboard", onMenuClick }) {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {title}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            Campus Scheduler / {title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:flex">
          <Search size={17} className="text-slate-400" />
          <input
            type="search"
            placeholder="Search..."
            className="w-36 bg-transparent py-2 text-sm outline-none lg:w-48"
          />
        </div>

        <button
          className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={21} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 rounded-xl p-2 hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <UserCircle size={22} />
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-28 truncate text-sm font-semibold text-slate-800">
                {user?.name || "Campus User"}
              </p>
              <p className="text-xs text-slate-500">
                {user?.role || "User"}
              </p>
            </div>

            <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-14 w-52 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name || "Campus User"}
              </p>
              <p className="mt-1 truncate text-xs text-slate-500">
                {user?.email || ""}
              </p>
              <p className="mt-2 text-xs text-indigo-600">
                {user?.role || "User"}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
