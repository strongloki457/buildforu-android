import { MaterialRequestStatus, PrismaClient, ProjectStatus, Role, TaskStatus } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

async function main() {
  const [adminPasswordHash, employeePasswordHash] = await Promise.all([
    hashPassword("admin123"),
    hashPassword("worker123")
  ]);

  const company = await prisma.company.upsert({
    where: { id: "company_demo_buildforu" },
    update: {
      name: "BuildForU Demo Construction",
      plan: "enterprise"
    },
    create: {
      id: "company_demo_buildforu",
      name: "BuildForU Demo Construction",
      plan: "enterprise"
    }
  });

  const worker = await prisma.worker.upsert({
    where: { id: "worker_demo_alex" },
    update: {
      name: "Alex Novak",
      email: "worker@buildforu.com",
      phone: "+49 151 555 0111",
      notes: "Demo employee linked to the seed worker account.",
      companyId: company.id,
      deletedAt: null
    },
    create: {
      id: "worker_demo_alex",
      name: "Alex Novak",
      email: "worker@buildforu.com",
      phone: "+49 151 555 0111",
      notes: "Demo employee linked to the seed worker account.",
      companyId: company.id
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@buildforu.com" },
    update: {
      name: "Sophie Carter",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      companyId: company.id,
      workerId: null,
      emailVerified: true
    },
    create: {
      name: "Sophie Carter",
      email: "admin@buildforu.com",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      companyId: company.id,
      emailVerified: true
    }
  });

  await prisma.user.upsert({
    where: { email: "worker@buildforu.com" },
    update: {
      name: "Alex Novak",
      passwordHash: employeePasswordHash,
      role: Role.EMPLOYEE,
      companyId: company.id,
      workerId: worker.id,
      emailVerified: true
    },
    create: {
      name: "Alex Novak",
      email: "worker@buildforu.com",
      passwordHash: employeePasswordHash,
      role: Role.EMPLOYEE,
      companyId: company.id,
      workerId: worker.id,
      emailVerified: true
    }
  });

  const project = await prisma.project.upsert({
    where: { id: "project_demo_north_river" },
    update: {
      name: "North River Residences",
      status: ProjectStatus.IN_PROGRESS,
      note: "Seed project for backend/frontend integration testing.",
      companyId: company.id,
      deletedAt: null
    },
    create: {
      id: "project_demo_north_river",
      name: "North River Residences",
      status: ProjectStatus.IN_PROGRESS,
      note: "Seed project for backend/frontend integration testing.",
      companyId: company.id
    }
  });

  await prisma.workerProject.upsert({
    where: {
      workerId_projectId: {
        workerId: worker.id,
        projectId: project.id
      }
    },
    update: {},
    create: {
      workerId: worker.id,
      projectId: project.id
    }
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  await prisma.task.upsert({
    where: { id: "task_demo_slab_inspection" },
    update: {
      title: "Concrete slab inspection",
      description: "Demo task assigned to the seed worker and project.",
      date: tomorrow,
      status: TaskStatus.TODO,
      companyId: company.id,
      workerId: worker.id,
      projectId: project.id
    },
    create: {
      id: "task_demo_slab_inspection",
      title: "Concrete slab inspection",
      description: "Demo task assigned to the seed worker and project.",
      date: tomorrow,
      status: TaskStatus.TODO,
      companyId: company.id,
      workerId: worker.id,
      projectId: project.id
    }
  });

  await prisma.materialRequest.upsert({
    where: { id: "material_demo_cement" },
    update: {
      itemName: "Cement bags",
      quantity: "24 bags",
      note: "Needed for slab preparation.",
      status: MaterialRequestStatus.PENDING,
      companyId: company.id,
      requesterWorkerId: worker.id,
      projectId: project.id
    },
    create: {
      id: "material_demo_cement",
      itemName: "Cement bags",
      quantity: "24 bags",
      note: "Needed for slab preparation.",
      status: MaterialRequestStatus.PENDING,
      companyId: company.id,
      requesterWorkerId: worker.id,
      projectId: project.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.stdout.write("BuildForU seed data created.\n");
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });
