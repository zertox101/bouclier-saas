
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function test() {
    console.log("Testing Prisma Connection...");
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@bouclier.ma' }
        });
        console.log("User found:", user);

        if (user && user.password) {
            const isValid = await bcrypt.compare('Bouclier2026!', user.password);
            console.log("Password valid:", isValid);
        }
    } catch (e) {
        console.error("Prisma Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
