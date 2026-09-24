"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Booking, Settings, Product, ProductSale } from "@/lib/data";
import {
  formatDateLabel,
  formatINR,
  formatTime12,
  waLink,
} from "@/lib/data-client";
import { StatusBadge } from "@/components/admin/ui";

type TimeRange = "today" | "yesterday" | "week" | "month" | "all";
type ChartMetric = "all" | "appointments" | "products";

interface AdminDashboardClientProps {
  initialBookings: Booking[];
  initialSales?: ProductSale[];
  products?: Product[];
  settings: Settings;
}

export default function AdminDashboardClient({
  initialBookings,
  initialSales = [],
  products = [],
  settings,
}: AdminDashboardClientProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [chartMetric, setChartMetric] = useState<ChartMetric>("all");
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // Product sales state
  const [sales, setSales] = useState<ProductSale[]>(initialSales);
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [savingSale, setSavingSale] = useState(false);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [updatingSaleId, setUpdatingSaleId] = useState<string | null>(null);

  // New Sale Form State
  const [newSaleProduct, setNewSaleProduct] = useState(products[0]?.id || "");
  const [newSaleQty, setNewSaleQty] = useState(1);
  const [newSaleCustomTitle, setNewSaleCustomTitle] = useState("");
  const [newSaleCustomPrice, setNewSaleCustomPrice] = useState("");
  const [newSaleName, setNewSaleName] = useState("");
  const [newSalePhone, setNewSalePhone] = useState("");
  const [newSaleCity, setNewSaleCity] = useState("");
  const [newSalePaymentStatus, setNewSalePaymentStatus] = useState<"paid" | "pending">("paid");
  const [newSalePaymentMethod, setNewSalePaymentMethod] = useState<"upi" | "cash" | "bank-transfer">("upi");
  const [newSaleDeliveryStatus, setNewSaleDeliveryStatus] = useState<"processing" | "dispatched" | "delivered">("processing");
  const [newSaleCourier, setNewSaleCourier] = useState("");
  const [newSaleTracking, setNewSaleTracking] = useState("");
  const [newSaleNotes, setNewSaleNotes] = useState("");

  // Helper to determine estimated fee for a booking
  const getBookingFee = (b: Booking) => {
    const text = `${b.complaint ?? ""} ${(b.reasons || []).join(" ")}`.toLowerCase();
    if (
      text.includes("plan b") ||
      text.includes("4999") ||
      text.includes("3 month")
    ) {
      return settings.planBFee ?? 4999;
    }
    return settings.planAFee ?? 2000;
  };

  // Dates in IST (UTC+5:30)
  const todayObj = useMemo(() => {
    const now = new Date();
    return new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  }, []);

  const todayStr = useMemo(() => {
    return todayObj.toISOString().slice(0, 10);
  }, [todayObj]);

  const yesterdayStr = useMemo(() => {
    const d = new Date(todayObj.getTime() - 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  }, [todayObj]);

  const sevenDaysAgoStr = useMemo(() => {
    const d = new Date(todayObj.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  }, [todayObj]);

  const thirtyDaysAgoStr = useMemo(() => {
    const d = new Date(todayObj.getTime() - 30 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  }, [todayObj]);

  // Check if a booking falls within a time range
  const isBookingInRange = (b: Booking, range: TimeRange) => {
    const d = b.date || b.createdAt.slice(0, 10);
    if (range === "today") return d === todayStr;
    if (range === "yesterday") return d === yesterdayStr;
    if (range === "week") return d >= sevenDaysAgoStr;
    if (range === "month") return d >= thirtyDaysAgoStr;
    return true; // "all"
  };

  // Check if a sale falls within a time range
  const isSaleInRange = (s: ProductSale, range: TimeRange) => {
    const d = s.date || s.createdAt.slice(0, 10);
    if (range === "today") return d === todayStr;
    if (range === "yesterday") return d === yesterdayStr;
    if (range === "week") return d >= sevenDaysAgoStr;
    if (range === "month") return d >= thirtyDaysAgoStr;
    return true; // "all"
  };

  // Filtered bookings based on selected time range
  const filteredBookings = useMemo(() => {
    return initialBookings.filter((b) => isBookingInRange(b, timeRange));
  }, [initialBookings, timeRange]);

  // Paid patients in filtered period
  const paidBookings = useMemo(() => {
    return filteredBookings.filter(
      (b) => b.status === "confirmed" || b.status === "visited"
    );
  }, [filteredBookings]);

  // Pending bookings
  const pendingBookings = useMemo(() => {
    return filteredBookings.filter((b) => b.status === "pending");
  }, [filteredBookings]);

  // Filtered product sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => isSaleInRange(s, timeRange));
  }, [sales, timeRange]);

  // Paid product sales
  const paidSales = useMemo(() => {
    return filteredSales.filter((s) => s.paymentStatus === "paid");
  }, [filteredSales]);

  // Pending product sales
  const pendingSales = useMemo(() => {
    return filteredSales.filter((s) => s.paymentStatus === "pending");
  }, [filteredSales]);

  // Financial Computations
  const totalAppointmentEarnings = useMemo(() => {
    return paidBookings.reduce((acc, b) => acc + getBookingFee(b), 0);
  }, [paidBookings]);

  const totalProductEarnings = useMemo(() => {
    return paidSales.reduce((acc, s) => acc + s.totalAmount, 0);
  }, [paidSales]);

  const totalUnitsSold = useMemo(() => {
    return paidSales.reduce((acc, s) => acc + s.quantity, 0);
  }, [paidSales]);

  const totalClinicRevenue = totalAppointmentEarnings + totalProductEarnings;

  // Counts summary per range
  const rangeCounts = useMemo(() => {
    const calc = (r: TimeRange) => {
      const bCount = initialBookings.filter(
        (b) => isBookingInRange(b, r) && (b.status === "confirmed" || b.status === "visited")
      ).length;
      const sCount = sales.filter(
        (s) => isSaleInRange(s, r) && s.paymentStatus === "paid"
      ).length;
      return { bookings: bCount, sales: sCount, total: bCount + sCount };
    };

    return {
      today: calc("today"),
      yesterday: calc("yesterday"),
      week: calc("week"),
      month: calc("month"),
      all: {
        bookings: initialBookings.filter((b) => b.status === "confirmed" || b.status === "visited").length,
        sales: sales.filter((s) => s.paymentStatus === "paid").length,
        total: initialBookings.filter((b) => b.status === "confirmed" || b.status === "visited").length + sales.filter((s) => s.paymentStatus === "paid").length,
      },
    };
  }, [initialBookings, sales]);

  // Chart Data preparation: Daily breakdown of both Appointments & Product Sales
  const chartData = useMemo(() => {
    const days: {
      date: string;
      label: string;
      appointmentRev: number;
      productRev: number;
      totalRev: number;
      appointmentCount: number;
      productCount: number;
      totalCount: number;
    }[] = [];

    const getDailyData = (dStr: string) => {
      const dayBookings = initialBookings.filter(
        (b) =>
          (b.date === dStr || b.createdAt.slice(0, 10) === dStr) &&
          (b.status === "confirmed" || b.status === "visited")
      );
      const daySales = sales.filter(
        (s) =>
          (s.date === dStr || s.createdAt.slice(0, 10) === dStr) &&
          s.paymentStatus === "paid"
      );

      const appRev = dayBookings.reduce((acc, b) => acc + getBookingFee(b), 0);
      const prodRev = daySales.reduce((acc, s) => acc + s.totalAmount, 0);

      return {
        appRev,
        prodRev,
        totalRev: appRev + prodRev,
        appCount: dayBookings.length,
        prodCount: daySales.length,
      };
    };

    if (timeRange === "today") {
      const stats = getDailyData(todayStr);
      days.push({
        date: todayStr,
        label: "Today (" + formatDateLabel(todayStr) + ")",
        appointmentRev: stats.appRev,
        productRev: stats.prodRev,
        totalRev: stats.totalRev,
        appointmentCount: stats.appCount,
        productCount: stats.prodCount,
        totalCount: stats.appCount + stats.prodCount,
      });
    } else if (timeRange === "yesterday") {
      const stats = getDailyData(yesterdayStr);
      days.push({
        date: yesterdayStr,
        label: "Yesterday (" + formatDateLabel(yesterdayStr) + ")",
        appointmentRev: stats.appRev,
        productRev: stats.prodRev,
        totalRev: stats.totalRev,
        appointmentCount: stats.appCount,
        productCount: stats.prodCount,
        totalCount: stats.appCount + stats.prodCount,
      });
    } else if (timeRange === "week") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(todayObj.getTime() - i * 24 * 60 * 60 * 1000);
        const dStr = d.toISOString().slice(0, 10);
        const stats = getDailyData(dStr);
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        days.push({
          date: dStr,
          label: `${dayName} ${d.getDate()}`,
          appointmentRev: stats.appRev,
          productRev: stats.prodRev,
          totalRev: stats.totalRev,
          appointmentCount: stats.appCount,
          productCount: stats.prodCount,
          totalCount: stats.appCount + stats.prodCount,
        });
      }
    } else if (timeRange === "month") {
      for (let i = 13; i >= 0; i--) {
        const d = new Date(todayObj.getTime() - i * 2 * 24 * 60 * 60 * 1000);
        const dStr = d.toISOString().slice(0, 10);
        const nextDStr = new Date(d.getTime() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);

        const dayBookings = initialBookings.filter(
          (b) =>
            b.date >= dStr &&
            b.date < nextDStr &&
            (b.status === "confirmed" || b.status === "visited")
        );
        const daySales = sales.filter(
          (s) =>
            s.date >= dStr &&
            s.date < nextDStr &&
            s.paymentStatus === "paid"
        );

        const appRev = dayBookings.reduce((acc, b) => acc + getBookingFee(b), 0);
        const prodRev = daySales.reduce((acc, s) => acc + s.totalAmount, 0);

        days.push({
          date: dStr,
          label: `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })}`,
          appointmentRev: appRev,
          productRev: prodRev,
          totalRev: appRev + prodRev,
          appointmentCount: dayBookings.length,
          productCount: daySales.length,
          totalCount: dayBookings.length + daySales.length,
        });
      }
    } else {
      // All time
      const allDates = new Set<string>();
      initialBookings.forEach((b) => {
        if (b.status === "confirmed" || b.status === "visited") {
          allDates.add(b.date || b.createdAt.slice(0, 10));
        }
      });
      sales.forEach((s) => {
        if (s.paymentStatus === "paid") {
          allDates.add(s.date || s.createdAt.slice(0, 10));
        }
      });

      const sortedDates = Array.from(allDates).sort();
      if (sortedDates.length === 0) {
        days.push({
          date: todayStr,
          label: formatDateLabel(todayStr),
          appointmentRev: 0,
          productRev: 0,
          totalRev: 0,
          appointmentCount: 0,
          productCount: 0,
          totalCount: 0,
        });
      } else {
        sortedDates.forEach((dStr) => {
          const stats = getDailyData(dStr);
          days.push({
            date: dStr,
            label: formatDateLabel(dStr),
            appointmentRev: stats.appRev,
            productRev: stats.prodRev,
            totalRev: stats.totalRev,
            appointmentCount: stats.appCount,
            productCount: stats.prodCount,
            totalCount: stats.appCount + stats.prodCount,
          });
        });
      }
    }

    return days;
  }, [timeRange, initialBookings, sales, todayObj, todayStr, yesterdayStr]);

  // Max value in chart for scaling
  const maxChartRevenue = useMemo(() => {
    return Math.max(
      ...chartData.map((d) => {
        if (chartMetric === "appointments") return d.appointmentRev;
        if (chartMetric === "products") return d.productRev;
        return d.totalRev;
      }),
      1000
    );
  }, [chartData, chartMetric]);

  // Total in chart for currently active metric
  const currentChartTotal = useMemo(() => {
    if (chartMetric === "appointments") return totalAppointmentEarnings;
    if (chartMetric === "products") return totalProductEarnings;
    return totalClinicRevenue;
  }, [chartMetric, totalAppointmentEarnings, totalProductEarnings, totalClinicRevenue]);

  // Toggle payment status on sale
  const handleToggleSalePayment = async (sale: ProductSale) => {
    const nextStatus = sale.paymentStatus === "paid" ? "pending" : "paid";
    setUpdatingSaleId(sale.id);
    try {
      const res = await fetch(`/api/admin/sales/${sale.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });
      if (res.ok) {
        setSales((prev) =>
          prev.map((s) => (s.id === sale.id ? { ...s, paymentStatus: nextStatus } : s))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingSaleId(null);
    }
  };

  // Cycle delivery status on sale
  const handleCycleDelivery = async (sale: ProductSale) => {
    const flow: Record<string, "processing" | "dispatched" | "delivered"> = {
      processing: "dispatched",
      dispatched: "delivered",
      delivered: "processing",
    };
    const nextDelivery = flow[sale.deliveryStatus] || "processing";
    setUpdatingSaleId(sale.id);
    try {
      const res = await fetch(`/api/admin/sales/${sale.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStatus: nextDelivery }),
      });
      if (res.ok) {
        setSales((prev) =>
          prev.map((s) => (s.id === sale.id ? { ...s, deliveryStatus: nextDelivery } : s))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingSaleId(null);
    }
  };

  // Delete product sale
  const handleDeleteSale = async (saleId: string) => {
    if (!confirm("Are you sure you want to delete this sale record?")) return;
    setUpdatingSaleId(saleId);
    try {
      const res = await fetch(`/api/admin/sales/${saleId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSales((prev) => prev.filter((s) => s.id !== saleId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingSaleId(null);
    }
  };

  // Save new sale modal submit
  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaleError(null);
    setSavingSale(true);

    let productTitle = newSaleCustomTitle;
    let unitPrice = Number(newSaleCustomPrice) || 0;

    const selectedProd = products.find((p) => p.id === newSaleProduct);
    if (selectedProd && newSaleProduct !== "custom") {
      productTitle = `${selectedProd.title} (${selectedProd.size})`;
      unitPrice = selectedProd.price;
    }

    if (!productTitle) {
      setSaleError("Please select or enter a product title.");
      setSavingSale(false);
      return;
    }

    if (!newSaleName.trim()) {
      setSaleError("Customer name is required.");
      setSavingSale(false);
      return;
    }

    const totalAmount = unitPrice * Math.max(1, newSaleQty);

    try {
      const res = await fetch("/api/admin/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: newSaleName.trim(),
          customerPhone: newSalePhone.trim(),
          customerCity: newSaleCity.trim(),
          productId: selectedProd ? selectedProd.id : "custom",
          productTitle,
          quantity: Math.max(1, newSaleQty),
          unitPrice,
          totalAmount,
          paymentStatus: newSalePaymentStatus,
          paymentMethod: newSalePaymentMethod,
          deliveryStatus: newSaleDeliveryStatus,
          courierName: newSaleCourier.trim(),
          trackingNumber: newSaleTracking.trim(),
          notes: newSaleNotes.trim(),
          date: todayStr,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSaleError(data.error || "Failed to record sale.");
      } else {
        setSales((prev) => [data.sale, ...prev]);
        setShowAddSaleModal(false);
        // reset fields
        setNewSaleName("");
        setNewSalePhone("");
        setNewSaleCity("");
        setNewSaleCustomTitle("");
        setNewSaleCustomPrice("");
        setNewSaleNotes("");
      }
    } catch (err) {
      setSaleError("Network error while recording sale.");
    } finally {
      setSavingSale(false);
    }
  };

  const tabs: { key: TimeRange; label: string; count: number }[] = [
    { key: "today", label: "Today", count: rangeCounts.today.total },
    { key: "yesterday", label: "Yesterday", count: rangeCounts.yesterday.total },
    { key: "week", label: "Last 7 Days", count: rangeCounts.week.total },
    { key: "month", label: "Last 30 Days", count: rangeCounts.month.total },
    { key: "all", label: "All Time", count: rangeCounts.all.total },
  ];

  return (
    <div className="space-y-7">
      {/* ----------------- Top Header & Time Selector ----------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-dark">
            Overview &amp; Financial Analytics
          </span>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
            Clinic &amp; Dispensary Dashboard
          </h1>
          <p className="mt-1 text-xs text-smoke">
            Real-time track of consultation earnings, dispensary product sales, and patient volume.
          </p>
        </div>

        {/* Time Selector Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-cream/80 p-1.5 border border-line shadow-xs">
          {tabs.map((tab) => {
            const active = timeRange === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setTimeRange(tab.key);
                  setHoveredDataIndex(null);
                }}
                className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-white text-emerald-dark shadow-sm ring-1 ring-black/5"
                    : "text-smoke hover:text-ink hover:bg-white/50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                    active ? "bg-emerald-soft text-emerald-dark" : "bg-line/60 text-smoke"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------- Primary KPI Stat Cards ------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Clinic Revenue */}
        <div className="card relative overflow-hidden p-5 sm:p-6 shadow-md border-2 border-gold/40 bg-gradient-to-br from-paper via-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Total Revenue ({timeRange === "all" ? "All Time" : timeRange})
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/20 text-amber-800 font-bold text-base">
              💎
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            {formatINR(totalClinicRevenue)}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-soft px-2 py-0.5 font-bold text-emerald-dark text-[11px]">
              🩺 {formatINR(totalAppointmentEarnings)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800 text-[11px]">
              🧴 {formatINR(totalProductEarnings)}
            </span>
          </div>
        </div>

        {/* Consultation Earning */}
        <div className="card p-5 sm:p-6 shadow-sm border border-emerald/30 bg-paper">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-dark">
              Consultations Earning
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-soft text-emerald-dark font-bold text-base">
              🩺
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            {formatINR(totalAppointmentEarnings)}
          </p>
          <p className="mt-2.5 text-xs text-smoke font-medium">
            <strong>{paidBookings.length}</strong> patient consultations confirmed / visited
          </p>
        </div>

        {/* Product Sales Earning */}
        <div className="card p-5 sm:p-6 shadow-sm border border-gold/40 bg-paper">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Dispensary Product Sales
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold text-base">
              🧴
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            {formatINR(totalProductEarnings)}
          </p>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-smoke">
              <strong>{totalUnitsSold}</strong> items sold ({paidSales.length} paid orders)
            </span>
            <button
              type="button"
              onClick={() => setShowAddSaleModal(true)}
              className="text-[11px] font-bold text-emerald-dark hover:underline"
            >
              + Add Sale
            </button>
          </div>
        </div>

        {/* Pending & Action Required */}
        <div className="card p-5 sm:p-6 shadow-sm border border-line bg-paper">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-smoke">
              Awaiting Confirmation
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream text-smoke font-bold text-base">
              ⏳
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            {pendingBookings.length + pendingSales.length}
          </p>
          <p className="mt-2.5 text-xs text-smoke font-medium">
            <strong>{pendingBookings.length}</strong> consults · <strong>{pendingSales.length}</strong> product orders pending
          </p>
        </div>
      </div>

      {/* -------------------- Interactive Revenue Chart -------------------- */}
      <section className="card p-6 shadow-sm bg-paper border border-line">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald" />
              <h3 className="font-display text-lg font-bold text-ink">
                Revenue &amp; Earnings Trend
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-smoke">
              Showing earnings in selected period ({timeRange.toUpperCase()})
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Metric Switcher */}
            <div className="flex rounded-xl bg-cream p-1 border border-line text-xs font-bold">
              <button
                type="button"
                onClick={() => setChartMetric("all")}
                className={`rounded-lg px-2.5 py-1 transition-colors ${
                  chartMetric === "all"
                    ? "bg-white text-ink shadow-xs"
                    : "text-smoke hover:text-ink"
                }`}
              >
                All Revenue
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("appointments")}
                className={`rounded-lg px-2.5 py-1 transition-colors ${
                  chartMetric === "appointments"
                    ? "bg-white text-emerald-dark shadow-xs"
                    : "text-smoke hover:text-ink"
                }`}
              >
                Consultations
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("products")}
                className={`rounded-lg px-2.5 py-1 transition-colors ${
                  chartMetric === "products"
                    ? "bg-white text-amber-800 shadow-xs"
                    : "text-smoke hover:text-ink"
                }`}
              >
                Product Sales
              </button>
            </div>

            <div className="text-right hidden md:block">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-smoke">
                Period Total
              </span>
              <span className="font-display text-xl font-bold text-ink">
                {formatINR(currentChartTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="relative pt-6 pb-2">
          {/* Chart Bars */}
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-56 px-2 border-b border-line">
            {chartData.map((d, idx) => {
              const activeVal =
                chartMetric === "appointments"
                  ? d.appointmentRev
                  : chartMetric === "products"
                  ? d.productRev
                  : d.totalRev;

              const heightPct =
                maxChartRevenue > 0
                  ? Math.max(8, Math.round((activeVal / maxChartRevenue) * 100))
                  : 8;
              const hasRevenue = activeVal > 0;
              const isHovered = hoveredDataIndex === idx;

              return (
                <div
                  key={idx}
                  className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredDataIndex(idx)}
                  onMouseLeave={() => setHoveredDataIndex(null)}
                  onClick={() => setHoveredDataIndex(idx)}
                >
                  {/* Floating Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-14 z-30 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                      <div className="rounded-xl bg-ink px-3 py-1.5 text-center text-white shadow-xl text-xs whitespace-nowrap">
                        <span className="font-bold text-emerald-light">
                          {formatINR(activeVal)}
                        </span>
                        <div className="text-[10px] text-white/80 space-x-1.5">
                          <span>🩺 {formatINR(d.appointmentRev)}</span>
                          <span>·</span>
                          <span>🧴 {formatINR(d.productRev)}</span>
                        </div>
                      </div>
                      <div className="h-2 w-2 rotate-45 bg-ink -mt-1" />
                    </div>
                  )}

                  {/* Top value label */}
                  {hasRevenue && (
                    <span className="text-[10px] font-mono font-bold text-emerald-dark mb-1 hidden sm:inline">
                      {formatINR(activeVal)}
                    </span>
                  )}

                  {/* The Bar itself */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 relative overflow-hidden ${
                      isHovered
                        ? "bg-gradient-to-t from-emerald-dark via-emerald to-gold shadow-md scale-105"
                        : chartMetric === "products"
                        ? "bg-gradient-to-t from-amber-700 via-gold to-amber-400 opacity-90"
                        : chartMetric === "appointments"
                        ? "bg-gradient-to-t from-emerald-dark via-emerald to-emerald-light opacity-90"
                        : "bg-gradient-to-t from-emerald-dark via-emerald to-gold opacity-90"
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between gap-2 sm:gap-4 px-2 pt-2 text-[10px] sm:text-xs text-smoke font-medium">
            {chartData.map((d, idx) => (
              <span
                key={idx}
                className={`flex-1 text-center truncate ${
                  hoveredDataIndex === idx ? "text-ink font-bold" : ""
                }`}
                title={d.label}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-line/60 flex flex-wrap items-center justify-between gap-3 text-xs text-smoke">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-dark" />
              <span>Consultations</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-gold" />
              <span>Product Sales</span>
            </span>
          </div>
          <span className="text-[11px]">
            Hover or tap any bar for detailed consultation vs product breakdown.
          </span>
        </div>
      </section>

      {/* ------------ 🧴 Product Orders & Dispensary Sales Section ------------ */}
      <section className="card p-6 shadow-sm bg-paper border-2 border-gold/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-gold" />
              <h3 className="font-display text-lg font-bold text-ink">
                Dispensary Product Sales ({filteredSales.length})
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-smoke">
              Manage product orders, payment status, customer WhatsApp updates &amp; courier dispatch ({timeRange.toUpperCase()})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddSaleModal(true)}
              className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <span>+ Record New Sale</span>
            </button>
            <Link
              href="/admin/products"
              className="btn-outline !py-2 !px-3 text-xs font-semibold"
            >
              Manage Inventory →
            </Link>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="py-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-smoke text-2xl mb-3">
              🧴
            </span>
            <p className="text-sm font-semibold text-ink">
              No product sales recorded for this period ({timeRange})
            </p>
            <p className="mt-1 text-xs text-smoke">
              Click &quot;+ Record New Sale&quot; to log a WhatsApp order or offline store purchase.
            </p>
            <button
              type="button"
              onClick={() => setShowAddSaleModal(true)}
              className="btn-primary mt-4 !py-2 !px-4 text-xs"
            >
              + Record Product Sale
            </button>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-smoke font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pr-3">Sale ID &amp; Date</th>
                  <th className="pb-3 px-3">Customer Details</th>
                  <th className="pb-3 px-3">Product Formulations</th>
                  <th className="pb-3 px-3 text-right">Amount</th>
                  <th className="pb-3 px-3 text-center">Payment</th>
                  <th className="pb-3 px-3 text-center">Delivery Status</th>
                  <th className="pb-3 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filteredSales.map((s) => {
                  const isBusy = updatingSaleId === s.id;
                  const waMsg = encodeURIComponent(
                    `Hi ${s.customerName}, this is Dr. Arwa Bohra Clinic regarding your order for *${s.productTitle}* (Qty: ${s.quantity}, Total: ₹${s.totalAmount}). Status: ${s.deliveryStatus.toUpperCase()}${s.trackingNumber ? ` (Tracking: ${s.trackingNumber} via ${s.courierName || 'Courier'})` : ''}. Thank you!`
                  );
                  const waCustomerLink = `https://wa.me/91${s.customerPhone.replace(/\D/g, "")}?text=${waMsg}`;

                  return (
                    <tr key={s.id} className="hover:bg-cream/40 transition-colors">
                      {/* ID & Date */}
                      <td className="py-3.5 pr-3 font-mono font-medium text-ink">
                        <span className="font-bold text-emerald-dark">{s.id}</span>
                        <span className="block text-[11px] text-smoke mt-0.5">
                          {formatDateLabel(s.date || s.createdAt.slice(0, 10))}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-ink text-sm block">
                          {s.customerName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-smoke">{s.customerPhone}</span>
                          {s.customerCity && (
                            <span className="text-[10px] text-smoke/80 font-medium">
                              · {s.customerCity}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-ink block">
                          {s.productTitle}
                        </span>
                        <span className="text-[11px] text-smoke">
                          Qty: <strong>{s.quantity}</strong> × {formatINR(s.unitPrice)}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-sm text-ink">
                        {formatINR(s.totalAmount)}
                      </td>

                      {/* Payment Status (Click to toggle) */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleSalePayment(s)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all shadow-xs cursor-pointer ${
                            s.paymentStatus === "paid"
                              ? "bg-emerald-soft text-emerald-dark hover:bg-emerald-100"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                          title="Click to toggle payment status"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${s.paymentStatus === "paid" ? "bg-emerald-dark" : "bg-amber-700"}`} />
                          <span className="capitalize">{s.paymentStatus}</span>
                        </button>
                      </td>

                      {/* Delivery Status (Click to cycle) */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleCycleDelivery(s)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all shadow-xs cursor-pointer ${
                            s.deliveryStatus === "delivered"
                              ? "bg-emerald-soft text-emerald-dark"
                              : s.deliveryStatus === "dispatched"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-cream text-smoke"
                          }`}
                          title="Click to cycle: Processing → Dispatched → Delivered"
                        >
                          <span className="capitalize">{s.deliveryStatus}</span>
                        </button>
                        {s.trackingNumber && (
                          <span className="block font-mono text-[10px] text-smoke mt-0.5">
                            {s.courierName ? `${s.courierName}: ` : ""}{s.trackingNumber}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 text-right space-x-2">
                        {s.customerPhone && (
                          <a
                            href={waCustomerLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-soft/80 px-2 py-1 text-[11px] font-bold text-emerald-dark hover:bg-emerald-soft"
                            title="Send WhatsApp update to patient"
                          >
                            <span>WhatsApp</span>
                          </a>
                        )}
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDeleteSale(s.id)}
                          className="rounded-lg p-1 text-smoke hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete sale record"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ----------- 🩺 Recent Consultations & Paid Patients Table ----------- */}
      <section className="card p-6 shadow-sm bg-paper border-2 border-emerald/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald" />
              <h3 className="font-display text-lg font-bold text-ink">
                Verified Patient Appointments ({paidBookings.length})
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-smoke">
              List of patients with verified appointment consultation fee payments ({timeRange.toUpperCase()})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-emerald-soft px-3 py-1.5 text-xs font-bold text-emerald-dark">
              Consultations: {formatINR(totalAppointmentEarnings)}
            </span>
            <Link
              href="/admin/appointments"
              className="btn-outline !py-2 !px-3 text-xs font-semibold"
            >
              All Appointments →
            </Link>
          </div>
        </div>

        {paidBookings.length === 0 ? (
          <div className="py-12 text-center text-smoke text-sm">
            No payments recorded for this time range ({timeRange}). Switch to &quot;All Time&quot; or check Pending slots.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-smoke font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pr-3">Appointment</th>
                  <th className="pb-3 px-3">Patient Details</th>
                  <th className="pb-3 px-3">Plan / Concern</th>
                  <th className="pb-3 px-3 text-right">Fee Paid</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 pl-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {paidBookings.map((b) => {
                  const fee = getBookingFee(b);
                  return (
                    <tr key={b.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3.5 pr-3 font-mono font-medium text-ink">
                        <span className="font-bold text-emerald-dark">{b.id}</span>
                        <span className="block text-[11px] text-smoke mt-0.5">
                          {formatDateLabel(b.date)} · {formatTime12(b.time)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-ink text-sm block">
                          {b.name}
                        </span>
                        <span className="font-mono text-smoke text-[11px]">
                          {b.mobile}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-ink block">
                          {fee > 3000 ? "Plan B · Complete Care (3 Mo)" : "Plan A · Essential Care"}
                        </span>
                        <span className="text-smoke text-[11px] truncate max-w-[200px] block">
                          {b.complaint || (b.reasons || []).join(", ") || "General Homeopathy Consultation"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-sm text-emerald-dark">
                        {formatINR(fee)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3.5 pl-3 text-right">
                        <a
                          href={waLink(b.mobile, `Hi ${b.name}, Dr. Arwa Bohra Clinic here regarding your consultation scheduled for ${formatDateLabel(b.date)} at ${formatTime12(b.time)}. Thank you!`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-soft/80 px-2 py-1 text-[11px] font-bold text-emerald-dark hover:bg-emerald-soft"
                        >
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* -------------------- Add Sale Modal -------------------- */}
      {showAddSaleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowAddSaleModal(false)}
        >
          <div
            className="card relative w-full max-w-lg p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 bg-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAddSaleModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-smoke hover:bg-cream hover:text-ink transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-line">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-amber-800 text-xl font-bold">
                🧴
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  Record Dispensary Product Sale
                </h3>
                <p className="text-xs text-smoke">
                  Log WhatsApp orders or offline clinic dispensary sales
                </p>
              </div>
            </div>

            {saleError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                {saleError}
              </div>
            )}

            <form onSubmit={handleCreateSale} className="mt-5 space-y-4 text-xs">
              {/* Product Selection */}
              <div>
                <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                  Select Product *
                </label>
                <select
                  value={newSaleProduct}
                  onChange={(e) => {
                    setNewSaleProduct(e.target.value);
                  }}
                  className="input text-sm"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.size}) — {formatINR(p.price)}
                    </option>
                  ))}
                  <option value="custom">Other / Custom Formulation</option>
                </select>
              </div>

              {/* Custom Title if selected */}
              {newSaleProduct === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Customized Hair Tonic"
                      value={newSaleCustomTitle}
                      onChange={(e) => setNewSaleCustomTitle(e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                      Unit Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1200"
                      value={newSaleCustomPrice}
                      onChange={(e) => setNewSaleCustomPrice(e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newSaleQty}
                    onChange={(e) => setNewSaleQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input text-sm w-24 text-center font-bold"
                  />
                  <span className="text-smoke text-xs">
                    Total Estimated Amount:{" "}
                    <strong className="text-ink text-sm font-bold">
                      {formatINR(
                        (newSaleProduct === "custom"
                          ? Number(newSaleCustomPrice) || 0
                          : (products.find((p) => p.id === newSaleProduct)?.price || 0)) * newSaleQty
                      )}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="border-t border-line/60 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Customer Name */}
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunita Mehta"
                    value={newSaleName}
                    onChange={(e) => setNewSaleName(e.target.value)}
                    className="input text-sm"
                  />
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={newSalePhone}
                    onChange={(e) => setNewSalePhone(e.target.value)}
                    className="input text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* City */}
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                    City / State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Indore, MP"
                    value={newSaleCity}
                    onChange={(e) => setNewSaleCity(e.target.value)}
                    className="input text-sm"
                  />
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                    Payment Status
                  </label>
                  <select
                    value={newSalePaymentStatus}
                    onChange={(e) => setNewSalePaymentStatus(e.target.value as "paid" | "pending")}
                    className="input text-sm font-semibold"
                  >
                    <option value="paid">Paid (Confirmed)</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Delivery Status */}
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                    Delivery Status
                  </label>
                  <select
                    value={newSaleDeliveryStatus}
                    onChange={(e) => setNewSaleDeliveryStatus(e.target.value as "processing" | "dispatched" | "delivered")}
                    className="input text-sm font-semibold"
                  >
                    <option value="processing">Processing</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Courier info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                    Courier Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BlueDart / Speed Post"
                    value={newSaleCourier}
                    onChange={(e) => setNewSaleCourier(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BD98712345"
                    value={newSaleTracking}
                    onChange={(e) => setNewSaleTracking(e.target.value)}
                    className="input text-sm font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-ink uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid on UPI 7049205128"
                  value={newSaleNotes}
                  onChange={(e) => setNewSaleNotes(e.target.value)}
                  className="input text-sm"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-line">
                <button
                  type="submit"
                  disabled={savingSale}
                  className="btn-primary flex-1 !py-2.5 text-xs font-bold disabled:opacity-50"
                >
                  {savingSale ? "Recording..." : "Save Product Sale →"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSaleModal(false)}
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
