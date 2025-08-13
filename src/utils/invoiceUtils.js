import { INVOICE_STATUS_OPTIONS } from "./constant";

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getInvoiceStatusColor = (status) => {
  switch (status) {
    case INVOICE_STATUS_OPTIONS.PAID:
      return "success";
    case INVOICE_STATUS_OPTIONS.OUTSTANDING:
      return "warning";
    case INVOICE_STATUS_OPTIONS.LATE:
      return "error";
    case INVOICE_STATUS_OPTIONS.DRAFT:
      return "default";
    default:
      return "default";
  }
};

export const isInvoiceLate = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  return due < today;
};

export const calculateDaysOverdue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const calculateLineItemAmount = (quantity, rate) => {
  return (Number.parseFloat(quantity) || 0) * (Number.parseFloat(rate) || 0);
};

export const calculateInvoiceTotals = (lineItems) => {
  const subtotal = lineItems.reduce((total, item) => {
    return total + calculateLineItemAmount(item.quantity, item.rate);
  }, 0);

  return {
    subtotal,
    tax: 0,
    total: subtotal,
  };
};

export const getStatusColor = (status) => {
  return getInvoiceStatusColor(status);
};

export const isInvoiceOverdue = (dueDate, status) => {
  if (status === INVOICE_STATUS_OPTIONS.PAID) return false;
  return isInvoiceLate(dueDate);
};
