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

export default router; // Export it so we can use it in app.ts