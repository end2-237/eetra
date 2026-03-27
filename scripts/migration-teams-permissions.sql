-- ============================================================================
-- Migration: Add Teams and Document Permissions system
-- ============================================================================
-- Creates: Team, TeamProject, DocumentPermission tables
-- Modifies: TeamMember, Document, User tables
-- Date: 2026-03-27
-- ============================================================================

-- Create Team table
CREATE TABLE IF NOT EXISTS "Team" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ownerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Create index for Team
CREATE INDEX "Team_ownerId_idx" ON "Team"("ownerId");

-- Create TeamProject table
CREATE TABLE IF NOT EXISTS "TeamProject" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "teamId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeamProject_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE
);

-- Create index for TeamProject
CREATE INDEX "TeamProject_teamId_idx" ON "TeamProject"("teamId");

-- Create DocumentPermission table
CREATE TABLE IF NOT EXISTS "DocumentPermission" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "documentId" TEXT NOT NULL,
  "teamId" TEXT,
  "userId" TEXT,
  "permission" TEXT NOT NULL DEFAULT 'VIEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DocumentPermission_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE CASCADE,
  CONSTRAINT "DocumentPermission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE,
  CONSTRAINT "DocumentPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
  CONSTRAINT "DocumentPermission_documentId_teamId_userId_key" UNIQUE("documentId", "teamId", "userId")
);

-- Create indexes for DocumentPermission
CREATE INDEX "DocumentPermission_documentId_idx" ON "DocumentPermission"("documentId");
CREATE INDEX "DocumentPermission_teamId_idx" ON "DocumentPermission"("teamId");
CREATE INDEX "DocumentPermission_userId_idx" ON "DocumentPermission"("userId");

-- Add columns to Document table
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "teamProjectId" TEXT;

-- Add foreign key constraint for teamProjectId
ALTER TABLE "Document" ADD CONSTRAINT "Document_teamProjectId_fkey" 
  FOREIGN KEY ("teamProjectId") REFERENCES "TeamProject" ("id") ON DELETE SET NULL;

-- Create index for Document teamProjectId
CREATE INDEX IF NOT EXISTS "Document_teamProjectId_idx" ON "Document"("teamProjectId");

-- Update TeamMember to link to Team
ALTER TABLE "TeamMember" ADD COLUMN IF NOT EXISTS "teamId" TEXT;

-- For existing team members, we need to handle this carefully
-- This migration creates the structure; data migration happens in app layer
-- Add unique constraint for teamId, userId
ALTER TABLE "TeamMember" DROP CONSTRAINT IF EXISTS "TeamMember_userId_key";
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_userId_key" UNIQUE("teamId", "userId");

-- Create indexes for TeamMember
CREATE INDEX IF NOT EXISTS "TeamMember_teamId_idx" ON "TeamMember"("teamId");
CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId");

-- Add index to User email if not exists
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
