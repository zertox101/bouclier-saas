// @ts-ignore
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import path from 'path'

const prismaClientSingleton = () => {
    try {
        const dbPath = path.join(process.cwd(), 'dev.db')
        const dbUrl = `file:${dbPath}`
        console.log('[Prisma] Initializing with DB URL:', dbUrl)
        const adapter = new PrismaBetterSqlite3({ url: dbUrl })
        // @ts-ignore
        return new PrismaClient({ adapter }) as any
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
