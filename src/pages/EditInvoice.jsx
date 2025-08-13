import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
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
import { LINE_ITEM_OPTIONS, LINE_ITEM_TYPES } from "../utils/constant";

function EditInvoice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { invoices, updateInvoice } = useInvoiceStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const invoice = invoices.find((inv) => inv.id === id);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
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

  useEffect(() => {
    if (invoice) {
      const updatedLineItems = invoice.lineItems?.length
        ? invoice.lineItems.map((item) => ({
            type: LINE_ITEM_OPTIONS.some((option) => option.value === item.type)
              ? item.type
              : LINE_ITEM_TYPES.HOURS,
            description: item.description || "",
            quantity: item.quantity || 1,
            rate: item.rate || 0,
          }))
        : [
            {
              type: LINE_ITEM_TYPES.HOURS,
              description: "",
              quantity: 1,
              rate: 0,
            },
          ];
      reset({
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientAddress: invoice.clientAddress,
        dueDate: invoice.dueDate,
        notes: invoice.notes || "",
        paymentInstructions: invoice.paymentInstructions || "",
        lineItems: updatedLineItems,
      });
    }
  }, [invoice, reset]);

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
      updateInvoice(id, data, data.lineItems);
      navigate(`/invoices/${id}`);
    } catch (error) {
      setSubmitError("Failed to update invoice. Please try again.");
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
        <IconButton onClick={() => navigate(`/invoices/${id}`)} color="primary">
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Edit Invoice {invoice.invoiceNumber}
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
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Invoice"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default EditInvoice;
