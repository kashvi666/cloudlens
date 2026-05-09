const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

// ── Generate JWT ──────────────────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// ── Register ──────────────────────────────────────────────────
async function register({ email, password, name }) {
  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw { status: 409, message: 'Email already registered' };
  }

  // Validate password strength
  if (password.length < 8) {
    throw { status: 400, message: 'Password must be at least 8 characters' };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, passwordHash, name, role: 'VIEWER' },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  const token = generateToken(user);
  return { user, token };
}

// ── Login ─────────────────────────────────────────────────────
async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
}

// ── Get Current User ──────────────────────────────────────────
async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  if (!user) throw { status: 404, message: 'User not found' };
  return user;
}

module.exports = { register, login, getMe };