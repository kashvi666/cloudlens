const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Constants ─────────────────────────────────────────────────
const RESOURCE_TYPES = [
  'Virtual Machine',
  'Blob Storage',
  'SQL Database',
  'App Service',
  'Functions',
  'Redis Cache',
  'Kubernetes Node',
  'Load Balancer',
];

const TEAMS    = ['frontend', 'backend', 'data', 'devops', 'ml'];
const PROJECTS = ['cloudlens-prod', 'data-pipeline', 'api-gateway', 'ml-training', 'analytics'];
const REGIONS  = ['East US', 'West Europe', 'Southeast Asia', 'Central India'];

function randomBetween(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// ── Simulate live CPU/memory drift on every API call ─────────
// This makes the heatmap feel "live" — values shift slightly each request
function addDrift(base, maxDrift = 8) {
  const drift = (Math.random() - 0.5) * maxDrift;
  return Math.min(100, Math.max(0, parseFloat((base + drift).toFixed(1))));
}

// ── Filter builder ────────────────────────────────────────────
function buildWhere(filters = {}) {
  const where = {};
  if (filters.team)    where.team    = filters.team;
  if (filters.project) where.project = filters.project;
  if (filters.type)    where.type    = filters.type;
  if (filters.status)  where.status  = filters.status;
  if (filters.provider) where.cloudProvider = filters.provider;
  if (filters.region)   where.region        = filters.region;
  return where;
}

// ── Get all resources with optional filters ───────────────────
async function getResources(filters = {}) {
  const where = buildWhere(filters);

  const resources = await prisma.resource.findMany({
    where,
    orderBy: [{ team: 'asc' }, { type: 'asc' }],
  });

  // Add simulated live drift to CPU/memory
  return resources.map(r => ({
    ...r,
    cpuUsage:    addDrift(r.cpuUsage),
    memoryUsage: addDrift(r.memoryUsage),
    // Compute a health score (0–100, higher = healthier)
    healthScore: computeHealth(r),
    // Flag resources that need attention
    needsAttention: r.status === 'IDLE' || r.cpuUsage > 85 || r.memoryUsage > 85,
  }));
}

// ── Health score formula ──────────────────────────────────────
function computeHealth(resource) {
  let score = 100;
  if (resource.status === 'IDLE')         score -= 40;
  if (resource.status === 'SCALED_DOWN')  score -= 20;
  if (resource.cpuUsage > 85)             score -= 25;
  if (resource.memoryUsage > 85)          score -= 20;
  if (resource.cpuUsage < 5 && resource.status === 'RUNNING') score -= 15; // running but idle
  return Math.max(0, score);
}

// ── Heatmap data — grouped by team × service ─────────────────
// Returns a matrix perfect for the CSS grid heatmap on Day 9
async function getHeatmapData(filters = {}) {
  const where = buildWhere(filters);
  const resources = await prisma.resource.findMany({ where });

  // Build matrix: team → service → { avgCpu, avgMem, count, totalCost }
  const matrix = {};

  for (const r of resources) {
    if (!matrix[r.team]) matrix[r.team] = {};
    if (!matrix[r.team][r.type]) {
      matrix[r.team][r.type] = {
        cpuSum: 0, memSum: 0, costSum: 0, count: 0, idleCount: 0,
      };
    }
    const cell = matrix[r.team][r.type];
    cell.cpuSum   += r.cpuUsage;
    cell.memSum   += r.memoryUsage;
    cell.costSum  += r.monthlyCostUsd;
    cell.count    += 1;
    if (r.status === 'IDLE') cell.idleCount += 1;
  }

  // Flatten to array of cell objects
  const cells = [];
  for (const [team, services] of Object.entries(matrix)) {
    for (const [service, data] of Object.entries(services)) {
      const avgCpu = parseFloat((data.cpuSum / data.count).toFixed(1));
      const avgMem = parseFloat((data.memSum / data.count).toFixed(1));
      cells.push({
        team,
        service,
        avgCpu,
        avgMem,
        avgCost:    parseFloat((data.costSum / data.count).toFixed(2)),
        totalCost:  parseFloat(data.costSum.toFixed(2)),
        count:      data.count,
        idleCount:  data.idleCount,
        // Heat value drives cell color: blend of cpu + memory usage
        heatValue:  parseFloat(((avgCpu * 0.6 + avgMem * 0.4)).toFixed(1)),
      });
    }
  }

  return {
    cells,
    teams:    [...new Set(cells.map(c => c.team))].sort(),
    services: [...new Set(cells.map(c => c.service))].sort(),
  };
}

// ── Summary stats for resource overview cards ─────────────────
async function getResourceSummary() {
  const [total, idle, running, scaledDown] = await Promise.all([
    prisma.resource.count(),
    prisma.resource.count({ where: { status: 'IDLE'        } }),
    prisma.resource.count({ where: { status: 'RUNNING'     } }),
    prisma.resource.count({ where: { status: 'SCALED_DOWN' } }),
  ]);

  const costAgg = await prisma.resource.aggregate({
    _sum: { monthlyCostUsd: true },
    _avg: { cpuUsage: true, memoryUsage: true },
  });

  const highCpu = await prisma.resource.count({
    where: { cpuUsage: { gt: 85 } },
  });

  return {
    total,
    idle,
    running,
    scaledDown,
    highCpu,
    totalMonthlyCost: parseFloat((costAgg._sum.monthlyCostUsd || 0).toFixed(2)),
    avgCpuUsage:      parseFloat((costAgg._avg.cpuUsage       || 0).toFixed(1)),
    avgMemoryUsage:   parseFloat((costAgg._avg.memoryUsage     || 0).toFixed(1)),
    wastedCost:       await getWastedCost(),
  };
}

// Estimate wasted spend from idle resources
async function getWastedCost() {
  const idle = await prisma.resource.findMany({
    where:  { status: 'IDLE' },
    select: { monthlyCostUsd: true },
  });
  return parseFloat(idle.reduce((s, r) => s + r.monthlyCostUsd, 0).toFixed(2));
}

// ── Get single resource by ID ─────────────────────────────────
async function getResourceById(id) {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw { status: 404, message: 'Resource not found' };
  return { ...resource, healthScore: computeHealth(resource) };
}

// ── Simulate scale-down action (auto-remediation preview) ─────
async function scaleDownResource(id) {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw { status: 404, message: 'Resource not found' };
  if (resource.status !== 'IDLE') {
    throw { status: 400, message: 'Only IDLE resources can be scaled down' };
  }

  const updated = await prisma.resource.update({
    where: { id },
    data: {
      status:    'SCALED_DOWN',
      cpuUsage:  0,
      memoryUsage: 0,
    },
  });

  return {
    resource: updated,
    savedMonthlyCost: parseFloat((resource.monthlyCostUsd * 0.7).toFixed(2)),
    message: `Resource ${resource.name} scaled down. Estimated 70% cost reduction.`,
  };
}

// ── Filter option values for dropdowns ────────────────────────
async function getResourceFilterOptions() {
  const [types, teams, projects, statuses, regions] = await Promise.all([
    prisma.resource.findMany({ distinct: ['type'],    select: { type:    true } }),
    prisma.resource.findMany({ distinct: ['team'],    select: { team:    true } }),
    prisma.resource.findMany({ distinct: ['project'], select: { project: true } }),
    prisma.resource.findMany({ distinct: ['status'],  select: { status:  true } }),
    prisma.resource.findMany({ distinct: ['region'],  select: { region:  true } }),
  ]);

  return {
    types:    types.map(r => r.type),
    teams:    teams.map(r => r.team),
    projects: projects.map(r => r.project),
    statuses: statuses.map(r => r.status),
    regions:  regions.map(r => r.region),
  };
}

module.exports = {
  getResources,
  getHeatmapData,
  getResourceSummary,
  getResourceById,
  scaleDownResource,
  getResourceFilterOptions,
};