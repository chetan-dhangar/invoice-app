import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import { Add, Delete, ArrowBack } from "@mui/icons-material";
import { useInvoiceStore } from "../hooks/useInvoiceStore";
import {
  INVOICE_STATUS_OPTIONS,
  LINE_ITEM_OPTIONS,
  LINE_ITEM_TYPES,
} from "../utils/constant";

function CreateInvoice() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { createInvoice, invoices } = useInvoiceStore();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      dueDate: "",
      notes: "",
      paymentInstructions: "",
      lineItems: [
        { type: LINE_ITEM_TYPES.HOURS, description: "", quantity: 1, rate: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const watchedLineItems = watch("lineItems");

  const calculateTotal = () => {
    return watchedLineItems.reduce((total, item) => {
      const quantity = Number.parseFloat(item.quantity) || 0;
      const rate = Number.parseFloat(item.rate) || 0;
      return total + quantity * rate;
    }, 0);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const invoiceData = {
        ...data,
        id: `${invoices?.length + 1}`,
        invoiceNumber: `INV-${invoices?.length + 1}`,
        total: calculateTotal(),
        status: INVOICE_STATUS_OPTIONS.DRAFT,
        createdAt: new Date().toISOString(),
      };

      createInvoice(invoiceData, data.lineItems);
      navigate("/");
    } catch (error) {
      setSubmitError("Failed to create invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLineItem = () => {
    append({
      type: LINE_ITEM_TYPES.HOURS,
      description: "",
      quantity: 1,
      rate: 0,
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/")} color="primary">
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Create New Invoice
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Typography variant="h6" gutterBottom>
            Client Information
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client Name"
                {...register("clientName", {
                  required: "Client name is required",
                })}
                error={!!errors.clientName}
                helperText={errors.clientName?.message}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client Email"
                type="email"
                {...register("clientEmail", {
                  required: "Client email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                error={!!errors.clientEmail}
                helperText={errors.clientEmail?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Address"
                multiline
                rows={3}
                {...register("clientAddress", {
                  required: "Client address is required",
                })}
                error={!!errors.clientAddress}
                helperText={errors.clientAddress?.message}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom>
            Invoice Details
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...register("dueDate", { required: "Due date is required" })}
                error={!!errors.dueDate}
                helperText={errors.dueDate?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                {...register("notes")}
                placeholder="Additional notes or terms..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Instructions"
                multiline
                rows={2}
                {...register("paymentInstructions")}
                placeholder="How should the client pay? Include bank details, payment methods, etc."
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom>
            Line Items
          </Typography>
          {fields.map((field, index) => {
            return (
              <Paper key={field.id} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      select
                      label="Type"
                      {...register(`lineItems.${index}.type`)}
                      defaultValue={field.type || LINE_ITEM_TYPES.HOURS}
                    >
                      {LINE_ITEM_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Description"
                      {...register(`lineItems.${index}.description`, {
                        required: "Description is required",
                      })}
                      error={!!errors.lineItems?.[index]?.description}
                      helperText={
                        errors.lineItems?.[index]?.description?.message
                      }
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      {...register(`lineItems.${index}.quantity`, {
                        required: "Quantity is required",
                        min: { value: 0, message: "Quantity must be positive" },
                      })}
                      error={!!errors.lineItems?.[index]?.quantity}
                      helperText={errors.lineItems?.[index]?.quantity?.message}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      fullWidth
                      label="Rate"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      {...register(`lineItems.${index}.rate`, {
                        required: "Rate is required",
                        min: { value: 0, message: "Rate must be positive" },
                      })}
                      error={!!errors.lineItems?.[index]?.rate}
                      helperText={errors.lineItems?.[index]?.rate?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton
                      color="error"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}

          <Button
            startIcon={<Add />}
            onClick={addLineItem}
            variant="outlined"
            sx={{ mb: 3 }}
          >
            Add Line Item
          </Button>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <Typography variant="h5">
              Total: ${calculateTotal().toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Invoice"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default CreateInvoice;
