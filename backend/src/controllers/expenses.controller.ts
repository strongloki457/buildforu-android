import type { Request, Response } from "express";
import * as expensesService from "../services/expenses.service";
import type { ExpensesQuery } from "../validators/expenses.validators";
import { asyncHandler } from "../utils/asyncHandler";

export const listExpenses = asyncHandler(async (req: Request, res: Response) => {
  const result = await expensesService.listExpenses(req.user!, req.query as unknown as ExpensesQuery);
  res.json(result);
});

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expensesService.createExpense(req.user!, req.body);
  res.status(201).json({ expense });
});

export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expensesService.updateExpense(req.user!, req.params.id, req.body);
  res.json({ expense });
});

export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  await expensesService.deleteExpense(req.user!, req.params.id);
  res.status(204).send();
});
