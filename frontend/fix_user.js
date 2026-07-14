const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

async function fix() {
    // Path relative to the frontend directory
    const dbPath = path.join(process.cwd(), 'dev.db');
    const db = new Database(dbPath);

    console.log('Fixing user in:', dbPath);

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('admin', salt);

    // Get an org ID
    const org = db.prepare('SELECT id FROM Organization LIMIT 1').get();
    const orgId = org ? org.id : null;

    const user = {
        id: 'cl_admin_local_new',
        email: 'admin@local',
        name: 'Admin Local',
        password: hashedPass,
        role: 'SUPER_ADMIN',
        orgId: orgId
    };

    db.prepare(`
        INSERT OR REPLACE INTO User (id, email, name, password, role, orgId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, DATETIME('now'), DATETIME('now'))
    `).run(user.id, user.email, user.name, user.password, user.role, user.orgId);

    console.log('Admin user admin@local inserted successfully into dev.db.');
    db.close();
}

fix().catch(console.error);
