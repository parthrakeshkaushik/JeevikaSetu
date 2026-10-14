import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.livelihoodReport.count();
  console.log('Total livelihood reports in DB:', count);
  
  const reports = await prisma.livelihoodReport.findMany({
    select: {
      id: true,
      reportNumber: true,
      citizenName: true,
      citizenEmail: true,
      citizenPhone: true,
      district: true,
      status: true,
      submittedAt: true,
    },
    orderBy: { submittedAt: 'desc' },
  });

  console.log('Reports found:');
  reports.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.reportNumber}] ${r.citizenName} | ${r.district} | ${r.status} | Email: ${r.citizenEmail || 'NONE'} | Phone: ${r.citizenPhone}`);
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
