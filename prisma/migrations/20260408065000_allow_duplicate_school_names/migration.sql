-- DropIndex
DROP INDEX "School_name_key";

-- CreateIndex
CREATE INDEX "School_name_idx" ON "School"("name");

-- CreateIndex
CREATE INDEX "School_address_idx" ON "School"("address");

-- CreateIndex
CREATE UNIQUE INDEX "School_name_address_key" ON "School"("name", "address");

-- CreateIndex
CREATE UNIQUE INDEX "School_neisRegionCode_neisCode_key" ON "School"("neisRegionCode", "neisCode");

