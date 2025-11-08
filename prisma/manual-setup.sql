-- Manual SQL setup for DoctorSim
-- Run this in Supabase SQL Editor if prisma db push hangs

-- Create enum types
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'PHYSICIAN', 'ADMIN');
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- Users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PATIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Questions table
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "patientContext" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientAge" INTEGER,
    "difficultyLevel" "DifficultyLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "hintText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- Answer Options table
CREATE TABLE "answer_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "explanation" TEXT NOT NULL,
    "educationalResourceLink" TEXT,
    CONSTRAINT "answer_options_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "answer_options" ADD CONSTRAINT "answer_options_questionId_fkey" 
    FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- User Responses table
CREATE TABLE "user_responses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL,
    "usedHint" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_responses_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "user_responses" ADD CONSTRAINT "user_responses_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_responses" ADD CONSTRAINT "user_responses_questionId_fkey" 
    FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_responses" ADD CONSTRAINT "user_responses_selectedOptionId_fkey" 
    FOREIGN KEY ("selectedOptionId") REFERENCES "answer_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Hint Usage table
CREATE TABLE "hint_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hint_usage_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "hint_usage" ADD CONSTRAINT "hint_usage_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "hint_usage" ADD CONSTRAINT "hint_usage_questionId_fkey" 
    FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Analysis Reports table
CREATE TABLE "analysis_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "analysisText" TEXT NOT NULL,
    "knowledgeGaps" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "confidenceScores" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analysis_reports_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "analysis_reports" ADD CONSTRAINT "analysis_reports_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Pre Visit Forms table
CREATE TABLE "pre_visit_forms" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symptoms" JSONB NOT NULL,
    "medications" JSONB NOT NULL,
    "concerns" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pre_visit_forms_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "pre_visit_forms" ADD CONSTRAINT "pre_visit_forms_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- NextAuth tables
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- Success message
SELECT 'Database tables created successfully!' as message;

