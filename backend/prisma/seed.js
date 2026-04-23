const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SERVICES = ['Compute', 'Storage', 'Networking', 'Database', 'Functions'];
const TEAMS = ['frontend', 'backend', 'data', 'devops'];
const PROJECTS = ['cloudlens-prod', 'data-pipeline', 'api-gateway', 'ml-training'];
const REGIONS = ['East US', 'West Europe', 'Southeast Asia'];

function randomBetween(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cloudlens.dev' },
    update: {},
    create: {
      email: 'admin@cloudlens.dev',
      passwordHash: await bcrypt.hash('Admin@123', 10),
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // 2. Create viewer user
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@cloudlens.dev' },
    update: {},
    create: {
      email: 'viewer@cloudlens.dev',
      passwordHash: await bcrypt.hash('Viewer@123', 10),
      name: 'Viewer User',
      role: 'VIEWER',
    },
  });

  // 3. Create billing manager
  const billing = await prisma.user.upsert({
    where: { email: 'billing@cloudlens.dev' },
    update: {},
    create: {
      email: 'billing@cloudlens.dev',
      passwordHash: await bcrypt.hash('Billing@123', 10),
      name: 'Billing Manager',
      role: 'BILLING_MANAGER',
    },
  });

  console.log('✅ Users created');

  // 4. Seed 60 days of cost records
  const costData = [];
  for (let day = 0; day < 60; day++) {
    for (const service of SERVICES) {
      costData.push({
        date: daysAgo(day),
        service,
        team: TEAMS[Math.floor(Math.random() * TEAMS.length)],
        project: PROJECTS[Math.floor(Math.random() * PROJECTS.length)],
        cloudProvider: Math.random() > 0.8 ? 'AWS' : 'Azure',
        costUsd: randomBetween(5, 80),
        resourceCount: Math.floor(Math.random() * 15 + 1),
        region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      });
    }
  }
  await prisma.costRecord.createMany({ data: costData });
  console.log(`✅ ${costData.length} cost records seeded`);

  // 5. Seed resources
  const resourceTypes = ['Virtual Machine', 'Blob Storage', 'SQL Database', 'App Service', 'Functions'];
  const resourceData = [];
  for (let i = 0; i < 20; i++) {
    resourceData.push({
      name: `resource-${TEAMS[i % 4]}-${String(i).padStart(3, '0')}`,
      type: resourceTypes[i % resourceTypes.length],
      team: TEAMS[i % TEAMS.length],
      project: PROJECTS[i % PROJECTS.length],
      status: i % 5 === 0 ? 'IDLE' : 'RUNNING',
      cpuUsage: randomBetween(5, 95),
      memoryUsage: randomBetween(10, 90),
      monthlyCostUsd: randomBetween(20, 300),
      region: REGIONS[i % REGIONS.length],
    });
  }
  await prisma.resource.createMany({ data: resourceData });
  console.log(`✅ ${resourceData.length} resources seeded`);

  // 6. Seed an alert
  const alert = await prisma.alert.create({
    data: {
      name: 'High Compute Cost Alert',
      thresholdUsd: 100,
      service: 'Compute',
      team: null,
      createdById: admin.id,
    },
  });
  console.log('✅ Sample alert created');

  // 7. Seed audit log
  await prisma.auditLog.create({
    data: {
      action: 'USER_CREATED',
      entity: 'User',
      entityId: viewer.id,
      metadata: { createdBy: 'seed' },
      performedById: admin.id,
    },
  });
  console.log('✅ Audit log seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('   Admin:   admin@cloudlens.dev   / Admin@123');
  console.log('   Viewer:  viewer@cloudlens.dev  / Viewer@123');
  console.log('   Billing: billing@cloudlens.dev / Billing@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());