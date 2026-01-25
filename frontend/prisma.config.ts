import { defineConfig } from '@prisma/config';

export default defineConfig({
    schema: './prisma/schema.prisma',
    migrations: {
        seed: 'ts-node --compiler-options "{\\\"module\\\":\\\"commonjs\\\"}" --skip-project prisma/seed_users.ts',
    },
    datasource: {
        url: 'file:./dev.db',
    },
});
