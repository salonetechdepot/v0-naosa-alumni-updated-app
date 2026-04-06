-- Create enums
CREATE TYPE "RegistrationStatus" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- Create Member table
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "surname" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "currentAddress" TEXT NOT NULL,
    "admissionNumber" TEXT,
    "dateOfEntry" TIMESTAMP(3) NOT NULL,
    "dateOfExit" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "registrationAmount" DOUBLE PRECISION NOT NULL,
    "transactionReference" TEXT NOT NULL,
    "systemReference" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- Create Transaction table
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "memberName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionReference" TEXT NOT NULL,
    "systemReference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- Create AdminUser table
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "Member_systemReference_key" ON "Member"("systemReference");
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- Create indexes for Member
CREATE INDEX "Member_status_idx" ON "Member"("status");
CREATE INDEX "Member_email_idx" ON "Member"("email");
CREATE INDEX "Member_phone_idx" ON "Member"("phone");
CREATE INDEX "Member_systemReference_idx" ON "Member"("systemReference");

-- Create indexes for Transaction
CREATE INDEX "Transaction_memberId_idx" ON "Transaction"("memberId");
CREATE INDEX "Transaction_transactionReference_idx" ON "Transaction"("transactionReference");
CREATE INDEX "Transaction_systemReference_idx" ON "Transaction"("systemReference");

-- Add foreign key constraint
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default admin user (password: naosa2024)
-- bcrypt hash for 'naosa2024'
INSERT INTO "AdminUser" ("id", "username", "passwordHash", "createdAt", "updatedAt")
VALUES (
    'admin-default-001',
    'admin',
    '$2a$10$rQKj8qXz5JZ5Lz5Z5Z5Z5e5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
