const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SERVICES = ['Compute', 'Storage', 'Networking', 'Database', 'Functions', 'AI/ML'];
const TEAMS = ['frontend', 'backend', 'data', 'devops', 'ml'];
const PROJECTS = ['cloudlens-prod', 'data-pipeline', 'api-gateway', 'ml-training', 'analytics'];
const PROVIDERS = ['Azure', 'Azure', 'Azure', 'AWS']; // 75% Azure
const REGIONS = ['East US', 'West Europe', 'Southeast Asia', 'Central India'];

// Base cost per service (realistic Azure pricing feel)
const BASE_COSTS = {
  Compute: { min: 20, max: 120 },
  Storage: { min: 5, max: 40 },
  Networking: { min: 8, max: 35 },
  Database: { min: 15, max: 80 },
  Functions: { min: 2, max: 25 },
  'AI/ML': { min: 30, max: 200 },
};

function randomBetween(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Add weekend dips + mid-month spikes for realism
function applySeasonality(baseCost, dayIndex) {
  const date = daysAgo(dayIndex);
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();

  let multiplier = 1;

  // Weekend: lower usage
  if (dayOfWeek === 0 || dayOfWeek === 6) multiplier *= 0.6;

  // Mid-month billing cycle spike
  if (dayOfMonth >= 14 && dayOfMonth <= 16) multiplier *= 1.4;

  // Occasional anomaly spike (1 in 20 days) — triggers alerts
  if (Math.random() < 0.05) multiplier *= 2.5;

  return parseFloat((baseCost * multiplier).toFixed(2));
}

// ── Generate 90 days of cost records ─────────────────────────
async function generateCostRecords(days = 90) {
  console.log(`🔄 Generating ${days} days of cost records...`);

  const records = [];

  for (let day = 0; day < days; day++) {
    for (const service of SERVICES) {
      // Each service generates 1-3 entries per day (different teams)
      const teamsToday = TEAMS.slice(0, Math.floor(Math.random() * 3) + 1);

      for (const team of teamsToday) {
        const { min, max } = BASE_COSTS[service];
        const baseCost = randomBetween(min, max);
        const finalCost = applySeasonality(baseCost, day);

        records.push({
          date: daysAgo(day),
          service,
          team,
          project: PROJECTS[Math.floor(Math.random() * PROJECTS.length)],
          cloudProvider: PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)],
          costUsd: finalCost,
          resourceCount: Math.floor(Math.random() * 20 + 1),
          region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
        });
      }
    }
  }

  // Batch insert (much faster than individual creates)
  await prisma.costRecord.createMany({ data: records, skipDuplicates: false });
  console.log(`✅ ${records.length} cost records created`);
  return records.length;
}

// ── Generate resource inventory ───────────────────────────────
async function generateResources() {
  console.log('🔄 Generating resource inventory...');

  const resourceTypes = [
    'Virtual Machine', 'Blob Storage', 'SQL Database',
    'App Service', 'Functions', 'Redis Cache', 'Kubernetes Node'
  ];

  const resources = [];

  for (let i = 0; i < 30; i++) {
    const team = TEAMS[i % TEAMS.length];
    const type = resourceTypes[i % resourceTypes.length];
    const isIdle = i % 7 === 0;

    resources.push({
      name: `${team}-${type.toLowerCase().replace(/ /g, '-')}-${String(i).padStart(3, '0')}`,
      type,
      team,
      project: PROJECTS[i % PROJECTS.length],
      status: isIdle ? 'IDLE' : 'RUNNING',
      cpuUsage: isIdle ? randomBetween(1, 5) : randomBetween(20, 90),
      memoryUsage: isIdle ? randomBetween(5, 15) : randomBetween(30, 85),
      monthlyCostUsd: randomBetween(15, 350),
      region: REGIONS[i % REGIONS.length],
      cloudProvider: i % 5 === 0 ? 'AWS' : 'Azure',
    });
  }

  await prisma.resource.createMany({ data: resources });
  console.log(`✅ ${resources.length} resources created`);
  return resources.length;
}

// ── Aggregate helpers for API responses ──────────────────────

// Daily cost totals for the last N days
async function getDailyCosts(days = 30, filters = {}) {
  const from = daysAgo(days);

  const where = {
    date: { gte: from },
    ...(filters.team && { team: filters.team }),
    ...(filters.service && { service: filters.service }),
    ...(filters.project && { project: filters.project }),
    ...(filters.provider && { cloudProvider: filters.provider }),
  };

  const records = await prisma.costRecord.findMany({
    where,
    orderBy: { date: 'asc' },
    select: { date: true, costUsd: true, service: true, team: true },
  });

  // Group by date
  const grouped = {};
  for (const r of records) {
    const dateKey = r.date.toISOString().split('T')[0];
    grouped[dateKey] = (grouped[dateKey] || 0) + r.costUsd;
  }

  return Object.entries(grouped).map(([date, total]) => ({
    date,
    total: parseFloat(total.toFixed(2)),
  }));
}

// Cost breakdown by service
async function getCostByService(days = 30, filters = {}) {
  const from = daysAgo(days);
  const where = {
    date: { gte: from },
    ...(filters.team && { team: filters.team }),
  };

  const records = await prisma.costRecord.findMany({ where, select: { service: true, costUsd: true } });

  const grouped = {};
  for (const r of records) {
    grouped[r.service] = (grouped[r.service] || 0) + r.costUsd;
  }

  return Object.entries(grouped)
    .map(([service, total]) => ({ service, total: parseFloat(total.toFixed(2)) }))
    .sort((a, b) => b.total - a.total);
}

// Cost breakdown by team
async function getCostByTeam(days = 30) {
  const from = daysAgo(days);
  const records = await prisma.costRecord.findMany({
    where: { date: { gte: from } },
    select: { team: true, costUsd: true },
  });

  const grouped = {};
  for (const r of records) {
    grouped[r.team] = (grouped[r.team] || 0) + r.costUsd;
  }

  return Object.entries(grouped)
    .map(([team, total]) => ({ team, total: parseFloat(total.toFixed(2)) }))
    .sort((a, b) => b.total - a.total);
}

// Summary card data
async function getSummary(days = 30) {
  const from = daysAgo(days);
  const prev = daysAgo(days * 2);

  const [current, previous, resources] = await Promise.all([
    prisma.costRecord.aggregate({ where: { date: { gte: from } }, _sum: { costUsd: true } }),
    prisma.costRecord.aggregate({ where: { date: { gte: prev, lt: from } }, _sum: { costUsd: true } }),
    prisma.resource.count({ where: { status: 'IDLE' } }),
  ]);

  const currentTotal = current._sum.costUsd || 0;
  const previousTotal = previous._sum.costUsd || 0;
  const changePercent = previousTotal
    ? parseFloat((((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1))
    : 0;

  return {
    totalCost: parseFloat(currentTotal.toFixed(2)),
    previousCost: parseFloat(previousTotal.toFixed(2)),
    changePercent,
    idleResources: resources,
    periodDays: days,
  };
}

module.exports = {
  generateCostRecords,
  generateResources,
  getDailyCosts,
  getCostByService,
  getCostByTeam,
  getSummary,
};