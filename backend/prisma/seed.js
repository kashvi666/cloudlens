const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateCostRecords, generateResources } = require('../src/services/mockCostService');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CloudLens database seed...\n');

  // ── Wipe existing data (clean slate) ─────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.remediationLog.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.costRecord.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️  Cleared existing data\n');

  // ── Users ─────────────────────────────────────────────────
  const [admin, viewer, billing] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@cloudlens.dev',
        passwordHash: await bcrypt.hash('Admin@123', 10),
        name: 'Moksh Sharma',
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        email: 'viewer@cloudlens.dev',
        passwordHash: await bcrypt.hash('Viewer@123', 10),
        name: 'Priya Patel',
        role: 'VIEWER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'billing@cloudlens.dev',
        passwordHash: await bcrypt.hash('Billing@123', 10),
        name: 'Rahul Gupta',
        role: 'BILLING_MANAGER',
      },
    }),
  ]);
  console.log('✅ Users created (3)\n');

  // ── Cost Records (90 days) ────────────────────────────────
  const costCount = await generateCostRecords(90);

  // ── Resources ─────────────────────────────────────────────
  const resourceCount = await generateResources();

  // ── Alerts ────────────────────────────────────────────────
  await prisma.alert.createMany({
    data: [
      {
        name: 'Compute Spike Alert',
        thresholdUsd: 150,
        service: 'Compute',
        team: null,
        createdById: admin.id,
      },
      {
        name: 'ML Training Cost Guard',
        thresholdUsd: 200,
        service: 'AI/ML',
        team: 'ml',
        createdById: admin.id,
      },
      {
        name: 'Backend Team Budget Alert',
        thresholdUsd: 100,
        service: null,
        team: 'backend',
        createdById: billing.id,
      },
    ],
  });
  console.log('✅ Alerts created (3)\n');

  // ── Audit Logs ────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'USER_CREATED',
        entity: 'User',
        entityId: viewer.id,
        metadata: { method: 'seed' },
        performedById: admin.id,
      },
      {
        action: 'ALERT_CREATED',
        entity: 'Alert',
        entityId: 'seed-alert-1',
        metadata: { threshold: 150 },
        performedById: admin.id,
      },
    ],
  });
  console.log('✅ Audit logs created\n');

  console.log('━'.repeat(50));
  console.log('🎉 Seed complete!\n');
  console.log(`   Cost records : ${costCount}`);
  console.log(`   Resources    : ${resourceCount}`);
  console.log(`   Users        : 3`);
  console.log(`   Alerts       : 3\n`);
  console.log('   Login credentials:');
  console.log('   admin@cloudlens.dev   / Admin@123   (ADMIN)');
  console.log('   viewer@cloudlens.dev  / Viewer@123  (VIEWER)');
  console.log('   billing@cloudlens.dev / Billing@123 (BILLING_MANAGER)');
  console.log('━'.repeat(50));
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());