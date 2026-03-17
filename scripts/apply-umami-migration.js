require('dotenv/config');
const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const sql = fs.readFileSync('prisma/migrations/20260317134500_remove_umami_seasoning_category/migration.sql', 'utf8');
  const parsed = new URL(process.env.DATABASE_URL);

  const client = new Client({
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password || ''),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, '') || 'postgres'),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('manual_migration_applied', true);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('manual_migration_error', e?.message || String(e));
  process.exit(1);
});
