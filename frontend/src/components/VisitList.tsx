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

type SortField = "date" | "name" | "id";
type SortOrder = "asc" | "desc";

export const VisitList: React.FC<VisitListProps> = ({
  doctorId,
  initialVisits,
}) => {
  const [visits, setVisits] = useState<AssignedVisit[]>(initialVisits || []);
  const [loading, setLoading] = useState<boolean>(!initialVisits && !!doctorId);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField>("date");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);

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
          const params = new URLSearchParams({ sortBy, order });

          // Dynamic URL using doctorId parameter with sort params
          const res = await fetch(`/api/users/${doctorId}/visits?${params.toString()}`, {
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
  }, [doctorId, initialVisits, sortBy, order]);

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

  // Defensive client-side sort for initialVisits-only path (currently dead code, but safe)
  const sortedVisits = doctorId
    ? visits
    : [...visits].sort((a, b) => {
        let cmp = 0;
        if (sortBy === "date") cmp = new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime();
        else if (sortBy === "name") cmp = (a.patient_name || "").localeCompare(b.patient_name || "");
        else cmp = a.id - b.id;
        return order === "asc" ? cmp : -cmp;
      });

  // Filter to hide completed visits if checkbox is checked
  const displayedVisits = hideCompleted
    ? sortedVisits.filter((v) => !v.completed)
    : sortedVisits;

  if (loading) return <p>Loading assigned visits...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          Sort by:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortField)}>
            <option value="date">Date</option>
            <option value="name">Patient Name</option>
            <option value="id">ID</option>
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          Order:
          <select value={order} onChange={(e) => setOrder(e.target.value as SortOrder)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
          />
          Hide completed visits
        </label>
      </div>

      {displayedVisits.length === 0 ? (
        <p>No visits found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {displayedVisits.map((visit) => (
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
      )}
    </div>
  );
};