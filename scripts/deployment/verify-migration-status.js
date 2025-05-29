#!/usr/bin/env node

/**
 * Migration Status Verification Script
 * Ensures production database is up-to-date with schema
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function verifyMigrationStatus() {
    console.log('🔍 Checking migration status...');

    try {
        const { stdout, stderr } = await execAsync('npx prisma migrate status');

        if (stderr && stderr.includes('pending')) {
            console.error('❌ CRITICAL: Pending migrations detected!');
            console.error('Run: npm run db:migrate:production');
            process.exit(1);
        }

        if (stdout.includes('Database schema is up to date')) {
            console.log('✅ Database schema is up to date');
            return true;
        } else {
            console.error('❌ Migration status unclear:', stdout);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Failed to check migration status:', error.message);
        process.exit(1);
    }
}

async function main() {
    if (process.env.NODE_ENV === 'production') {
        await verifyMigrationStatus();
    } else {
        console.log('ℹ️  Skipping migration check (not production)');
    }
}

main().catch(console.error); 