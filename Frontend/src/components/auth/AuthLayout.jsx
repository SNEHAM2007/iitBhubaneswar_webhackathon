import {
    CalendarDays,
    ClipboardList,
    GraduationCap,
    ShieldCheck,
    UsersRound,
} from "lucide-react";

const roles = [
    {
        name: "Administrator",
        description: "Manage campus schedules and operations",
        icon: ShieldCheck,
        color: "bg-indigo-400/15 text-indigo-200",
    },
    {
        name: "Faculty",
        description: "View teaching schedules and bookings",
        icon: GraduationCap,
        color: "bg-sky-400/15 text-sky-200",
    },
    {
        name: "Coordinator",
        description: "Coordinate departments and resources",
        icon: ClipboardList,
        color: "bg-violet-400/15 text-violet-200",
    },
    {
        name: "Club representative",
        description: "Plan events and request campus spaces",
        icon: UsersRound,
        color: "bg-emerald-400/15 text-emerald-200",
    },
];

function AuthLayout({ children, pageLabel })
{
    return (
        <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
            <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 text-white lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-10 xl:px-16">
                <div className="pointer-events-none absolute -left-28 top-1/4 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl" />
                <div className="pointer-events-none absolute -right-36 bottom-0 h-[30rem] w-[30rem] rounded-full bg-sky-500/15 blur-3xl" />

                <div className="relative flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-indigo-200 ring-1 ring-white/15">
                        <CalendarDays size={23} />
                    </span>
                    <div>
                        <p className="font-bold tracking-tight">Campus Scheduler</p>
                        <p className="text-xs text-slate-400">One campus. In sync.</p>
                    </div>
                </div>

                <div className="relative my-12 max-w-xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-indigo-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Smarter campus operations
                    </span>
                    <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                        A better day on campus starts with a better plan.
                    </h1>
                    <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                        Keep classes, people and spaces moving together with one
                        connected scheduling workspace.
                    </p>

                    <div className="mt-10 grid gap-3 sm:grid-cols-2">
                        {roles.map(({ name, description, icon: Icon, color }) => (
                            <div
                                key={name}
                                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                            >
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
                                    <Icon size={17} />
                                </span>
                                <span>
                                    <span className="block text-sm font-semibold text-white">
                                        {name}
                                    </span>
                                    <span className="mt-1 block text-xs leading-5 text-slate-400">
                                        {description}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-xs leading-5 text-slate-400">
                        <ShieldCheck size={15} className="shrink-0 text-emerald-300" />
                        Your access is determined by the role assigned to your account.
                    </div>
                </div>

                <p className="relative text-xs text-slate-500">
                    © 2026 Campus Scheduler
                </p>
            </section>

            <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:justify-center lg:px-12 xl:px-20">
                <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                            <CalendarDays size={21} />
                        </span>
                        <span className="font-bold text-slate-900">
                            Campus Scheduler
                        </span>
                    </div>

                    <p className="text-sm font-semibold text-indigo-600">
                        {pageLabel}
                    </p>
                    <div className="mb-4 mt-4 grid grid-cols-2 gap-2 lg:hidden">
                        {roles.map(({ name, icon: Icon }) => (
                            <div
                                key={name}
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                            >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                    <Icon size={15} />
                                </span>
                                <span className="text-xs font-semibold leading-4 text-slate-700">
                                    {name}
                                </span>
                            </div>
                        ))}
                    </div>
                    {children}
                </div>

                <p className="mx-auto mt-8 w-full max-w-md text-center text-xs leading-5 text-slate-400">
                    Secure access for the campus community. Need help? Contact your
                    campus administrator.
                </p>
            </section>
        </main>
    );
}

export default AuthLayout;
