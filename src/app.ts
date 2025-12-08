import express from "express";
import cors from "cors";
import helmet from "helmet";
import { formsRouter } from "./routes/forms";

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "10mb" }));

app.use("/forms", formsRouter);

app.get("/health", (_, res) => res.json({ status: "ok" }));
