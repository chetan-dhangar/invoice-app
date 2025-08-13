import { useSelector, useDispatch } from "react-redux";
import {
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  selectAllInvoices,
  selectInvoiceById,
  selectOverdueInvoices,
} from "../store/invoiceSlice";

export function useInvoiceStore() {
  const dispatch = useDispatch();
  const invoices = useSelector(selectAllInvoices);

  return {
    invoices,
    createInvoice: (invoiceData) => dispatch(createInvoice(invoiceData)),
    updateInvoice: (id, updates) => dispatch(updateInvoice({ id, updates })),
    updateInvoiceStatus: (id, status) =>
      dispatch(updateInvoiceStatus({ id, status })),
    deleteInvoice: (id) => dispatch(deleteInvoice({ id })),
    getInvoiceById: (id) => {
      return (state) => selectInvoiceById(state, id);
    },
    getOverdueInvoices: () => {
      return (state) => selectOverdueInvoices(state);
    },
  };
}

export function useInvoiceById(id) {
  return useSelector((state) => selectInvoiceById(state, id));
}

export function useOverdueInvoices() {
  return useSelector(selectOverdueInvoices);
}
