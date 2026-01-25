import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as path from 'path';

// Explicitly set the database URL
process.env.DATABASE_URL = `file:${path.join(process.cwd(), 'dev.db')}`;

const prisma = new PrismaClient();

async function createTestUser() {
    try {
        // Hash the password
        const hashedPassword = await hash('Test123!', 12);

        // Create organization first
        const org = await prisma.organization.create({
            data: {
                name: "Test Organization",
                slug: `org-test-${Date.now()}`,
                plan: "FREE"
            }
        });

        // Create user
        const user = await prisma.user.create({
            data: {
                email: "test@bouclier.io",
                name: "Test User",
                password: hashedPassword,
                role: "USER",
                orgId: org.id
            }
        });

        console.log('✅ User created successfully!');
        console.log('📧 Email:', user.email);
        console.log('🔑 Password: Test123!');
        console.log('🏢 Organization:', org.name);
        console.log('\n🚀 You can now login at: http://localhost:3002/login');

    } catch (error) {
        console.error('❌ Error creating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();
