import "./styles.css";
import { Routes, Route } from "react-router";
import { Container } from "@mui/material";
import CreateInvoice from "./pages/CreateInvoice";
import Dashboard from "./pages/Dashboard";
import EditInvoice from "./pages/EditInvoice";
import ViewInvoice from "./pages/ViewInvoice";
import OverdueInvoices from "./pages/OverdueInvoices";
import { Provider } from "react-redux";
import { store } from "./store/store";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Provider store={store}>
      <Container maxWidth="xl" sx={{ py: 4, height: "100vh" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoices/new" element={<CreateInvoice />} />
          <Route path="/invoices/:id/edit" element={<EditInvoice />} />
          <Route path="/invoices/:id" element={<ViewInvoice />} />
          <Route path="/invoices/overdue" element={<OverdueInvoices />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </Provider>
  );
}

export default App;
