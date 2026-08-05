import React, { useEffect, useState } from "react";

export interface AssignedVisit {
  id: number;
  speciality: string;
  description: string;
  visit_date: string;
  completed: boolean;
  doctor_id: number;
  doctor_name?: string;
  patient_id?: number;
  patient_name?: string;
}

interface VisitListProps {
  doctorId?: number;
  initialVisits?: AssignedVisit[];
}

export const VisitList: React.FC<VisitListProps> = ({
  doctorId,
  initialVisits,
}) => {
  const [visits, setVisits] = useState<AssignedVisit[]>(initialVisits || []);
  const [loading, setLoading] = useState<boolean>(!initialVisits && !!doctorId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialVisits && !doctorId) {
      setVisits(initialVisits);
      return;
    }

    if (doctorId) {
      const fetchDoctorVisits = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          
          // Dynamic URL using doctorId parameter
          const res = await fetch(`/api/users/${doctorId}/visits`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Failed to load visits");
          }

          const data = await res.json();
          setVisits(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchDoctorVisits();
    }
  }, [doctorId, initialVisits]);

  // Toggle handler using your existing /patients/:id/visits/:visitId endpoint
    const handleToggleCompleted = async (visit: AssignedVisit) => {
    const nextCompleted = !visit.completed;

    // Optimistic UI update
    setVisits((prevVisits) =>
        prevVisits.map((v) => (v.id === visit.id ? { ...v, completed: nextCompleted } : v))
    );

    try {
        const token = localStorage.getItem("token");
        
        // Uses patient_id from the visit object
        const res = await fetch(`/api/patients/${visit.patient_id}/visits/${visit.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: nextCompleted }),
        });

        if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update status");
        }
    } catch (err: any) {
        // Revert state on failure
        setVisits((prevVisits) =>
        prevVisits.map((v) => (v.id === visit.id ? { ...v, completed: visit.completed } : v))
        );
        alert("Could not update visit status: " + err.message);
    }
    };

  if (loading) return <p>Loading assigned visits...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (visits.length === 0) return <p>No visits found.</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {visits.map((visit) => (
        <li
          key={visit.id}
          style={{
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            marginBottom: "10px",
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontWeight: "bold" }}>{visit.speciality}</span>

            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            <input
                type="checkbox"
                checked={visit.completed}
                onChange={() => handleToggleCompleted(visit)}
            />
            <span style={{ color: visit.completed ? "green" : "orange", fontWeight: "600" }}>
                {visit.completed ? "Completed" : "Pending"}
            </span>
            </label>
          </div>

          {visit.patient_name && (
            <p style={{ margin: "4px 0", fontSize: "0.9em", color: "#2563eb" }}>
              <strong>Patient:</strong> {visit.patient_name} (ID: #{visit.patient_id})
            </p>
          )}

          {visit.doctor_name && (
            <p style={{ margin: "4px 0", fontSize: "0.9em", color: "#0284c7" }}>
              <strong>Doctor:</strong> Dr. {visit.doctor_name}
            </p>
          )}

          <p style={{ margin: "8px 0", color: "#444" }}>{visit.description}</p>
          <small style={{ color: "#888" }}>
            Date: {new Date(visit.visit_date).toLocaleString()}
          </small>
        </li>
      ))}
    </ul>
  );
};