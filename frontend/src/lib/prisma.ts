import { PrismaClient } from '@prisma/client'
import path from 'path'

const prismaClientSingleton = () => {
    try {
        const dbPath = path.join(process.cwd(), 'dev.db')
        console.log('[Prisma] Initializing with default config (DATABASE_URL env)...')
        return new PrismaClient()
    } catch (error: any) {
        console.error('[Prisma] Initialization failed:', error)
        throw error
    }
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
