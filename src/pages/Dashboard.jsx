import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Add,
  Receipt,
  Warning,
  AttachMoney,
  Visibility,
  Edit,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useInvoiceStore } from "../hooks/useInvoiceStore";
import {
  formatCurrency,
  formatDate,
  getInvoiceStatusColor,
  isInvoiceLate,
} from "../utils/invoiceUtils";
import { INVOICE_STATUS_OPTIONS } from "../utils/constant";

function Dashboard() {
  const navigate = useNavigate();
  const { invoices } = useInvoiceStore();

  const totalOutstanding = invoices
    .filter(
      (invoice) =>
        invoice.status === INVOICE_STATUS_OPTIONS.OUTSTANDING ||
        invoice.status === INVOICE_STATUS_OPTIONS.LATE
    )
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const lateInvoices = invoices.filter(
    (invoice) =>
      invoice.status === INVOICE_STATUS_OPTIONS.LATE ||
      (invoice.status === INVOICE_STATUS_OPTIONS.OUTSTANDING &&
        isInvoiceLate(invoice.dueDate))
  );

  const paidThisMonth = invoices
    .filter((invoice) => invoice.status === INVOICE_STATUS_OPTIONS.PAID)
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const recentInvoices =
    invoices?.length &&
    [...invoices]
      ?.sort(
        (a, b) =>
          new Date(b?.createdAt)?.getTime() - new Date(a?.createdAt)?.getTime()
      )
      ?.slice(0, 5);

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Invoice Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your invoices and track payments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/invoices/new")}
          size="large"
        >
          New Invoice
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AttachMoney color="warning" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Outstanding Amount
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {formatCurrency(totalOutstanding)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {
                  invoices.filter(
                    (i) =>
                      i.status === INVOICE_STATUS_OPTIONS.OUTSTANDING ||
                      i.status === INVOICE_STATUS_OPTIONS.LATE
                  ).length
                }{" "}
                invoices pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Warning color="error" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Late Invoices
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main" gutterBottom>
                {lateInvoices.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(
                  lateInvoices.reduce((sum, inv) => sum + inv.total, 0)
                )}{" "}
                overdue
              </Typography>
              {lateInvoices.length > 0 && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate("/invoices/overdue")}
                  sx={{ mt: 1, p: 0 }}
                >
                  View All
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Receipt color="success" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Paid This Month
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main" gutterBottom>
                {formatCurrency(paidThisMonth)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {
                  invoices.filter(
                    (i) => i.status === INVOICE_STATUS_OPTIONS.PAID
                  ).length
                }{" "}
                invoices paid
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Recent Invoices
          </Typography>
          {recentInvoices.length === 0 ? (
            <Typography color="text.secondary">
              No invoices yet. Create your first invoice!
            </Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {recentInvoices.map((invoice) => (
                <Card key={invoice.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 1,
                          }}
                        >
                          <Typography variant="h6">
                            {invoice.invoiceNumber}
                          </Typography>
                          <Chip
                            label={invoice.status}
                            color={getInvoiceStatusColor(invoice.status)}
                            size="small"
                          />
                        </Box>
                        <Typography color="text.secondary" gutterBottom>
                          {invoice.clientName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Due: {formatDate(invoice.dueDate)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="h6" gutterBottom>
                          {formatCurrency(invoice.total)}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/invoices/${invoice.id}`)}
                            color="primary"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/invoices/${invoice.id}/edit`)
                            }
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Dashboard;
