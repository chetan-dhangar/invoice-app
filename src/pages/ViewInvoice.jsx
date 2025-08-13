import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  IconButton,
} from "@mui/material";
import {
  Edit,
  Delete,
  Email,
  Print,
  Close,
  ArrowBack,
} from "@mui/icons-material";
import { useInvoiceStore } from "../hooks/useInvoiceStore";
import { useDispatch } from "react-redux";
import { deleteInvoice, updateInvoiceStatus } from "../store/invoiceSlice";
import {
  formatCurrency,
  formatDate,
  getInvoiceStatusColor,
} from "../utils/invoiceUtils";

function ViewInvoice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { invoices } = useInvoiceStore();
  const dispatch = useDispatch();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: "",
  });
  const [newStatus, setNewStatus] = useState("");

  const invoice = invoices.find((inv) => inv.id === id);

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "outstanding", label: "Outstanding" },
    { value: "paid", label: "Paid" },
    { value: "late", label: "Late" },
  ];

  if (!invoice) {
    return (
      <Box>
        <Alert severity="error">Invoice not found</Alert>
        <Button onClick={() => navigate("/")} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      dispatch(deleteInvoice({ id: invoice.id }));
      navigate("/");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailOpen = () => {
    setEmailData({
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.invoiceNumber}`,
      message: `Dear ${invoice.clientName},

Please find attached your invoice ${invoice.invoiceNumber} for ${formatCurrency(
        invoice.total
      )}.

Due Date: ${formatDate(invoice.dueDate)}

${invoice.paymentInstructions || ""}

Thank you for your business!

Best regards,
Your Company`,
    });
    setEmailDialogOpen(true);
  };

  const handleEmailSend = () => {
    alert("Email sent successfully!");
    setEmailDialogOpen(false);
    setEmailData({ to: "", subject: "", message: "" });
  };

  const handleStatusChange = () => {
    dispatch(
      updateInvoiceStatus({
        id,
        status: newStatus ? newStatus : invoice.status,
      })
    );
    setStatusDialogOpen(false);
    setNewStatus("");
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
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/")} color="primary">
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Invoice {invoice.invoiceNumber}
          </Typography>
        </Box>

        <Chip
          label={invoice.status}
          color={getInvoiceStatusColor(invoice.status)}
          onClick={() => setStatusDialogOpen(true)}
        />
      </Box>

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Button
          startIcon={<Edit />}
          onClick={() => navigate(`/invoices/${id}/edit`)}
        >
          Edit
        </Button>
        <Button startIcon={<Email />} onClick={handleEmailOpen}>
          Email
        </Button>
        <Button startIcon={<Print />} onClick={handlePrint}>
          Print
        </Button>
        <Button startIcon={<Delete />} color="error" onClick={handleDelete}>
          Delete
        </Button>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Bill To:
            </Typography>
            <Typography variant="body1" gutterBottom>
              {invoice.clientName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {invoice.clientEmail}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: "pre-line" }}
            >
              {invoice.clientAddress}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h6" gutterBottom>
                Invoice Details
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Invoice #:</strong> {invoice.invoiceNumber}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Created:</strong> {formatDate(invoice.createdAt)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          Line Items
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Rate</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.lineItems?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Chip label={item.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.rate)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.quantity * item.rate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Typography variant="h4">
            Total: {formatCurrency(invoice.total)}
          </Typography>
        </Box>

        {(invoice.notes || invoice.paymentInstructions) && (
          <>
            <Divider sx={{ my: 3 }} />
            {invoice.notes && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {invoice.notes}
                </Typography>
              </Box>
            )}
            {invoice.paymentInstructions && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Payment Instructions
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {invoice.paymentInstructions}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Paper>

      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Send Invoice via Email
            <IconButton onClick={() => setEmailDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="To"
              value={emailData.to}
              onChange={(e) =>
                setEmailData({ ...emailData, to: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Subject"
              value={emailData.subject}
              onChange={(e) =>
                setEmailData({ ...emailData, subject: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Message"
              value={emailData.message}
              onChange={(e) =>
                setEmailData({ ...emailData, message: e.target.value })
              }
              multiline
              rows={8}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEmailSend} variant="contained">
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
      >
        <DialogTitle>Change Invoice Status</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Status"
            value={newStatus ? newStatus : invoice.status}
            onChange={(e) => setNewStatus(e.target.value)}
            sx={{ mt: 2 }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusChange} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ViewInvoice;
