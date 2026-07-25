"use client";

import { useState } from "react";
import { TenantsHeader } from "@/src/components/admin/tenants/TenantsHeader";
import { TenantsFilter } from "@/src/components/admin/tenants/TenantsFilter";
import { TenantsTable } from "@/src/components/admin/tenants/TenantsTable";
import { AddTenantModal } from "@/src/components/admin/tenants/AddTenantModal";
import { TenantDetailModal } from "@/src/components/admin/tenants/TenantDetailModal";
import { Tenant, LeaseStatus, BillStatus } from "@/src/types/tenant/tenant";
import { Footer } from "@/src/components/landing/Footer";

interface TenantsClientWrapperProps {
  initialTenants: Tenant[];
}

export default function TenantsClientWrapper({ initialTenants }: TenantsClientWrapperProps) {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeaseStatus | "All">("All");
  const [paymentFilter, setPaymentFilter] = useState<BillStatus | "All">("All");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState<Tenant | null>(null); // State para sa tenant na ine-edit

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filtering Logic
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.phone && tenant.phone.includes(searchTerm));

    const matchesStatus = statusFilter === "All" || tenant.leaseStatus === statusFilter;
    const matchesPayment = paymentFilter === "All" || tenant.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const activeCount = tenants.filter((t) => t.leaseStatus === "active").length;
  const overdueCount = tenants.filter((t) => t.paymentStatus === "overdue").length;

  const handleTenantSaved = (savedTenant: Tenant) => {
    setTenants((prevTenants) => {
      const exists = prevTenants.some((t) => t.id === savedTenant.id);
      if (exists) {
        // Kung na-update, i-replace ang lumang data
        return prevTenants.map((t) => (t.id === savedTenant.id ? savedTenant : t));
      }
      // Kung bago, idagdag sa unahan
      return [savedTenant, ...prevTenants];
    });
  };

  const handleSelectTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDetailModalOpen(true);
  };

  // Function para buksan ang modal para sa pag-edit
  const handleOpenEditModal = (tenant: Tenant) => {
    setTenantToEdit(tenant);
    setIsAddModalOpen(true);
  };

  // Function para buksan ang modal para sa pagdaragdag ng bago
  const handleOpenAddModal = () => {
    setTenantToEdit(null);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <TenantsHeader
        totalTenants={tenants.length}
        activeCount={activeCount}
        overdueCount={overdueCount}
        onAddTenant={handleOpenAddModal}
      />

      <TenantsFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
      />

      <TenantsTable
        tenants={filteredTenants}
        onSelectTenant={handleSelectTenant}
        onEditTenant={handleOpenEditModal} // I-pass ito sa table kung mayroon kang edit button doon
      />

      <AddTenantModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setTenantToEdit(null);
        }}
        onTenantSaved={handleTenantSaved}
        tenantToEdit={tenantToEdit}
      />

      <TenantDetailModal
        tenant={selectedTenant}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTenant(null);
        }}
      />

      <Footer showNavLinks={false} />
    </div>
  );
}