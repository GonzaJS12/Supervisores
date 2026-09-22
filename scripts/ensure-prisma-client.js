/**
 * Runs after npm install. Generates the Prisma client when DATABASE_URL
 * is already available (shell or .env). A clean clone can install first
 * and generate later, once .env exists.
 */
require('dotenv').config();

const { execSync } = require('child_process');

if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.trim()) {
  console.log(
    'DATABASE_URL no está definida. Se omite prisma generate. Después de completar .env, ejecutá: npx prisma generate',
  );
  process.exit(0);
}

execSync('npx prisma generate', { stdio: 'inherit' });
