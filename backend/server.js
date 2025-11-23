import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import routes from "./routes/index.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);
app.get("/", (req, res) => {
  res.send("saree4ever backend running");
});

// Start server
app.listen(config.port, () => {
  console.log(`API running on port ${config.port}`);
});
