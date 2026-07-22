"use client";

import { useState } from "react";
import { TenantsHeader } from "@/src/components/admin/tenants/TenantsHeader";
import { TenantsFilter } from "@/src/components/admin/tenants/TenantsFilter";
import { TenantsTable } from "@/src/components/admin/tenants/TenantsTable";
import { Tenant, TenantStatus, PaymentStatus } from "@/src/types/tenant";
import { Footer } from "@/src/components/landing/Footer";

// Mock Initial Tenant Data
const INITIAL_TENANTS: Tenant[] = [
  { id: "1", name: "Juan Dela Cruz", email: "juan@example.com", phone: "+63 917 123 4567", unit: "Unit 101", room: "Room A", rentAmount: 6500, leaseStart: "2024-01-15", leaseEnd: "2025-01-15", status: "Active", paymentStatus: "Paid" },
  { id: "2", name: "Maria Clara", email: "maria@example.com", phone: "+63 918 987 6543", unit: "Unit 102", room: "Room B", rentAmount: 7200, leaseStart: "2024-02-01", leaseEnd: "2025-02-01", status: "Active", paymentStatus: "Overdue" },
  { id: "3", name: "Pedro Penduko", email: "pedro@example.com", phone: "+63 919 555 4321", unit: "Unit 201", room: "Room C", rentAmount: 5800, leaseStart: "2024-03-10", leaseEnd: "2025-03-10", status: "Pending", paymentStatus: "Pending" },
  { id: "4", name: "Ana Santos", email: "ana@example.com", phone: "+63 920 888 9999", unit: "Unit 202", room: "Room A", rentAmount: 8000, leaseStart: "2023-06-01", leaseEnd: "2024-06-01", status: "Moving Out", paymentStatus: "Paid" },
];

export default function TenantsPage() {
  const [tenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | "All">("All");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "All">("All");

  // Filtering Logic
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm);

    const matchesStatus = statusFilter === "All" || tenant.status === statusFilter;
    const matchesPayment = paymentFilter === "All" || tenant.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const activeCount = tenants.filter((t) => t.status === "Active").length;
  const overdueCount = tenants.filter((t) => t.paymentStatus === "Overdue").length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* 1. Header & Summary Stats */}
      <TenantsHeader
        totalTenants={tenants.length}
        activeCount={activeCount}
        overdueCount={overdueCount}
        onAddTenant={() => alert("Open Add Tenant Modal")}
      />

      {/* 2. Filter Bar */}
      <TenantsFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
      />

      {/* 3. Main Tenants Table */}
      <TenantsTable
        tenants={filteredTenants}
        onSelectTenant={(tenant) => alert(`Selected: ${tenant.name}`)}
      />

      <Footer showNavLinks = {false} />
    </div>
  );
}