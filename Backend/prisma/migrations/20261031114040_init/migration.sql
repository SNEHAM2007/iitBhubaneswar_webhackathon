-- CreateTable
CREATE TABLE "Department" (
    "code" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'FACULTY',
    "departmentCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentCode" TEXT NOT NULL,
    "maxHoursPerDay" INTEGER NOT NULL,
    "needsAccessible" BOOLEAN NOT NULL,
    "unavailable" JSONB NOT NULL,
    "preferences" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "departmentCode" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "lectureHours" INTEGER NOT NULL,
    "tutorialHours" INTEGER NOT NULL,
    "labBlocks" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "departmentCode" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "needsAccessible" BOOLEAN NOT NULL,

    CONSTRAINT "StudentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "features" TEXT[],
    "accessible" BOOLEAN NOT NULL,
    "allowedUses" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingSession" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "roomTypes" TEXT[],
    "needsAccessible" BOOLEAN NOT NULL,
    "basketSlot" TEXT,
    "fixedSlot" JSONB,

    CONSTRAINT "TeachingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionGroup" (
    "sessionId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "SessionGroup_pkey" PRIMARY KEY ("sessionId","groupId")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "durationHours" INTEGER NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamCourse" (
    "examId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "ExamCourse_pkey" PRIMARY KEY ("examId","courseId")
);

-- CreateTable
CREATE TABLE "ExamGroup" (
    "examId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "ExamGroup_pkey" PRIMARY KEY ("examId","groupId")
);

-- CreateTable
CREATE TABLE "RoomUnavailability" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "periods" INTEGER[],
    "reason" TEXT NOT NULL,

    CONSTRAINT "RoomUnavailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" TEXT NOT NULL,
    "submittedAt" TIMESTAMPTZ(3) NOT NULL,
    "requester" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "departmentCode" TEXT,
    "requestedCategory" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "attendance" INTEGER NOT NULL,
    "durationPeriods" INTEGER NOT NULL,
    "windows" JSONB NOT NULL,
    "roomTypes" TEXT[],
    "needs" TEXT[],
    "requestedRoomId" TEXT,
    "seriesId" TEXT,
    "rawText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingMandatoryGroup" (
    "bookingRequestId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "BookingMandatoryGroup_pkey" PRIMARY KEY ("bookingRequestId","groupId")
);

-- CreateTable
CREATE TABLE "Cancellation" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "cancelledAt" TIMESTAMPTZ(3) NOT NULL,
    "by" TEXT NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "Cancellation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledSession" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startPeriod" INTEGER NOT NULL,
    "endPeriod" INTEGER NOT NULL,

    CONSTRAINT "ScheduledSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_departmentCode_idx" ON "User"("departmentCode");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Faculty_departmentCode_idx" ON "Faculty"("departmentCode");

-- CreateIndex
CREATE INDEX "Course_departmentCode_year_idx" ON "Course"("departmentCode", "year");

-- CreateIndex
CREATE INDEX "StudentGroup_departmentCode_year_idx" ON "StudentGroup"("departmentCode", "year");

-- CreateIndex
CREATE INDEX "Room_type_idx" ON "Room"("type");

-- CreateIndex
CREATE INDEX "Room_capacity_idx" ON "Room"("capacity");

-- CreateIndex
CREATE INDEX "TeachingSession_courseId_idx" ON "TeachingSession"("courseId");

-- CreateIndex
CREATE INDEX "TeachingSession_facultyId_idx" ON "TeachingSession"("facultyId");

-- CreateIndex
CREATE INDEX "TeachingSession_kind_idx" ON "TeachingSession"("kind");

-- CreateIndex
CREATE INDEX "SessionGroup_groupId_idx" ON "SessionGroup"("groupId");

-- CreateIndex
CREATE INDEX "Exam_size_idx" ON "Exam"("size");

-- CreateIndex
CREATE INDEX "ExamGroup_groupId_idx" ON "ExamGroup"("groupId");

-- CreateIndex
CREATE INDEX "RoomUnavailability_roomId_day_idx" ON "RoomUnavailability"("roomId", "day");

-- CreateIndex
CREATE INDEX "BookingRequest_requestedCategory_idx" ON "BookingRequest"("requestedCategory");

-- CreateIndex
CREATE INDEX "BookingRequest_submittedAt_idx" ON "BookingRequest"("submittedAt");

-- CreateIndex
CREATE INDEX "BookingRequest_departmentCode_idx" ON "BookingRequest"("departmentCode");

-- CreateIndex
CREATE UNIQUE INDEX "Cancellation_requestId_key" ON "Cancellation"("requestId");

-- CreateIndex
CREATE INDEX "ScheduledSession_scheduleId_roomId_day_idx" ON "ScheduledSession"("scheduleId", "roomId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledSession_scheduleId_sessionId_key" ON "ScheduledSession"("scheduleId", "sessionId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentCode_fkey" FOREIGN KEY ("departmentCode") REFERENCES "Department"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_departmentCode_fkey" FOREIGN KEY ("departmentCode") REFERENCES "Department"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentCode_fkey" FOREIGN KEY ("departmentCode") REFERENCES "Department"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroup" ADD CONSTRAINT "StudentGroup_departmentCode_fkey" FOREIGN KEY ("departmentCode") REFERENCES "Department"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingSession" ADD CONSTRAINT "TeachingSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingSession" ADD CONSTRAINT "TeachingSession_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionGroup" ADD CONSTRAINT "SessionGroup_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TeachingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionGroup" ADD CONSTRAINT "SessionGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudentGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamCourse" ADD CONSTRAINT "ExamCourse_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamCourse" ADD CONSTRAINT "ExamCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamGroup" ADD CONSTRAINT "ExamGroup_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamGroup" ADD CONSTRAINT "ExamGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudentGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomUnavailability" ADD CONSTRAINT "RoomUnavailability_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_departmentCode_fkey" FOREIGN KEY ("departmentCode") REFERENCES "Department"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_requestedRoomId_fkey" FOREIGN KEY ("requestedRoomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingMandatoryGroup" ADD CONSTRAINT "BookingMandatoryGroup_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingMandatoryGroup" ADD CONSTRAINT "BookingMandatoryGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudentGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancellation" ADD CONSTRAINT "Cancellation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledSession" ADD CONSTRAINT "ScheduledSession_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledSession" ADD CONSTRAINT "ScheduledSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TeachingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledSession" ADD CONSTRAINT "ScheduledSession_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
