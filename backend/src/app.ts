import express from "express";
import patientsRouter from "./routes/patients";
import usersRouter from "./routes/users";

const app = express();

app.use(express.json());

app.use("/patients", patientsRouter);
app.use("/users", usersRouter);

export default app;