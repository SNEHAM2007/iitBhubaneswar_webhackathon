import { z } from "zod";

const categories = [
  "CLASSROOM",
  "LAB",
  "SEMINAR_HALL",
  "AUDITORIUM",
  "MEETING_ROOM",
];

const nullablePositiveInteger = z.preprocess(
  (value) => (value === "" || value === null ? null : Number(value)),
  z.number().int().positive().max(10000).nullable(),
);

const nullableDuration = z.preprocess(
  (value) => (value === "" || value === null ? null : Number(value)),
  z.number().int().positive().max(13).nullable(),
);

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  });

const bookingDraftSchema = z.object({
  title: z.string().trim().max(120).nullable().optional(),
  requestedCategory: z.enum(categories).nullable().optional(),
  attendance: nullablePositiveInteger.optional(),
  date: dateSchema.nullable().optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .refine((value) => {
      const [hours, minutes] = value.split(":").map(Number);
      return hours <= 23 && minutes <= 59;
    })
    .nullable()
    .optional(),
  durationPeriods: nullableDuration.optional(),
  requestedRoomId: z.string().trim().max(100).nullable().optional(),
  roomTypes: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  needs: z.array(z.string().trim().min(1).max(60)).max(10).optional(),
  mandatoryGroupIds: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
  followUp: z.string().trim().max(300).nullable().optional(),
});

export async function parseBookingRequestText(text) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const error = new Error("Booking request parsing is not configured.");
    error.status = 503;
    throw error;
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Convert the user's English or Hinglish campus venue request into one JSON object. Today's date in Asia/Kolkata is ${today}. Treat "kal" as tomorrow. Do not invent missing information; use null for unknown scalar fields and [] for unknown lists. Return exactly these fields: title, requestedCategory, attendance, date, startTime, durationPeriods, requestedRoomId, roomTypes, needs, mandatoryGroupIds, followUp. Use requestedCategory from CLASSROOM, LAB, SEMINAR_HALL, AUDITORIUM, MEETING_ROOM. Use date as YYYY-MM-DD, startTime as 24-hour HH:mm, attendance and durationPeriods as integers. Duration is in one-hour periods. Extract exact preferred room IDs. Use roomTypes from classroom, lecture_hall, auditorium, seminar_hall, outdoor, lab_cs, lab_elec, lab_phy, workshop, meeting_room. Normalize microphone/mic to pa_system, computers to computers, projector to projector, wheelchair access to accessible. Keep all other explicit facilities in needs. mandatoryGroupIds should contain only explicit group IDs, not inferred names. If date, time, duration, attendance, or purpose is missing or ambiguous, explain what the user should confirm in followUp; do not silently guess. For recurring or multiple dates, note that the request needs confirmation for a single booking window.`,
        },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    console.error("Groq booking parser request failed:", response.status);
    const error = new Error("The booking parser service could not process this request.");
    error.status = 502;
    throw error;
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    const error = new Error("The booking parser returned an invalid response.");
    error.status = 502;
    throw error;
  }

  const validated = bookingDraftSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("Groq booking parser returned an invalid booking draft.");
    const error = new Error("The booking parser returned an invalid booking draft.");
    error.status = 502;
    throw error;
  }

  const draft = validated.data;
  const missingDetails = [
    !draft.title && "purpose",
    !draft.attendance && "attendance",
    !draft.date && "date",
    !draft.startTime && "start time",
    !draft.durationPeriods && "duration",
  ].filter(Boolean);

  return {
    title: draft.title || "",
    requestedCategory: draft.requestedCategory || "CLASSROOM",
    attendance: draft.attendance ? String(draft.attendance) : "",
    date: draft.date || "",
    startTime: draft.startTime || "",
    durationPeriods: draft.durationPeriods ? String(draft.durationPeriods) : "1",
    requestedRoomId: draft.requestedRoomId || "",
    roomTypes: draft.roomTypes || [],
    needs: draft.needs || [],
    mandatoryGroupIds: draft.mandatoryGroupIds || [],
    rawText: text,
    followUp:
      draft.followUp ||
      (missingDetails.length
        ? `Please confirm the ${missingDetails.join(", ")} before submitting.`
        : ""),
  };
}
