import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { swaggerDocs } from "./middlewares/swaggerDocs.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = "public/images";

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/api-docs", ...swaggerDocs);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
