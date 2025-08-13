export const INVOICE_STATUS_OPTIONS = {
  DRAFT: "draft",
  OUTSTANDING: "outstanding",
  PAID: "paid",
  LATE: "late",
};

export const statusOptions = [
  { value: INVOICE_STATUS_OPTIONS.DRAFT, label: "Draft" },
  { value: INVOICE_STATUS_OPTIONS.DRAFT, label: "Outstanding" },
  { value: INVOICE_STATUS_OPTIONS.PAID, label: "Paid" },
  { value: INVOICE_STATUS_OPTIONS.LATE, label: "Late" },
];

export const LINE_ITEM_TYPES = {
  HOURS: "hours",
  EXPENSE: "expense",
  MATERIAL: "material",
  LABOR: "labor",
};

export const LINE_ITEM_OPTIONS = [
  { value: LINE_ITEM_TYPES.HOURS, label: "Hours" },
  { value: LINE_ITEM_TYPES.EXPENSE, label: "Expense" },
  { value: LINE_ITEM_TYPES.MATERIAL, label: "Material" },
  { value: LINE_ITEM_TYPES.LABOR, label: "Labor" },
];
