import { createSlice } from "@reduxjs/toolkit";
import { INVOICE_STATUS_OPTIONS } from "../utils/constant";

const mockInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-1",
    clientName: "Acme Corporation",
    clientEmail: "billing@acme.com",
    clientAddress: "123 Business St, City, State 12345",
    dueDate: "2024-01-15",
    status: INVOICE_STATUS_OPTIONS.OUTSTANDING,
    notes: "Payment due within 30 days",
    paymentInstructions: "Wire transfer to account #12345",
    lineItems: [
      {
        id: "1",
        description: "Web Development",
        type: "hours",
        quantity: 40,
        rate: 100,
      },
      {
        id: "2",
        description: "Domain Registration",
        type: "expense",
        quantity: 1,
        rate: 15,
      },
    ],
    subtotal: 4015,
    tax: 0,
    total: 4015,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    invoiceNumber: "INV-2",
    clientName: "Tech Solutions Inc",
    clientEmail: "accounts@techsolutions.com",
    clientAddress: "456 Tech Ave, Innovation City, State 67890",
    dueDate: "2023-12-01",
    status: INVOICE_STATUS_OPTIONS.DRAFT,
    notes: "Urgent payment required",
    paymentInstructions: "Check payable to Invoice Manager",
    lineItems: [
      {
        id: "3",
        description: "Consulting Services",
        type: "hours",
        quantity: 20,
        rate: 150,
      },
      {
        id: "4",
        description: "Software License",
        type: "expense",
        quantity: 1,
        rate: 500,
      },
    ],
    subtotal: 3500,
    tax: 0,
    total: 3500,
    createdAt: "2023-11-01T00:00:00.000Z",
    updatedAt: "2023-11-01T00:00:00.000Z",
  },
];

const initialState = {
  invoices: [...mockInvoices],
  loading: false,
  error: null,
};

const invoiceSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    createInvoice: (state, action) => {
      state.invoices.push(action.payload);
    },
    updateInvoice: (state, action) => {
      const { id, updates } = action.payload;

      const index = state.invoices.findIndex((invoice) => invoice.id === id);
      if (index !== -1) {
        const total = updates.lineItems.reduce((total, item) => {
          const quantity = Number.parseFloat(item.quantity) || 0;
          const rate = Number.parseFloat(item.rate) || 0;
          return total + quantity * rate;
        }, 0);
        state.invoices[index] = {
          ...state.invoices[index],
          ...updates,
          subtotal: total,
          total,
        };
      }
    },
    updateInvoiceStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.invoices.findIndex((invoice) => invoice.id === id);
      if (index !== -1) {
        state.invoices[index].status = status;
        state.invoices[index].updatedAt = new Date().toISOString();
      }
    },
    deleteInvoice: (state, action) => {
      const id = action.payload.id;
      state.invoices = state.invoices.filter((invoice) => invoice.id !== id);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  setLoading,
  setError,
} = invoiceSlice.actions;

export const selectAllInvoices = (state) => {
  return state.invoices.invoices;
};
export const selectInvoiceById = (state, id) =>
  state.invoices.invoices.find((invoice) => invoice.id === id);
export const selectOverdueInvoices = (state) => {
  const today = new Date();
  return state.invoices.invoices.filter(
    (invoice) =>
      (invoice.status === INVOICE_STATUS_OPTIONS.OUTSTANDING ||
        invoice.status === INVOICE_STATUS_OPTIONS.LATE) &&
      new Date(invoice.dueDate) < today
  );
};
export const selectInvoicesLoading = (state) => state.invoices.loading;
export const selectInvoicesError = (state) => state.invoices.error;

export default invoiceSlice.reducer;
