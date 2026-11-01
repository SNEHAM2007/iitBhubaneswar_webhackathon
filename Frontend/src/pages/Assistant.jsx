import { useState, useRef, useEffect } from "react";
import
    {
        Bot,
        Send,
        User,
        Sparkles,
        CalendarDays,
        DoorOpen,
        Clock,
    } from "lucide-react";

const suggestions = [
    "Find an available classroom tomorrow",
    "Show my timetable for today",
    "Check room booking availability",
    "Find scheduling conflicts",
];

function Assistant()
{
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: "assistant",
            content:
                "Hello! I'm your Campus Scheduling Assistant. I can help you with timetables, room availability, bookings and scheduling questions. How can I help you?",
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() =>
    {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const handleSend = async (text = input) =>
    {
        const message = text.trim();

        if (!message || loading) return;

        const userMessage = {
            id: Date.now(),
            role: "user",
            content: message,
        };

        setMessages((previous) => [...previous, userMessage]);
        setInput("");
        setLoading(true);

        // AI backend integration will be added later.
        setTimeout(() =>
        {
            setMessages((previous) => [
                ...previous,
                {
                    id: Date.now() + 1,
                    role: "assistant",
                    content:
                        "Your request has been received. AI scheduling integration will be connected to the backend in the next development step.",
                },
            ]);

            setLoading(false);
        }, 800);
    };

    return (
        <div className="flex h-[calc(100vh-150px)] min-h-[550px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 bg-white p-5">
                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                    <Bot size={25} />
                </div>

                <div>
                    <h1 className="font-bold text-slate-900">
                        AI Scheduling Assistant
                    </h1>

                    <p className="text-xs text-emerald-600">
                        <Sparkles size={12} className="mr-1 inline" />
                        English and Hinglish support
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 p-5">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === "user"
                                ? "flex-row-reverse"
                                : "flex-row"
                            }`}
                    >
                        <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${message.role === "user"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-indigo-100 text-indigo-600"
                                }`}
                        >
                            {message.role === "user" ? (
                                <User size={18} />
                            ) : (
                                <Bot size={19} />
                            )}
                        </div>

                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user"
                                    ? "rounded-tr-sm bg-indigo-600 text-white"
                                    : "rounded-tl-sm border border-slate-200 bg-white text-slate-700"
                                }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                            <Bot size={19} />
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                            Assistant is thinking...
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
                <div className="border-t border-slate-100 bg-white px-5 pt-4">
                    <p className="mb-3 text-xs font-semibold text-slate-500">
                        TRY ASKING
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => handleSend(suggestion)}
                                className="rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <form
                onSubmit={(e) =>
                {
                    e.preventDefault();
                    handleSend();
                }}
                className="flex items-center gap-3 border-t border-slate-200 bg-white p-4"
            >
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about timetable, rooms or bookings..."
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="rounded-xl bg-indigo-600 p-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send message"
                >
                    <Send size={19} />
                </button>
            </form>
        </div>
    );
}

export default Assistant;