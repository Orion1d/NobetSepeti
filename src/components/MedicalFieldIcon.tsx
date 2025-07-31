import React from "react";

const fieldIconMap: Record<string, { icon: string; color: string }> = {
  acil1:        { icon: "emergency", color: "#e53935" },
  acil2:        { icon: "emergency_share", color: "#d32f2f" },
  acil3:        { icon: "child_care", color: "#ff7043" },
  kardiyoloji:  { icon: "favorite", color: "#c2185b" },
  psikyatri:    { icon: "psychology", color: "#8e24aa" },
  gogus:        { icon: "pulmonology", color: "#1976d2" },
  kadin:        { icon: "pregnant_woman", color: "#f06292" },
  ortodonti:    { icon: "orthopedics", color: "#00897b" },
  dahiliye:     { icon: "stethoscope", color: "#43a047" },
  pediatri:     { icon: "child_friendly", color: "#fbc02d" },
  genel:        { icon: "surgical", color: "#ffa000" },
};

export function MedicalFieldIcon({ field }: { field: string }) {
  const info = fieldIconMap[field];
  if (!info) return null;
  return (
    <span
      className="material-symbols-rounded"
      style={{
        color: "#ffffff", // Sabit beyaz renk
        fontSize: 18,
        verticalAlign: "middle",
        marginRight: 4,
      }}
    >
      {info.icon}
    </span>
  );
}

export { fieldIconMap }; 