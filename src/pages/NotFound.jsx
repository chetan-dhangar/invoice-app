import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router";

function NotFound() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <Typography variant="h2" color="error" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Button onClick={() => navigate("/")}>Back to Dashboar</Button>
    </Box>
  );
}

export default NotFound;
