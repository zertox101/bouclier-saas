# 🗄️ Next.js SaaS Database Implementation Plan

The project currently has a Python backend database, but the **Next.js Frontend** lacks its own direct database connection to handle SaaS features (Auth, Subscriptions, Teams) independently or alongside the backend.

## ❌ What is Missing?

To implement a full "SaaS" architecture in Next.js, we are missing:

### 1. ORM & Schema (Prisma)
- **`prisma/schema.prisma`**: The definitive schema file.
- **Prisma Client**: To query the DB from Next.js API routes / Server Actions.

### 2. SaaS Data Models
The current backend has technical logs (`AuditLog`, `EventLog`), but lacks **business logic** tables:
- **`Account`**: For NextAuth.js (Google/GitHub login).
- **`Session`**: For secure user sessions.
- **`Organization`**: To group users into teams/companies.
- **`Subscription`**: To track Stripe status (Active, Past_due), Plan ID (Starter, Team), and Billing Cycle.
- **`Invoice`**: To show billing history to users.

### 3. Connection Config
- **`DATABASE_URL`**: Environment variable to connect to the Postgres instance.

---

## 🛠️ Proposed Schema (`schema.prisma`)

This schema is designed to bridge the gap between "Technical Security App" and "SaaS Product".

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "mysql" / "sqlite"
  url      = env("DATABASE_URL")
}

// User & Auth (Compatible with NextAuth.js)
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(USER)
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  organization  Organization? @relation(fields: [orgId], references: [id])
  orgId         String?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// SaaS Business Logic
model Organization {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique // e.g. app.bouclier.com/org/acme-corp
  
  // Subscription Info
  plan          PlanType  @default(FREE)
  stripeCustomerId String? @unique
  stripeSubscriptionId String? @unique
  subscriptionStatus SubscriptionStatus @default(INACTIVE)
  
  users         User[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Enums
enum UserRole {
  USER
  ADMIN
  ANALYST
}

enum PlanType {
  FREE
  STARTER
  TEAM
  ENTERPRISE
}

enum SubscriptionStatus {
  active
  canceled
  incomplete
  past_due
  trialing
  unpaid
  INACTIVE
}
```

## 🚀 Next Steps (Action Plan)

1.  **Initialize Prisma**: `npx prisma init`
2.  **Apply Schema**: Copy the schema above.
3.  **Generate Client**: `npx prisma generate`
4.  **Run Migration**: `npx prisma migrate dev --name init_saas`
5.  **Install NextAuth**: Connect the `User` model to the login system.

Shall we proceed with **Initializing Prisma**?
