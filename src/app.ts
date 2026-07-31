import express from "express";
import patientsRouter from "./routes/patients";

const app = express();

app.use(express.json());

app.use("/patients", patientsRouter);

export default app;