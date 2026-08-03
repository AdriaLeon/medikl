import { Router } from "express";
import { db } from "../db";

const router = Router();

// GET /patients
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM patients");
        res.json(rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /patients/:id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows]: any = await db.query("SELECT * FROM patients WHERE id = ?", [id]);    

        if (rows.length === 0) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        res.json(rows[0]);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /patients
router.post("/", async (req, res) => {
    try {
        const { name, age } = req.body;

        if (age <= 14) {
            res.status(400).json({ error: "Age must be greater than 14" });
            return;
        }

        const [result]: any = await db.execute(
            "INSERT INTO patients (name, age) VALUES (?, ?)",
            [name, age]
        );

        res.status(201).json({
            message: "Patient created",
            id: result.insertId
        });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /patients (Delete all patients)
router.delete("/", async (req, res) => {
    try {
        await db.execute("DELETE FROM patients");
        res.json({ message: "All patients and associated visits deleted successfully" });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /patients/:id (Delete a specific patient)
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result]: any = await db.execute(
            "DELETE FROM patients WHERE id = ?",
            [id]
        );

        // Check if any row was actually deleted
        if (result.affectedRows === 0) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        res.json({ message: `Patient #${id} and associated visits deleted successfully` });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /patients/:id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch patient
        const [patientRows]: any = await db.query(
            "SELECT * FROM patients WHERE id = ?", 
            [id]
        );    

        if (patientRows.length === 0) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        // Fetch all visits for this patient
        const [visitRows]: any = await db.query(
            "SELECT id, speciality, description, visit_date, completed FROM visits WHERE patient_id = ?",
            [id]
        );

        // Combine results
        const patient = {
            ...patientRows[0],
            visits: visitRows
        };

        res.json(patient);

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router; // Export it so we can use it in app.ts