-- CreateEnum
CREATE TYPE "public"."LikeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "public"."MessageKind" AS ENUM ('TEXT', 'LIKE');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "location" TEXT,
    "gender" TEXT,
    "jobTitle" TEXT,
    "company" TEXT,
    "school" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Photo" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prompt" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Like" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "comment" TEXT,
    "context" JSONB,
    "status" "public"."LikeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Match" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "likeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Conversation" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "kind" "public"."MessageKind" NOT NULL DEFAULT 'TEXT',
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile"("userId");

-- CreateIndex
CREATE INDEX "Photo_profileId_position_idx" ON "public"."Photo"("profileId", "position");

-- CreateIndex
CREATE INDEX "Prompt_profileId_idx" ON "public"."Prompt"("profileId");

-- CreateIndex
CREATE INDEX "Like_toUserId_status_createdAt_idx" ON "public"."Like"("toUserId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Like_fromUserId_createdAt_idx" ON "public"."Like"("fromUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Match_likeId_key" ON "public"."Match"("likeId");

-- CreateIndex
CREATE INDEX "Match_userAId_idx" ON "public"."Match"("userAId");

-- CreateIndex
CREATE INDEX "Match_userBId_idx" ON "public"."Match"("userBId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_matchId_key" ON "public"."Conversation"("matchId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "public"."Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_authorId_createdAt_idx" ON "public"."Message"("authorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_jti_key" ON "public"."Session"("jti");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Photo" ADD CONSTRAINT "Photo_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prompt" ADD CONSTRAINT "Prompt_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_likeId_fkey" FOREIGN KEY ("likeId") REFERENCES "public"."Like"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
