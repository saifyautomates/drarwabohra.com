"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Booking, PatientRecord, ProductSale, Settings } from "@/lib/data";
import { formatDateLabel, formatINR, formatTime12, waLink } from "@/lib/data-client";
import { StatusBadge } from "@/components/admin/ui";

interface PatientsClientProps {
  initialPatients: PatientRecord[];
  bookings: Booking[];
  sales: ProductSale[];
  settings: Settings;
}

export interface UnifiedPatient {
  key: string;
  recordId?: string;
  name: string;
  mobile: string;
  email?: string;
  age?: number;
  gender?: string;
  city?: string;
  chiefComplaint?: string;
  medicalHistory?: string;
  currentRemedies?: string;
  notes?: string;
  tags: string[];
  appointments: Booking[];
  orders: ProductSale[];
  totalSpent: number;
  lastDate: string;
}

export default function PatientsClient({
  initialPatients,
  bookings,
  sales,
  settings,
}: PatientsClientProps) {
  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<UnifiedPatient | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [deletedKeys, setDeletedKeys] = useState<Set<string>>(new Set());
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const handleDeletePatient = async (p: UnifiedPatient) => {
    if (!confirm(`Are you sure you want to permanently delete patient "${p.name}" and all associated medical records?`)) {
      return;
    }

    setDeletingKey(p.key);
    try {
      const targetId = p.recordId || "direct";
      const res = await fetch(`/api/admin/patients/${targetId}?mobile=${encodeURIComponent(p.mobile)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeletedKeys((prev) => new Set(prev).add(p.key));
        setPatients((prev) => prev.filter((pr) => pr.id !== p.recordId && normPhone(pr.mobile) !== normPhone(p.mobile)));
        if (selectedPatient?.key === p.key) {
          setSelectedPatient(null);
        }
      } else {
        alert("Failed to delete patient. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting patient.");
    } finally {
      setDeletingKey(null);
    }
  };

  // Edit Note in Medical Profile
  const [editingNotes, setEditingNotes] = useState("");
  const [editingRemedies, setEditingRemedies] = useState("");

  // Add Patient Form State
  const [newName, setNewName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newGender, setNewGender] = useState("Female");
  const [newCity, setNewCity] = useState("");
  const [newComplaint, setNewComplaint] = useState("");
  const [newHistory, setNewHistory] = useState("");
  const [newRemedies, setNewRemedies] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newTagInput, setNewTagInput] = useState("Hair Care");
  const [addingPatient, setAddingPatient] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Estimate booking fee
  const getBookingFee = (b: Booking) => {
    const text = `${b.complaint ?? ""} ${(b.reasons || []).join(" ")}`.toLowerCase();
    if (text.includes("plan b") || text.includes("4999") || text.includes("3 month")) {
      return settings.planBFee ?? 4999;
    }
    return settings.planAFee ?? 2000;
  };

  // Helper to normalize phone numbers (e.g. "917014098198" -> "7014098198")
  const normPhone = (p: string) => {
    const digits = (p || "").replace(/\D/g, "");
    if (digits.length > 10 && digits.startsWith("91")) {
      return digits.slice(2);
    }
    return digits;
  };

  // Build unified patient list by merging Patients + Bookings + Sales
  const unifiedPatients = useMemo(() => {
    const map = new Map<string, UnifiedPatient>();

    // 1. Add Registered Patients
    patients.forEach((pr) => {
      const phoneKey = normPhone(pr.mobile) || pr.name.toLowerCase().trim();
      map.set(phoneKey, {
        key: phoneKey,
        recordId: pr.id,
        name: pr.name,
        mobile: pr.mobile,
        email: pr.email,
        age: pr.age,
        gender: pr.gender,
        city: pr.city,
        chiefComplaint: pr.chiefComplaint,
        medicalHistory: pr.medicalHistory,
        currentRemedies: pr.currentRemedies,
        notes: pr.notes,
        tags: pr.tags || [],
        appointments: [],
        orders: [],
        totalSpent: 0,
        lastDate: pr.createdAt.slice(0, 10),
      });
    });

    // 2. Merge Bookings
    bookings.forEach((b) => {
      const phoneKey = normPhone(b.mobile) || b.name.toLowerCase().trim();
      let patient = map.get(phoneKey);
      if (!patient) {
        patient = {
          key: phoneKey,
          name: b.name,
          mobile: b.mobile,
          age: b.age,
          gender: b.gender,
          chiefComplaint: b.complaint || (b.reasons || []).join(", "),
          tags: ["Consultation"],
          appointments: [],
          orders: [],
          totalSpent: 0,
          lastDate: b.date || b.createdAt.slice(0, 10),
        };
        map.set(phoneKey, patient);
      }

      // Add appointment
      patient.appointments.push(b);
      if (b.status === "confirmed" || b.status === "visited") {
        patient.totalSpent += getBookingFee(b);
      }
      if (!patient.age && b.age) patient.age = b.age;
      if (!patient.gender && b.gender) patient.gender = b.gender;
      if (!patient.chiefComplaint && (b.complaint || (b.reasons || []).length > 0)) {
        patient.chiefComplaint = b.complaint || (b.reasons || []).join(", ");
      }
      const bDate = b.date || b.createdAt.slice(0, 10);
      if (bDate > patient.lastDate) {
        patient.lastDate = bDate;
      }
    });

    // 3. Merge Product Sales
    sales.forEach((s) => {
      const phoneKey = normPhone(s.customerPhone) || s.customerName.toLowerCase().trim();
      let patient = map.get(phoneKey);
      if (!patient) {
        patient = {
          key: phoneKey,
          name: s.customerName,
          mobile: s.customerPhone,
          city: s.customerCity,
          tags: ["Dispensary Buyer"],
          appointments: [],
          orders: [],
          totalSpent: 0,
          lastDate: s.date || s.createdAt.slice(0, 10),
        };
        map.set(phoneKey, patient);
      }

      patient.orders.push(s);
      if (s.paymentStatus === "paid") {
        patient.totalSpent += s.totalAmount;
      }
      if (!patient.city && s.customerCity) patient.city = s.customerCity;
      if (!patient.tags.includes("Dispensary Buyer")) {
        patient.tags.push("Dispensary Buyer");
      }
      const sDate = s.date || s.createdAt.slice(0, 10);
      if (sDate > patient.lastDate) {
        patient.lastDate = sDate;
      }
    });

    // Sort by most recent interaction
    return Array.from(map.values())
      .filter((p) => !deletedKeys.has(p.key))
      .sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  }, [patients, bookings, sales, deletedKeys]);

  // Filtered patients based on search and tags
  const filteredPatients = useMemo(() => {
    return unifiedPatients.filter((p) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.mobile.includes(q) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.chiefComplaint && p.chiefComplaint.toLowerCase().includes(q)) ||
        (p.currentRemedies && p.currentRemedies.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (activeTag === "all") return true;
      if (activeTag === "hair") {
        const text = `${p.chiefComplaint || ""} ${p.tags.join(" ")}`.toLowerCase();
        return text.includes("hair") || text.includes("scalp") || text.includes("dandruff");
      }
      if (activeTag === "skin") {
        const text = `${p.chiefComplaint || ""} ${p.tags.join(" ")}`.toLowerCase();
        return text.includes("skin") || text.includes("acne") || text.includes("melasma") || text.includes("glow");
      }
      if (activeTag === "orders") {
        return p.orders.length > 0;
      }
      if (activeTag === "repeat") {
        return (p.appointments.length + p.orders.length) > 1;
      }

      return true;
    });
  }, [unifiedPatients, search, activeTag]);

  // Open full medical profile
  const handleOpenPatient = (p: UnifiedPatient) => {
    setSelectedPatient(p);
    setEditingNotes(p.notes || "");
    setEditingRemedies(p.currentRemedies || "");
    setNoteSuccess(false);
  };

  // Save clinical notes in profile
  const handleSaveNotes = async () => {
    if (!selectedPatient) return;
    setSavingNote(true);
    setNoteSuccess(false);

    try {
      if (selectedPatient.recordId) {
        // Update existing patient record
        const res = await fetch(`/api/admin/patients/${selectedPatient.recordId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notes: editingNotes,
            currentRemedies: editingRemedies,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setPatients((prev) =>
            prev.map((pr) => (pr.id === selectedPatient.recordId ? data.patient : pr))
          );
          setNoteSuccess(true);
        }
      } else {
        // Create new patient record
        const res = await fetch("/api/admin/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: selectedPatient.name,
            mobile: selectedPatient.mobile,
            age: selectedPatient.age,
            gender: selectedPatient.gender,
            city: selectedPatient.city,
            chiefComplaint: selectedPatient.chiefComplaint,
            notes: editingNotes,
            currentRemedies: editingRemedies,
            tags: selectedPatient.tags,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setPatients((prev) => [data.patient, ...prev]);
          setSelectedPatient((prev) => (prev ? { ...prev, recordId: data.patient.id } : null));
          setNoteSuccess(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  // Add new patient form submit
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddingPatient(true);

    try {
      const res = await fetch("/api/admin/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          mobile: newMobile.trim(),
          email: newEmail.trim() || undefined,
          age: newAge ? Number(newAge) : undefined,
          gender: newGender,
          city: newCity.trim() || undefined,
          chiefComplaint: newComplaint.trim() || undefined,
          medicalHistory: newHistory.trim() || undefined,
          currentRemedies: newRemedies.trim() || undefined,
          notes: newNotes.trim() || undefined,
          tags: newTagInput ? [newTagInput] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAddError(data.error || "Failed to create patient record.");
      } else {
        setPatients((prev) => [data.patient, ...prev]);
        setShowAddModal(false);
        // Reset
        setNewName("");
        setNewMobile("");
        setNewEmail("");
        setNewAge("");
        setNewCity("");
        setNewComplaint("");
        setNewHistory("");
        setNewRemedies("");
        setNewNotes("");
      }
    } catch (err) {
      setAddError("Network error while adding patient.");
    } finally {
      setAddingPatient(false);
    }
  };

  // Total calculations
  const totalPatientsCount = unifiedPatients.length;
  const totalHairPatients = unifiedPatients.filter((p) => {
    const t = `${p.chiefComplaint || ""} ${p.tags.join(" ")}`.toLowerCase();
    return t.includes("hair") || t.includes("scalp") || t.includes("dandruff");
  }).length;
  const totalSkinPatients = unifiedPatients.filter((p) => {
    const t = `${p.chiefComplaint || ""} ${p.tags.join(" ")}`.toLowerCase();
    return t.includes("skin") || t.includes("acne") || t.includes("melasma") || t.includes("glow");
  }).length;
  const totalRepeatPatients = unifiedPatients.filter(
    (p) => p.appointments.length + p.orders.length > 1
  ).length;

  return (
    <div className="space-y-7">
      {/* ----------------- Header & Stats ----------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-dark">
            Clinical Records &amp; Directory
          </span>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
            Patient Management &amp; Profiles
          </h1>
          <p className="mt-1 text-xs text-smoke">
            Complete database of patients, medical histories, prescribed remedies, and consult notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-1.5 !py-2.5 !px-4 text-xs font-bold"
          >
            <span>+ Add New Patient</span>
          </button>
        </div>
      </div>

      {/* ---------------- Metric Summary Cards ---------------- */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <div className="card p-4 sm:p-5 shadow-xs bg-paper border border-line">
          <span className="text-xs font-bold uppercase tracking-wider text-smoke">
            Total Patients
          </span>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
            {totalPatientsCount}
          </p>
          <span className="text-[11px] text-smoke">Registered &amp; Consulted</span>
        </div>

        <div className="card p-4 sm:p-5 shadow-xs bg-paper border border-emerald/30">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-dark">
            Hair Care Cases
          </span>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
            {totalHairPatients}
          </p>
          <span className="text-[11px] text-smoke">Hairfall &amp; Scalp</span>
        </div>

        <div className="card p-4 sm:p-5 shadow-xs bg-paper border border-gold/40">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Skin Care Cases
          </span>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
            {totalSkinPatients}
          </p>
          <span className="text-[11px] text-smoke">Acne, Pigmentation &amp; Glow</span>
        </div>

        <div className="card p-4 sm:p-5 shadow-xs bg-paper border border-line">
          <span className="text-xs font-bold uppercase tracking-wider text-smoke">
            Repeat Patients
          </span>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink">
            {totalRepeatPatients}
          </p>
          <span className="text-[11px] text-smoke">2+ Visits or Orders</span>
        </div>
      </div>

      {/* ---------------- Filter & Search Bar ---------------- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-smoke">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by name, phone, city, symptom (e.g. Acne, Hairfall)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !pl-10 text-xs sm:text-sm w-full"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke hover:text-ink text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: "all", label: "All Patients" },
            { key: "hair", label: "Hair Concerns" },
            { key: "skin", label: "Skin Concerns" },
            { key: "repeat", label: "Repeat Patients" },
            { key: "orders", label: "Dispensary Buyers" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTag(tab.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTag === tab.key
                  ? "bg-emerald text-white shadow-xs"
                  : "bg-cream text-smoke hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- Patients Table Directory ---------------- */}
      <div className="card shadow-sm border border-line bg-paper overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="py-14 text-center">
            <span className="text-3xl mb-2 block">👥</span>
            <p className="text-sm font-bold text-ink">No patients found</p>
            <p className="mt-1 text-xs text-smoke">
              Try adjusting your search query or filter tags.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-cream/30 text-smoke font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Patient Profile</th>
                  <th className="py-3 px-3">Contact &amp; Location</th>
                  <th className="py-3 px-3">Chief Complaint</th>
                  <th className="py-3 px-3">History &amp; Activity</th>
                  <th className="py-3 px-3 text-right">Lifetime Spent</th>
                  <th className="py-3 pr-4 text-right">Medical Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filteredPatients.map((p) => {
                  const initials = p.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const waCustomerMsg = encodeURIComponent(
                    `Hi ${p.name}, Dr. Arwa Bohra Clinic here regarding your homeopathic consultation & health routine. How are you feeling today?`
                  );
                  const waCustomerLink = `https://wa.me/91${p.mobile.replace(/\D/g, "")}?text=${waCustomerMsg}`;

                  return (
                    <tr
                      key={p.key}
                      onClick={() => handleOpenPatient(p)}
                      className="hover:bg-cream/40 transition-colors cursor-pointer"
                    >
                      {/* Patient Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald-dark font-bold text-sm border border-emerald/20">
                            {initials || "PT"}
                          </div>
                          <div>
                            <span className="font-bold text-ink text-sm block">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-smoke">
                              {p.age && <span>{p.age} yrs</span>}
                              {p.age && p.gender && <span>·</span>}
                              {p.gender && <span>{p.gender}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & City */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-ink font-semibold">{p.mobile}</span>
                          <a
                            href={waCustomerLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="rounded p-0.5 text-emerald-dark hover:bg-emerald-soft"
                            title="Chat on WhatsApp"
                          >
                            💬
                          </a>
                        </div>
                        <span className="block text-[11px] text-smoke mt-0.5">
                          {p.city || "Online Consultation"}
                        </span>
                      </td>

                      {/* Chief Complaint */}
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-ink block max-w-[220px] truncate">
                          {p.chiefComplaint || "General Lifestyle Consultation"}
                        </span>
                        {p.currentRemedies && (
                          <span className="text-[11px] text-emerald-dark font-medium max-w-[220px] truncate block mt-0.5">
                            Rx: {p.currentRemedies}
                          </span>
                        )}
                      </td>

                      {/* History & Activity */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-smoke font-medium">
                          <span>{p.appointments.length} Consult{p.appointments.length !== 1 ? "s" : ""}</span>
                          <span>·</span>
                          <span>{p.orders.length} Order{p.orders.length !== 1 ? "s" : ""}</span>
                        </div>
                        <span className="text-[10px] text-smoke/80 block mt-0.5">
                          Last: {formatDateLabel(p.lastDate)}
                        </span>
                      </td>

                      {/* Lifetime Spent */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-sm text-ink">
                        {p.totalSpent > 0 ? formatINR(p.totalSpent) : "—"}
                      </td>

                      {/* Medical Card & Delete Action */}
                      <td className="py-3.5 pr-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPatient(p);
                          }}
                          className="btn-outline !py-1.5 !px-3 text-xs font-semibold hover:border-emerald hover:text-emerald-dark"
                        >
                          View Card →
                        </button>
                        <button
                          type="button"
                          disabled={deletingKey === p.key}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePatient(p);
                          }}
                          className="rounded-lg p-1.5 text-smoke hover:bg-red-50 hover:text-red-600 transition-colors inline-flex items-center align-middle"
                          title="Delete patient and clinical records"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ----------------- Patient Medical Profile Modal ----------------- */}
      {selectedPatient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedPatient(null)}
        >
          <div
            className="card relative w-full max-w-2xl p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 bg-white max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPatient(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-smoke hover:bg-cream hover:text-ink transition-colors"
            >
              ✕
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald text-white text-xl font-bold shadow-md">
                  {selectedPatient.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-ink">
                    {selectedPatient.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-smoke">
                    <span className="font-mono font-bold text-emerald-dark">
                      {selectedPatient.mobile}
                    </span>
                    {selectedPatient.age && (
                      <span>· {selectedPatient.age} yrs</span>
                    )}
                    {selectedPatient.gender && (
                      <span>· {selectedPatient.gender}</span>
                    )}
                    {selectedPatient.city && (
                      <span>· {selectedPatient.city}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/91${selectedPatient.mobile.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary !py-2 !px-3.5 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>WhatsApp Patient</span>
                </a>
              </div>
            </div>

            {/* Clinical Overview Grid */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-line bg-cream/40 p-4">
                <span className="font-bold text-emerald-dark uppercase tracking-wider block mb-1">
                  Chief Health Complaint
                </span>
                <p className="text-sm font-semibold text-ink">
                  {selectedPatient.chiefComplaint || "Routine / Lifestyle Consultation"}
                </p>
                {selectedPatient.medicalHistory && (
                  <p className="mt-2 text-smoke leading-relaxed">
                    <strong>Medical History:</strong> {selectedPatient.medicalHistory}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-line bg-cream/40 p-4">
                <span className="font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Lifetime Value &amp; Summary
                </span>
                <p className="text-sm font-bold text-ink">
                  Total Spent: {formatINR(selectedPatient.totalSpent)}
                </p>
                <p className="mt-2 text-smoke">
                  <strong>{selectedPatient.appointments.length}</strong> Consultations recorded<br />
                  <strong>{selectedPatient.orders.length}</strong> Dispensary Product Orders
                </p>
              </div>
            </div>

            {/* Doctor Prescription & Clinical Notes */}
            <div className="mt-5 rounded-2xl border-2 border-emerald/30 bg-paper p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-dark flex items-center gap-1.5">
                  <span>📝</span>
                  <span>Doctor&apos;s Prescription &amp; Clinical Notes</span>
                </span>
                {noteSuccess && (
                  <span className="text-xs font-bold text-emerald-dark animate-in fade-in">
                    ✓ Saved successfully!
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-smoke uppercase tracking-wider mb-1">
                    Current Prescribed Remedies (Rx)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Thuja 200 once weekly + Hair Vitalizing Serum"
                    value={editingRemedies}
                    onChange={(e) => setEditingRemedies(e.target.value)}
                    className="input text-xs font-medium w-full"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-smoke uppercase tracking-wider mb-1">
                    Clinical Advice, Diet &amp; Follow-up Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter patient progress, diet instructions, next consultation plan..."
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    className="input text-xs leading-relaxed w-full"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={savingNote}
                    onClick={handleSaveNotes}
                    className="btn-primary !py-2 !px-4 text-xs font-bold disabled:opacity-50"
                  >
                    {savingNote ? "Saving Notes..." : "Save Medical Notes →"}
                  </button>
                </div>
              </div>
            </div>

            {/* Appointments Timeline */}
            <div className="mt-6">
              <h4 className="font-display text-sm font-bold text-ink mb-3 flex items-center gap-2">
                <span>🩺</span>
                <span>Consultation History ({selectedPatient.appointments.length})</span>
              </h4>

              {selectedPatient.appointments.length === 0 ? (
                <p className="text-xs text-smoke">No prior appointments recorded.</p>
              ) : (
                <div className="space-y-2">
                  {selectedPatient.appointments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-xl border border-line p-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-ink block">
                          {formatDateLabel(a.date)} · {formatTime12(a.time)}
                        </span>
                        <span className="text-[11px] text-smoke">
                          {a.id} · {a.mode === "audio" ? "1:1 Voice Call" : a.mode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-emerald-dark">
                          {formatINR(getBookingFee(a))}
                        </span>
                        <StatusBadge status={a.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Orders Timeline */}
            <div className="mt-6 border-t border-line/60 pt-4">
              <h4 className="font-display text-sm font-bold text-ink mb-3 flex items-center gap-2">
                <span>🧴</span>
                <span>Dispensary Product Orders ({selectedPatient.orders.length})</span>
              </h4>

              {selectedPatient.orders.length === 0 ? (
                <p className="text-xs text-smoke">No product dispensary purchases recorded.</p>
              ) : (
                <div className="space-y-2">
                  {selectedPatient.orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-xl border border-line p-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-ink block">{o.productTitle}</span>
                        <span className="text-[11px] text-smoke">
                          {o.id} · Qty: {o.quantity} · {formatDateLabel(o.date || o.createdAt.slice(0, 10))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-ink">
                          {formatINR(o.totalAmount)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            o.paymentStatus === "paid"
                              ? "bg-emerald-soft text-emerald-dark"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer with Delete Patient Button */}
            <div className="mt-7 pt-4 border-t border-line flex items-center justify-between">
              <button
                type="button"
                disabled={deletingKey === selectedPatient.key}
                onClick={() => handleDeletePatient(selectedPatient)}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl px-3 py-2 transition-colors flex items-center gap-1.5"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{deletingKey === selectedPatient.key ? "Deleting..." : "Delete Patient Record"}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="btn-outline !py-2 !px-4 text-xs font-semibold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- Add Patient Modal -------------------- */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card relative w-full max-w-lg p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 bg-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-smoke hover:bg-cream hover:text-ink transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-line">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-soft text-emerald-dark text-xl font-bold">
                👥
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  Register New Patient
                </h3>
                <p className="text-xs text-smoke">
                  Add walk-in patients, phone inquiries or direct offline cases
                </p>
              </div>
            </div>

            {addError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddPatient} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kavita Patel"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                    Mobile / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    className="input text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 26"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="input text-sm font-semibold"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Indore, MP"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                  Primary Health Complaint
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hairfall, Hormonal Acne, Melasma, PCOD..."
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                  Prescribed Remedies / Rx
                </label>
                <input
                  type="text"
                  placeholder="e.g. Thuja 200, Arnica Hair Oil"
                  value={newRemedies}
                  onChange={(e) => setNewRemedies(e.target.value)}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                  Clinical Notes / Routine Advice
                </label>
                <textarea
                  rows={2}
                  placeholder="Diet adjustments, follow-up timeline..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="input text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-line">
                <button
                  type="submit"
                  disabled={addingPatient}
                  className="btn-primary flex-1 !py-2.5 text-xs font-bold disabled:opacity-50"
                >
                  {addingPatient ? "Adding Patient..." : "Create Patient Record →"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline !py-2.5 !px-4 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
