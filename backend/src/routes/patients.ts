import { Router } from "express";
import { db } from "../db";
import { authenticate, authorize } from "../middleware/auth";

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

        // Get patient
        const [patientRows]: any = await db.query(
            "SELECT * FROM patients WHERE id = ?",
            [id]
        );

        if (patientRows.length === 0) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        // Get visits with doctor names
        const [visitRows]: any = await db.query(
            `SELECT v.id, v.speciality, v.description, v.doctor_id, v.visit_date, v.completed, u.username AS doctor_name
             FROM visits v
             LEFT JOIN users u ON v.doctor_id = u.id
             WHERE v.patient_id = ?
             ORDER BY v.visit_date DESC`,
            [id]
        );

        res.json({
            ...patientRows[0],
            visits: visitRows,
        });

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

// POST /patients/:id/visits (Add a new visit to a specific patient)
router.post("/:id/visits", authenticate, authorize("admin", "doctor"), async (req, res) => {
    try {
        const { id } = req.params;
        const { speciality, description, visitDate, doctorId } = req.body;

        if (!speciality || !visitDate || !doctorId) {
            return res.status(400).json({ error: "Speciality, visit date, and doctor are required" });
            }

        // Verify patient exists
        const [patient]: any = await db.query("SELECT id FROM patients WHERE id = ?", [id]);
        if (patient.length === 0) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        // Verify selected doctor exists and is actually a doctor
        const [doctorRows]: any = await db.query(
        "SELECT id FROM users WHERE id = ? AND role = 'doctor'",
        [doctorId]
        );

        if (doctorRows.length === 0) {
        return res.status(400).json({ error: "Selected user is not a valid doctor" });
        }

        const [result]: any = await db.execute(
            `INSERT INTO visits (patient_id, doctor_id, speciality, description, visit_date, completed) 
             VALUES (?, ?, ?, ?, ?, FALSE)`,
            [id, doctorId, speciality, description || "", visitDate]
        );

        res.status(201).json({
            message: "Visit created successfully",
            visitId: result.insertId
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

// PATCH /patients/:id/visits/:visitId
router.patch("/:id/visits/:visitId", async (req, res) => {
    try {
        const { visitId } = req.params;
        const { completed } = req.body;

        const [result]: any = await db.execute(
            "UPDATE visits SET completed = ? WHERE id = ?",
            [completed, visitId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Visit not found" });
        }

        res.json({ message: "Visit updated successfully" });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /patients/:id/visits/:visitId
router.delete("/:id/visits/:visitId", async (req, res) => {
    try {
        const { id, visitId } = req.params;

        const [result]: any = await db.execute(
            "DELETE FROM visits WHERE id = ? AND patient_id = ?",
            [visitId, id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: "Visit not found" });
            return;
        }

        res.json({ message: "Visit deleted successfully" });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router; // Export it so we can use it in app.ts