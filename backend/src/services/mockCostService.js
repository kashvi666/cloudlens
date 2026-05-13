const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SERVICES = ['Compute', 'Storage', 'Networking', 'Database', 'Functions', 'AI/ML'];
const TEAMS    = ['frontend', 'backend', 'data', 'devops', 'ml'];
const PROJECTS = ['cloudlens-prod', 'data-pipeline', 'api-gateway', 'ml-training', 'analytics'];
const PROVIDERS = ['Azure', 'Azure', 'Azure', 'AWS'];
const REGIONS   = ['East US', 'West Europe', 'Southeast Asia', 'Central India'];

const BASE_COSTS = {
  Compute:    { min: 20,  max: 120 },
  Storage:    { min: 5,   max: 40  },
  Networking: { min: 8,   max: 35  },
  Database:   { min: 15,  max: 80  },
  Functions:  { min: 2,   max: 25  },
  'AI/ML':    { min: 30,  max: 200 },
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

function applySeasonality(baseCost, dayIndex) {
  const date     = daysAgo(dayIndex);
  const dow      = date.getDay();
  const dom      = date.getDate();
  let multiplier = 1;
  if (dow === 0 || dow === 6) multiplier *= 0.6;
  if (dom >= 14 && dom <= 16)  multiplier *= 1.4;
  if (Math.random() < 0.05)    multiplier *= 2.5; // spike
  return parseFloat((baseCost * multiplier).toFixed(2));
}

// ── Seed helpers (used by prisma/seed.js) ────────────────────

async function generateCostRecords(days = 90) {
  console.log(`🔄 Generating ${days} days of cost records...`);
  const records = [];

  for (let day = 0; day < days; day++) {
    for (const service of SERVICES) {
      const teamsToday = TEAMS.slice(0, Math.floor(Math.random() * 3) + 1);
      for (const team of teamsToday) {
        const { min, max } = BASE_COSTS[service];
        records.push({
          date:          daysAgo(day),
          service,
          team,
          project:       PROJECTS[Math.floor(Math.random() * PROJECTS.length)],
          cloudProvider: PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)],
          costUsd:       applySeasonality(randomBetween(min, max), day),
          resourceCount: Math.floor(Math.random() * 20 + 1),
          region:        REGIONS[Math.floor(Math.random() * REGIONS.length)],
        });
      }
    }
  }

  await prisma.costRecord.createMany({ data: records, skipDuplicates: false });
  console.log(`✅ ${records.length} cost records created`);
  return records.length;
}

async function generateResources() {
  console.log('🔄 Generating resource inventory...');
  const resourceTypes = [
    'Virtual Machine','Blob Storage','SQL Database',
    'App Service','Functions','Redis Cache','Kubernetes Node',
  ];
  const resources = [];

  for (let i = 0; i < 30; i++) {
    const team   = TEAMS[i % TEAMS.length];
    const type   = resourceTypes[i % resourceTypes.length];
    const isIdle = i % 7 === 0;
    resources.push({
      name:           `${team}-${type.toLowerCase().replace(/ /g, '-')}-${String(i).padStart(3,'0')}`,
      type,
      team,
      project:        PROJECTS[i % PROJECTS.length],
      status:         isIdle ? 'IDLE' : 'RUNNING',
      cpuUsage:       isIdle ? randomBetween(1,5)   : randomBetween(20,90),
      memoryUsage:    isIdle ? randomBetween(5,15)  : randomBetween(30,85),
      monthlyCostUsd: randomBetween(15,350),
      region:         REGIONS[i % REGIONS.length],
      cloudProvider:  i % 5 === 0 ? 'AWS' : 'Azure',
    });
  }

  await prisma.resource.createMany({ data: resources });
  console.log(`✅ ${resources.length} resources created`);
  return resources.length;
}

// ── Filter builder (shared across all query functions) ────────

function buildWhere(filters = {}) {
  const where = {};

  // Date range — support both preset (days) and explicit (from/to)
  if (filters.from || filters.to) {
    where.date = {};
    if (filters.from) where.date.gte = new Date(filters.from);
    if (filters.to)   where.date.lte = new Date(filters.to);
  } else if (filters.days) {
    where.date = { gte: daysAgo(parseInt(filters.days)) };
  }

  if (filters.team)     where.team          = filters.team;
  if (filters.service)  where.service       = filters.service;
  if (filters.project)  where.project       = filters.project;
  if (filters.provider) where.cloudProvider = filters.provider;
  if (filters.region)   where.region        = filters.region;

  return where;
}

// ── API query functions ───────────────────────────────────────

// 1. Daily totals (for line chart)
async function getDailyCosts(filters = {}) {
  const where = buildWhere({ days: 30, ...filters });

  const records = await prisma.costRecord.findMany({
    where,
    orderBy: { date: 'asc' },
    select:  { date: true, costUsd: true, service: true, team: true },
  });

  const grouped = {};
  for (const r of records) {
    const key = r.date.toISOString().split('T')[0];
    if (!grouped[key]) grouped[key] = { date: key, total: 0, breakdown: {} };
    grouped[key].total                       += r.costUsd;
    grouped[key].breakdown[r.service]         = (grouped[key].breakdown[r.service] || 0) + r.costUsd;
  }

  return Object.values(grouped).map(d => ({
    ...d,
    total: parseFloat(d.total.toFixed(2)),
  }));
}

// 2. Cost by service (for pie / bar chart)
async function getCostByService(filters = {}) {
  const where = buildWhere({ days: 30, ...filters });
  const records = await prisma.costRecord.findMany({ where, select: { service: true, costUsd: true } });

  const grouped = {};
  for (const r of records) grouped[r.service] = (grouped[r.service] || 0) + r.costUsd;

  return Object.entries(grouped)
    .map(([service, total]) => ({ service, total: parseFloat(total.toFixed(2)) }))
    .sort((a, b) => b.total - a.total);
}

// 3. Cost by team
async function getCostByTeam(filters = {}) {
  const where = buildWhere({ days: 30, ...filters });
  const records = await prisma.costRecord.findMany({ where, select: { team: true, costUsd: true } });

  const grouped = {};
  for (const r of records) grouped[r.team] = (grouped[r.team] || 0) + r.costUsd;

  return Object.entries(grouped)
    .map(([team, total]) => ({ team, total: parseFloat(total.toFixed(2)) }))
    .sort((a, b) => b.total - a.total);
}

// 4. Cost by project
async function getCostByProject(filters = {}) {
  const where = buildWhere({ days: 30, ...filters });
  const records = await prisma.costRecord.findMany({ where, select: { project: true, costUsd: true } });

  const grouped = {};
  for (const r of records) grouped[r.project] = (grouped[r.project] || 0) + r.costUsd;

  return Object.entries(grouped)
    .map(([project, total]) => ({ project, total: parseFloat(total.toFixed(2)) }))
    .sort((a, b) => b.total - a.total);
}

// 5. Summary card data (top-level metrics)
async function getSummary(filters = {}) {
  const days = parseInt(filters.days) || 30;
  const where     = buildWhere({ days, ...filters });
  const wherePrev = buildWhere({ days: days * 2, ...filters });
  wherePrev.date.lte = daysAgo(days); // previous period only

  const [current, previous, idleCount, alertCount] = await Promise.all([
    prisma.costRecord.aggregate({ where,     _sum: { costUsd: true }, _count: true }),
    prisma.costRecord.aggregate({ where: wherePrev, _sum: { costUsd: true } }),
    prisma.resource.count({ where: { status: 'IDLE' } }),
    prisma.alert.count({ where: { status: 'TRIGGERED' } }),
  ]);

  const currentTotal  = current._sum.costUsd  || 0;
  const previousTotal = previous._sum.costUsd || 0;
  const changePercent = previousTotal
    ? parseFloat((((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1))
    : 0;

  // Top service in this period
  const byService = await getCostByService(filters);
  const topService = byService[0] || null;

  // Anomaly detection — days where cost > 2x average
  const dailyData = await getDailyCosts(filters);
  const avg        = dailyData.reduce((s, d) => s + d.total, 0) / (dailyData.length || 1);
  const anomalies  = dailyData.filter(d => d.total > avg * 2);

  return {
    totalCost:     parseFloat(currentTotal.toFixed(2)),
    previousCost:  parseFloat(previousTotal.toFixed(2)),
    changePercent,
    idleResources: idleCount,
    triggeredAlerts: alertCount,
    topService,
    anomalyCount:  anomalies.length,
    anomalyDays:   anomalies.map(d => ({ date: d.date, total: d.total })),
    recordCount:   current._count,
    periodDays:    days,
  };
}

// 6. Paginated raw records (for data table)
async function getRawRecords(filters = {}) {
  const page  = parseInt(filters.page)  || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip  = (page - 1) * limit;
  const where = buildWhere({ days: 30, ...filters });

  const [records, total] = await Promise.all([
    prisma.costRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take:  limit,
      select: {
        id: true, date: true, service: true, team: true,
        project: true, costUsd: true, cloudProvider: true,
        region: true, resourceCount: true,
      },
    }),
    prisma.costRecord.count({ where }),
  ]);

  return {
    records,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// 7. Distinct filter values (to populate dropdowns)
async function getFilterOptions() {
  const [teams, services, projects, providers, regions] = await Promise.all([
    prisma.costRecord.findMany({ distinct: ['team'],          select: { team:          true } }),
    prisma.costRecord.findMany({ distinct: ['service'],       select: { service:       true } }),
    prisma.costRecord.findMany({ distinct: ['project'],       select: { project:       true } }),
    prisma.costRecord.findMany({ distinct: ['cloudProvider'], select: { cloudProvider: true } }),
    prisma.costRecord.findMany({ distinct: ['region'],        select: { region:        true } }),
  ]);

  return {
    teams:     teams.map(r => r.team),
    services:  services.map(r => r.service),
    projects:  projects.map(r => r.project),
    providers: providers.map(r => r.cloudProvider),
    regions:   regions.map(r => r.region),
  };
}

module.exports = {
  generateCostRecords,
  generateResources,
  getDailyCosts,
  getCostByService,
  getCostByTeam,
  getCostByProject,
  getSummary,
  getRawRecords,
  getFilterOptions,
};