-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VIEWER', 'BILLING_MANAGER');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'PAUSED', 'TRIGGERED');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('RUNNING', 'STOPPED', 'SCALED_DOWN', 'IDLE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_records" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "service" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "cloudProvider" TEXT NOT NULL DEFAULT 'Azure',
    "costUsd" DOUBLE PRECISION NOT NULL,
    "resourceCount" INTEGER NOT NULL DEFAULT 1,
    "region" TEXT NOT NULL DEFAULT 'East US',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "thresholdUsd" DOUBLE PRECISION NOT NULL,
    "service" TEXT,
    "team" TEXT,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "status" "ResourceStatus" NOT NULL DEFAULT 'RUNNING',
    "cpuUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "memoryUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "region" TEXT NOT NULL DEFAULT 'East US',
    "cloudProvider" TEXT NOT NULL DEFAULT 'Azure',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remediation_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "costBefore" DOUBLE PRECISION NOT NULL,
    "costAfter" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SIMULATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertId" TEXT NOT NULL,

    CONSTRAINT "remediation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performedById" TEXT NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "cost_records_date_idx" ON "cost_records"("date");

-- CreateIndex
CREATE INDEX "cost_records_team_idx" ON "cost_records"("team");

-- CreateIndex
CREATE INDEX "cost_records_service_idx" ON "cost_records"("service");

-- CreateIndex
CREATE INDEX "resources_team_idx" ON "resources"("team");

-- CreateIndex
CREATE INDEX "resources_status_idx" ON "resources"("status");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remediation_logs" ADD CONSTRAINT "remediation_logs_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
