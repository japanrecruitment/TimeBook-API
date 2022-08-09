-- CreateTable
CREATE TABLE "__PackagePlanCancelPolicies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "__PackagePlanCancelPolicies_AB_unique" ON "__PackagePlanCancelPolicies"("A", "B");

-- CreateIndex
CREATE INDEX "__PackagePlanCancelPolicies_B_index" ON "__PackagePlanCancelPolicies"("B");

-- AddForeignKey
ALTER TABLE "__PackagePlanCancelPolicies" ADD CONSTRAINT "__PackagePlanCancelPolicies_A_fkey" FOREIGN KEY ("A") REFERENCES "CancelPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PackagePlanCancelPolicies" ADD CONSTRAINT "__PackagePlanCancelPolicies_B_fkey" FOREIGN KEY ("B") REFERENCES "PackagePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
