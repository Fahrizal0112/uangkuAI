-- AlterTable
ALTER TABLE `Category` MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Transactions` ADD COLUMN `description` VARCHAR(191) NULL;
