import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack,
  Email,
  Visibility,
  Edit,
  Warning,
} from "@mui/icons-material";
import { useInvoiceStore } from "../hooks/useInvoiceStore";
import { useDispatch } from "react-redux";
import { updateInvoiceStatus } from "../store/invoiceSlice";
import {
  formatCurrency,
  formatDate,
  calculateDaysOverdue,
  isInvoiceLate,
} from "../utils/invoiceUtils";
import { INVOICE_STATUS_OPTIONS } from "../utils/constant";

function OverdueInvoices() {
  const navigate = useNavigate();
  const { invoices } = useInvoiceStore();
  const dispatch = useDispatch();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: "",
  });
  const [filterStatus, setFilterStatus] = useState("all");

  const overdueInvoices = invoices.filter((invoice) => {
    const isOverdue =
      invoice.status === INVOICE_STATUS_OPTIONS.LATE ||
      (invoice.status === INVOICE_STATUS_OPTIONS.OUTSTANDING &&
        isInvoiceLate(invoice.dueDate));

    if (filterStatus === "all") return isOverdue;
    if (filterStatus === INVOICE_STATUS_OPTIONS.LATE)
      return invoice.status === INVOICE_STATUS_OPTIONS.LATE;
    if (filterStatus === INVOICE_STATUS_OPTIONS.OUTSTANDING)
      return (
        invoice.status === INVOICE_STATUS_OPTIONS.OUTSTANDING &&
        isInvoiceLate(invoice.dueDate)
      );

    return isOverdue;
  });

  const totalOverdueAmount = overdueInvoices.reduce(
    (sum, invoice) => sum + invoice.total,
    0
  );

  const handleSendReminder = (invoice) => {
    setSelectedInvoice(invoice);
    setEmailData({
      to: invoice.clientEmail,
      subject: `Payment Reminder - Invoice ${invoice.invoiceNumber}`,
      message: `Dear ${invoice.clientName},

This is a friendly reminder that invoice ${
        invoice.invoiceNumber
      } for ${formatCurrency(invoice.total)} is now ${calculateDaysOverdue(
        invoice.dueDate
      )} days overdue.

Original due date: ${formatDate(invoice.dueDate)}

Thank you for your prompt attention to this matter.`,
    });
    setEmailDialogOpen(true);
  };

  const handleSendEmail = () => {
    alert("Reminder email sent successfully!");
    setEmailDialogOpen(false);
    setEmailData({ to: "", subject: "", message: "" });
    setSelectedInvoice(null);
  };

  const handleMarkAsPaid = (invoiceId) => {
    if (window.confirm("Mark this invoice as paid?")) {
      dispatch(updateInvoiceStatus({ id: invoiceId, status: "paid" }));
    }
  };

  const handleBulkReminders = () => {
    if (
      window.confirm(
        `Send reminder emails to all ${overdueInvoices.length} overdue clients?`
      )
    ) {
      alert(`Bulk reminder emails sent to ${overdueInvoices.length} clients!`);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/")} color="primary">
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Overdue Invoices
          </Typography>
          <Chip
            icon={<Warning />}
            label={`${overdueInvoices.length} overdue`}
            color="error"
            variant="outlined"
          />
        </Box>
        {overdueInvoices.length > 0 && (
          <Button
            variant="contained"
            color="warning"
            onClick={handleBulkReminders}
          >
            Send All Reminders
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6" gutterBottom>
                Total Overdue Amount
              </Typography>
              <Typography variant="h4" color="error.main">
                {formatCurrency(totalOverdueAmount)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {overdueInvoices.length} invoices overdue
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Overdue</MenuItem>
                  <MenuItem value="late">Late Status</MenuItem>
                  <MenuItem value="outstanding">Outstanding Past Due</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {overdueInvoices.length === 0 ? (
        <Alert severity="success">
          {filterStatus === "all"
            ? "Great! No overdue invoices at the moment."
            : `Great! No ${
                filterStatus === INVOICE_STATUS_OPTIONS.LATE
                  ? "late"
                  : "overdue"
              } invoices at the moment.`}
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Overdue Invoice Details
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Days Overdue</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overdueInvoices.map((invoice) => {
                    const daysOverdue = calculateDaysOverdue(invoice.dueDate);
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {invoice.invoiceNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {invoice.clientName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {invoice.clientEmail}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(invoice.dueDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${daysOverdue} days`}
                            color={daysOverdue > 30 ? "error" : "warning"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(invoice.total)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            color={
                              invoice.status === "late" ? "error" : "warning"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`/invoices/${invoice.id}`)
                              }
                              color="primary"
                              title="View Invoice"
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`/invoices/${invoice.id}/edit`)
                              }
                              color="primary"
                              title="Edit Invoice"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleSendReminder(invoice)}
                              color="warning"
                              title="Send Reminder"
                            >
                              <Email />
                            </IconButton>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              sx={{ ml: 1 }}
                            >
                              Mark Paid
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Send Payment Reminder
          {selectedInvoice && (
            <Typography variant="subtitle2" color="text.secondary">
              Invoice {selectedInvoice.invoiceNumber} -{" "}
              {selectedInvoice.clientName}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="To"
            value={emailData.to}
            onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Subject"
            value={emailData.subject}
            onChange={(e) =>
              setEmailData({ ...emailData, subject: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={8}
            value={emailData.message}
            onChange={(e) =>
              setEmailData({ ...emailData, message: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSendEmail} variant="contained" color="warning">
            Send Reminder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OverdueInvoices;
