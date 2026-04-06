import "dotenv/config";
import express from "express";
import cors from "cors";
import analyzeRoute from "./routes/analyze.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/analyze", analyzeRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${3001}`);
});
