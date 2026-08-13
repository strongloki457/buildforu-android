import { Role } from "@prisma/client";
import { Router } from "express";
import * as expensesController from "../controllers/expenses.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requirePlan } from "../middleware/plan.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validators";
import { createExpenseSchema, expensesQuerySchema, updateExpenseSchema } from "../validators/expenses.validators";

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.ADMIN));
router.use(requirePlan("pro", "business", "enterprise"));

router.get("/", validate({ query: expensesQuerySchema }), expensesController.listExpenses);
router.post("/", validate({ body: createExpenseSchema }), expensesController.createExpense);
router.patch(
  "/:id",
  validate({ params: idParamSchema, body: updateExpenseSchema }),
  expensesController.updateExpense
);
router.delete("/:id", validate({ params: idParamSchema }), expensesController.deleteExpense);

export default router;
