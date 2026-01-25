const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dev.db');
const db = sqlite3(dbPath);

async function createUser() {
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash('Test123!', 12);

        // Create organization
        const orgId = `org_${Date.now()}`;
        const orgInsert = db.prepare(`
            INSERT INTO Organization (id, name, slug, plan, subscriptionStatus, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        orgInsert.run(
            orgId,
            'Test Organization',
            `org-test-${Date.now()}`,
            'FREE',
            'INACTIVE',
            new Date().toISOString(),
            new Date().toISOString()
        );

        // Create user
        const userId = `user_${Date.now()}`;
        const userInsert = db.prepare(`
            INSERT INTO User (id, email, name, password, role, orgId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        userInsert.run(
            userId,
            'test@bouclier.io',
            'Test User',
            hashedPassword,
            'USER',
            orgId,
            new Date().toISOString(),
            new Date().toISOString()
        );

        console.log('✅ User created successfully!');
        console.log('📧 Email: test@bouclier.io');
        console.log('🔑 Password: Test123!');
        console.log('\n🚀 You can now login at: http://localhost:3002/login');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        db.close();
    }
}

createUser();
