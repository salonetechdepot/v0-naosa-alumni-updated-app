-- Add TransactionType enum
CREATE TYPE "TransactionType" AS ENUM ('registration', 'donation', 'contribution');

-- Add type column to Transaction table with default value for existing records
ALTER TABLE "Transaction" ADD COLUMN "type" "TransactionType" NOT NULL DEFAULT 'registration';

-- Add description column for optional notes (especially useful for donations/contributions)
ALTER TABLE "Transaction" ADD COLUMN "description" TEXT;

-- Make memberId nullable for standalone donations/contributions (not tied to registration)
ALTER TABLE "Transaction" ALTER COLUMN "memberId" DROP NOT NULL;

-- Drop the foreign key constraint temporarily
ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_memberId_fkey";

-- Re-add foreign key with ON DELETE SET NULL for flexibility
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_memberId_fkey" 
  FOREIGN KEY ("memberId") REFERENCES "Member"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for transaction type for filtering
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
