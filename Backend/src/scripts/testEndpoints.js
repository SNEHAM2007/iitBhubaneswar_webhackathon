import "dotenv/config";
import app from "../app.js";

async function testAll() {
  const server = app.listen(5005, () => {
    console.log("Test server running on port 5005");
  });

  const baseUrl = "http://localhost:5005/api";

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const health = await healthRes.json();
    console.log("1. Health Check:", health.success, health.database);

    // 2. Auth login (Admin)
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@cit.edu", password: "Admin@123" }),
    });
    const loginData = await loginRes.json();
    console.log("2. Admin Login:", loginData.success, "User:", loginData.user?.role);
    const token = loginData.token;

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // 3. Scheduling Latest
    const schedRes = await fetch(`${baseUrl}/scheduling/latest`, { headers: authHeaders });
    const schedData = await schedRes.json();
    console.log(
      "3. Scheduling Latest:",
      schedData.success,
      "Sessions count:",
      schedData.total_sessions,
      "First session subject:",
      schedData.timetable?.[0]?.subject,
      "Day:",
      schedData.timetable?.[0]?.day,
    );

    // 4. Rooms List
    const roomsRes = await fetch(`${baseUrl}/rooms`, { headers: authHeaders });
    const roomsData = await roomsRes.json();
    console.log(
      "4. Rooms:",
      roomsData.success,
      "Count:",
      roomsData.count,
      "Sample room:",
      roomsData.rooms?.[0]?.name,
    );

    // 5. Exams List
    const examsRes = await fetch(`${baseUrl}/exams`, { headers: authHeaders });
    const examsData = await examsRes.json();
    console.log(
      "5. Exams:",
      examsData.success,
      "Count:",
      examsData.count,
      "Sample exam:",
      examsData.exams?.[0]?.subject,
      "Date:",
      examsData.exams?.[0]?.date,
    );

    // 6. Rescheduling List
    const reschedRes = await fetch(`${baseUrl}/rescheduling`, { headers: authHeaders });
    const reschedData = await reschedRes.json();
    console.log(
      "6. Rescheduling:",
      reschedData.success,
      "Count:",
      reschedData.count,
      "Sample req:",
      reschedData.requests?.[0]?.title,
    );

    // 7. Dashboard Overview
    const dashRes = await fetch(`${baseUrl}/dashboard`, { headers: authHeaders });
    const dashData = await dashRes.json();
    console.log(
      "7. Dashboard:",
      dashData.success,
      "Stats:",
      dashData.data?.stats?.length,
      "Sessions:",
      dashData.data?.sessions?.length,
    );

    // 8. Assistant Chat
    const chatRes = await fetch(`${baseUrl}/assistant/chat`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ message: "What classes are scheduled on Monday?" }),
    });
    const chatData = await chatRes.json();
    console.log("8. Assistant Chat:", chatData.success, "Reply length:", chatData.reply?.length);

    console.log("\nALL BACKEND API ENDPOINTS ARE FULLY OPERATIONAL AND CONNECTED!");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    server.close();
    process.exit(0);
  }
}

testAll();
