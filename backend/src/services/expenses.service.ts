import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { AuthContext } from "../types/api";
import { assertFound } from "../utils/errors";
import { getPagination, toPaginatedResult } from "../utils/pagination";
import type { CreateExpenseInput, ExpensesQuery, UpdateExpenseInput } from "../validators/expenses.validators";
import { requireCompanyProject } from "./companyScope.service";

export async function listExpenses(currentUser: AuthContext, query: ExpensesQuery) {
  const pagination = getPagination(query);
  const where: Prisma.ExpenseWhereInput = { companyId: currentUser.companyId };

  if (query.projectId) {
    where.projectId = query.projectId;
  }

  const [total, expenses] = await prisma.$transaction([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      skip: pagination.skip,
      take: pagination.take
    })
  ]);

  return toPaginatedResult(expenses, total, query);
}

export async function createExpense(currentUser: AuthContext, input: CreateExpenseInput) {
  await requireCompanyProject(input.projectId, currentUser.companyId);

  return prisma.expense.create({
    data: {
      companyId: currentUser.companyId,
      projectId: input.projectId,
      category: input.category || null,
      description: input.description || null,
      amount: input.amount,
      date: input.date
    }
  });
}

export async function updateExpense(currentUser: AuthContext, expenseId: string, input: UpdateExpenseInput) {
  const existing = await prisma.expense.findFirst({
    where: { id: expenseId, companyId: currentUser.companyId },
    select: { id: true }
  });

  assertFound(existing, "Expense was not found in this company.");

  const data: Prisma.ExpenseUpdateInput = {};
  if (input.category !== undefined) data.category = input.category || null;
  if (input.description !== undefined) data.description = input.description || null;
  if (input.amount !== undefined) data.amount = input.amount;
  if (input.date !== undefined) data.date = input.date;

  return prisma.expense.update({ where: { id: expenseId }, data });
}

export async function deleteExpense(currentUser: AuthContext, expenseId: string) {
  const existing = await prisma.expense.findFirst({
    where: { id: expenseId, companyId: currentUser.companyId },
    select: { id: true }
  });

  assertFound(existing, "Expense was not found in this company.");

  await prisma.expense.delete({ where: { id: expenseId } });
}
