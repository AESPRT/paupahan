"use server";

import prisma from "@/src/lib/prisma";
import { cookies } from "next/headers";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import AdmZip from "adm-zip";

export async function getAdminReportsData() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { success: false, error: "Walang active session." };
    }

    // 1. Kunin ang Landlord Properties
    const landlordProperties = await prisma.property.findMany({
      where: { landlordId: userId },
      select: { id: true },
    });
    const propertyIds = landlordProperties.map((p) => p.id);

    // 2. Dual-Layer Tenant IDs (Direct + Leases)
    const directTenants = await prisma.tenant.findMany({
      where: { userId },
      select: { id: true },
    });

    const leaseTenants = await prisma.tenant.findMany({
      where: {
        leases: {
          some: {
            OR: [
              { unit: { propertyId: { in: propertyIds } } },
              { room: { unit: { propertyId: { in: propertyIds } } } },
            ],
          },
        },
      },
      select: { id: true },
    });

    const tenantIds = Array.from(
      new Set([
        ...directTenants.map((t) => t.id),
        ...leaseTenants.map((t) => t.id),
      ])
    );

    // 3. Occupancy Calculation (Units & Rooms)
    const units = await prisma.unit.findMany({
      where: { propertyId: { in: propertyIds } },
      include: {
        rooms: {
          include: {
            leases: { where: { status: { in: ["active"] } } },
          },
        },
        leases: { where: { status: { in: ["active"] } } },
      },
    });

    let totalRoomsOrUnits = 0;
    let occupiedCount = 0;

    units.forEach((unit) => {
      if (unit.rooms && unit.rooms.length > 0) {
        unit.rooms.forEach((room) => {
          totalRoomsOrUnits++;
          if (
            (room.leases && room.leases.length > 0) ||
            room.status?.toLowerCase() === "occupied"
          ) {
            occupiedCount++;
          }
        });
      } else {
        totalRoomsOrUnits++;
        if (
          (unit.leases && unit.leases.length > 0) ||
          unit.status?.toLowerCase() === "occupied"
        ) {
          occupiedCount++;
        }
      }
    });

    const occupancyRate =
      totalRoomsOrUnits > 0
        ? Math.round((occupiedCount / totalRoomsOrUnits) * 100)
        : 0;

    // 4. Revenue / Paid Bills Calculation
    let totalRevenue = 0;
    let overdueBillsCount = 0;
    let paidBillsCount = 0;

    if (tenantIds.length > 0) {
      const paidBills = await prisma.bill.findMany({
        where: {
          tenantId: { in: tenantIds },
          status: { in: ["paid"] },
        },
        select: { totalAmount: true },
      });

      paidBillsCount = paidBills.length;
      totalRevenue = paidBills.reduce(
        (acc, bill) => acc + Number(bill.totalAmount || 0),
        0
      );

      overdueBillsCount = await prisma.bill.count({
        where: {
          tenantId: { in: tenantIds },
          status: { in: ["overdue"] },
        },
      });
    }

    // 5. Maintenance / Expenses
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        OR: [
          { room: { unit: { propertyId: { in: propertyIds } } } },
          { unit: { propertyId: { in: propertyIds } } },
        ],
      },
      select: { expenses: true },
    });

    const maintenanceCount = maintenanceRequests.length;
    const totalExpenses = maintenanceRequests.reduce(
      (acc, req) => acc + Number(req.expenses || 0),
      0
    );

    const netIncome = totalRevenue - totalExpenses;

    const financialSummary = {
      period: new Date().toLocaleString("fil-PH", {
        month: "long",
        year: "numeric",
      }),
      totalRevenue,
      totalExpenses,
      netIncome,
      occupancyRate,
    };

    const totalTenants = tenantIds.length;

    const reportsList = [
      {
        id: "rep-income",
        title: "Financial & Income Statement",
        description: "Buong ulat ng koleksyon ng renta, utilities, at natanggap na bayad sa napiling buwan.",
        lastGenerated: "Ngayon",
        fileSize: `${(paidBillsCount * 0.05 + 0.5).toFixed(1)} MB`,
      },
      {
        id: "rep-tenants",
        title: "Tenant Masterlist & Records",
        description: `Talaan ng lahat ng aktibong tenant (${totalTenants} kabuuang tala), contact numbers, emergency contact, at kasunduan.`,
        lastGenerated: "Kahapon",
        fileSize: "850 KB",
      },
      {
        id: "rep-unpaid",
        title: "Overdue & Balanse (Delinquency)",
        description: `Listahan ng mga hindi pa nakakabayad ng renta (${overdueBillsCount} overdue bills), late fees, at natitirang balance.`,
        lastGenerated: "Huling na-update",
        fileSize: "512 KB",
      },
      {
        id: "rep-utilities",
        title: "Sub-meter & Utility Readings",
        description: "Ulat sa pagkonsumo ng kuryente at tubig ng bawat kwarto kasama ang dating readings.",
        lastGenerated: "Huling na-update",
        fileSize: "1.5 MB",
      },
      {
        id: "rep-occupancy",
        title: "Occupancy & Vacancy Report",
        description: `Status ng bawat property (${occupiedCount} occupied / ${totalRoomsOrUnits} total) para sa property planning.`,
        lastGenerated: "Huling na-update",
        fileSize: "620 KB",
      },
      {
        id: "rep-expenses",
        title: "Maintenance & Expenses Log",
        description: `Talaan ng mga ginastos sa pagkumpuni (${maintenanceCount} maintenance requests), pasahod, at pangkalahatang maintenance.`,
        lastGenerated: "Huling na-update",
        fileSize: "940 KB",
      },
    ];

    return { success: true, financialSummary, reportsList };
  } catch (error) {
    console.error("Error fetching reports data:", error);
    return { success: false, error: "Nabigong kunin ang data ng mga ulat." };
  }
}

export async function generateReportAction(reportId: string, format: string) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const lowerFormat = format.toLowerCase();
    let fileBuffer: Buffer;
    let mimeType = "application/octet-stream";
    let fileExtension = lowerFormat;

    // 1. Kunin ang Landlord Properties & Tenant IDs (Dual-Layer Match)
    const landlordProperties = await prisma.property.findMany({
      where: { landlordId: userId },
      select: { id: true },
    });
    const propertyIds = landlordProperties.map((p) => p.id);

    const directTenants = await prisma.tenant.findMany({
      where: { userId },
      select: { id: true },
    });

    const leaseTenants = await prisma.tenant.findMany({
      where: {
        leases: {
          some: {
            OR: [
              { unit: { propertyId: { in: propertyIds } } },
              { room: { unit: { propertyId: { in: propertyIds } } } },
            ],
          },
        },
      },
      select: { id: true },
    });

    const tenantIds = Array.from(
      new Set([
        ...directTenants.map((t) => t.id),
        ...leaseTenants.map((t) => t.id),
      ])
    );

    // Filter helper para sa Direct Lease / Property Relations
    const propertyRelationFilter = {
      OR: [
        { room: { unit: { propertyId: { in: propertyIds } } } },
        { unit: { propertyId: { in: propertyIds } } },
      ],
    };

    if (lowerFormat === "pdf") {
      mimeType = "application/pdf";
      fileExtension = "pdf";

      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Paupahan System Report", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Report ID: ${reportId} | Petsa: ${new Date().toLocaleDateString("fil-PH")}`, 14, 28);

      let currentY = 40;

      if (reportId === "rep-income") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Financial & Income Statement", 14, currentY);
        currentY += 10;

        // PAID ONLY (Excluding pending, draft, unpaid)
        const payments = await prisma.bill.findMany({
          where: {
            tenantId: { in: tenantIds },
            status: { in: ["paid"] },
          },
          include: { tenant: true },
        });

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Billing ID", 14, currentY);
        doc.text("Tenant", 70, currentY);
        doc.text("Amount", 140, currentY);
        doc.text("Status", 180, currentY);
        currentY += 6;

        doc.setFont("helvetica", "normal");
        payments.forEach((p) => {
          if (currentY > 270) { doc.addPage(); currentY = 20; }
          doc.text(p.id.substring(0, 8) + "...", 14, currentY);
          doc.text(p.tenant?.fullName || "N/A", 70, currentY);
          doc.text(`PHP ${Number(p.totalAmount || 0).toLocaleString()}`, 140, currentY);
          doc.text(p.status, 180, currentY);
          currentY += 8;
        });
      } 
      else if (reportId === "rep-tenants") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Tenant Masterlist & Records", 14, currentY);
        currentY += 10;

        const tenants = await prisma.tenant.findMany({
          where: { id: { in: tenantIds } },
        });

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Pangalan", 14, currentY);
        doc.text("Email", 80, currentY);
        doc.text("Phone", 150, currentY);
        currentY += 6;

        doc.setFont("helvetica", "normal");
        tenants.forEach((t) => {
          if (currentY > 270) { doc.addPage(); currentY = 20; }
          doc.text(t.fullName, 14, currentY);
          doc.text(t.email || "N/A", 80, currentY);
          doc.text(t.phone || "N/A", 150, currentY);
          currentY += 8;
        });
      }
      else if (reportId === "rep-unpaid") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Overdue & Balanse (Delinquency)", 14, currentY);
        currentY += 10;

        // INCLUDES OVERDUE, PENDING, UNPAID BALANCES
        const overdueBills = await prisma.bill.findMany({
          where: {
            tenantId: { in: tenantIds },
            status: { in: ["pending", "overdue", "draft"] },
          },
          include: { tenant: true },
        });

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Tenant", 14, currentY);
        doc.text("Amount", 90, currentY);
        doc.text("Status", 130, currentY);
        doc.text("Due Date", 170, currentY);
        currentY += 6;

        doc.setFont("helvetica", "normal");
        overdueBills.forEach((b) => {
          if (currentY > 270) { doc.addPage(); currentY = 20; }
          doc.text(b.tenant?.fullName || "N/A", 14, currentY);
          doc.text(`PHP ${Number(b.totalAmount || 0).toLocaleString()}`, 90, currentY);
          doc.text(b.status, 130, currentY);
          doc.text(b.dueDate ? new Date(b.dueDate).toLocaleDateString("fil-PH") : "N/A", 170, currentY);
          currentY += 8;
        });
      }
      else if (reportId === "rep-utilities") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Sub-meter & Utility Readings", 14, currentY);
        currentY += 10;

        const billItems = await prisma.billItem.findMany({
          where: {
            bill: { tenantId: { in: tenantIds } },
          },
          include: { bill: { include: { tenant: true } } },
        });

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Tenant", 14, currentY);
        doc.text("Utility Type", 80, currentY);
        doc.text("Current Reading", 130, currentY);
        doc.text("Amount", 175, currentY);
        currentY += 6;

        doc.setFont("helvetica", "normal");
        billItems.forEach((item) => {
          if (currentY > 270) { doc.addPage(); currentY = 20; }
          doc.text(item.bill?.tenant?.fullName || "N/A", 14, currentY);
          doc.text(item.type, 80, currentY);
          doc.text(String(item.currentReading || 0), 130, currentY);
          doc.text(`PHP ${Number(item.amount || 0).toLocaleString()}`, 175, currentY);
          currentY += 8;
        });
      }
      else if (reportId === "rep-occupancy") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Occupancy & Vacancy Report", 14, currentY);
        currentY += 10;

        // Kunin ang lahat ng rooms at units (Occupied + Vacant / Bedspace)
        const rooms = await prisma.room.findMany({
          where: { unit: { propertyId: { in: propertyIds } } },
          include: { unit: true },
        });

        const units = await prisma.unit.findMany({
          where: { propertyId: { in: propertyIds } },
          include: { rooms: true },
        });

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Room / Unit", 14, currentY);
        doc.text("Property Unit", 70, currentY);
        doc.text("Status", 130, currentY);
        doc.text("Monthly Rent", 170, currentY);
        currentY += 6;

        doc.setFont("helvetica", "normal");

        // Display Rooms
        rooms.forEach((r) => {
          if (currentY > 270) { doc.addPage(); currentY = 20; }
          doc.text(`Room ${r.roomNumber}`, 14, currentY);
          doc.text(r.unit.name, 70, currentY);
          doc.text(r.status || "Vacant", 130, currentY);
          doc.text(`PHP ${Number(r.monthlyRent || 0).toLocaleString()}`, 170, currentY);
          currentY += 8;
        });

        // Display Direct Units (kung walang sub-rooms / whole unit rental o vacant)
        units.filter((u) => u.rooms.length === 0).forEach((u) => {
          if (currentY > 270) { doc.addPage(); currentY = 20; }
          doc.text(`Unit: ${u.name}`, 14, currentY);
          doc.text(u.name, 70, currentY);
          doc.text(u.status || "Vacant", 130, currentY);
          doc.text(`PHP ${Number(u.monthlyRent || 0).toLocaleString()}`, 170, currentY);
          currentY += 8;
        });
      }
      else if (reportId === "rep-expenses") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Maintenance & Expenses Log", 14, currentY);
        currentY += 10;

        const expenses = await prisma.maintenanceRequest.findMany({
          where: propertyRelationFilter,
        });

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Title", 14, currentY);
        doc.text("Category", 90, currentY);
        doc.text("Status", 140, currentY);
        doc.text("Expenses", 175, currentY);
        currentY += 6;

        doc.setFont("helvetica", "normal");
        expenses.forEach((e) => {
          if (currentY > 270) { doc.addPage(); currentY = 20; }
          doc.text(e.title.substring(0, 25), 14, currentY);
          doc.text(e.category, 90, currentY);
          doc.text(e.status, 140, currentY);
          doc.text(`PHP ${Number(e.expenses || 0).toLocaleString()}`, 175, currentY);
          currentY += 8;
        });
      }

      const pdfOutput = doc.output("arraybuffer");
      fileBuffer = Buffer.from(pdfOutput);
    } 
    else if (lowerFormat === "xlsx" || lowerFormat === "csv") {
      mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      fileExtension = "xlsx";

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Report Data");

      if (reportId === "rep-income") {
        // PAID ONLY
        const payments = await prisma.bill.findMany({
          where: {
            tenantId: { in: tenantIds },
            status: { in: ["paid"] },
          },
          include: { tenant: true },
        });

        sheet.columns = [
          { header: "Billing ID", key: "id", width: 30 },
          { header: "Tenant", key: "tenant", width: 25 },
          { header: "Total Amount", key: "amount", width: 15 },
          { header: "Status", key: "status", width: 15 },
          { header: "Due Date", key: "dueDate", width: 15 },
        ];

        payments.forEach((p) => {
          sheet.addRow({
            id: p.id,
            tenant: p.tenant?.fullName || "N/A",
            amount: Number(p.totalAmount || 0),
            status: p.status,
            dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split("T")[0] : "N/A",
          });
        });
      } 
      else if (reportId === "rep-tenants") {
        const tenants = await prisma.tenant.findMany({
          where: { id: { in: tenantIds } },
        });

        sheet.columns = [
          { header: "Tenant ID", key: "id", width: 30 },
          { header: "Full Name", key: "fullName", width: 25 },
          { header: "Email", key: "email", width: 25 },
          { header: "Phone", key: "phone", width: 15 },
          { header: "Emergency Contact", key: "ecName", width: 25 },
        ];

        tenants.forEach((t) => {
          sheet.addRow({
            id: t.id,
            fullName: t.fullName,
            email: t.email || "N/A",
            phone: t.phone || "N/A",
            ecName: t.emergencyContactName || "N/A",
          });
        });
      }
      else if (reportId === "rep-unpaid") {
        // OVERDUE, PENDING, UNPAID BALANCES
        const overdueBills = await prisma.bill.findMany({
          where: {
            tenantId: { in: tenantIds },
            status: { in: ["pending", "overdue", "draft"] },
          },
          include: { tenant: true },
        });

        sheet.columns = [
          { header: "Bill ID", key: "id", width: 30 },
          { header: "Tenant", key: "tenant", width: 25 },
          { header: "Total Amount", key: "amount", width: 15 },
          { header: "Status", key: "status", width: 15 },
          { header: "Due Date", key: "dueDate", width: 15 },
        ];

        overdueBills.forEach((b) => {
          sheet.addRow({
            id: b.id,
            tenant: b.tenant?.fullName || "N/A",
            amount: Number(b.totalAmount || 0),
            status: b.status,
            dueDate: b.dueDate ? new Date(b.dueDate).toISOString().split("T")[0] : "N/A",
          });
        });
      }
      else if (reportId === "rep-utilities") {
        const billItems = await prisma.billItem.findMany({
          where: {
            bill: { tenantId: { in: tenantIds } },
          },
          include: { bill: { include: { tenant: true } } },
        });

        sheet.columns = [
          { header: "Tenant", key: "tenant", width: 25 },
          { header: "Utility Type", key: "type", width: 15 },
          { header: "Previous Reading", key: "prev", width: 15 },
          { header: "Current Reading", key: "curr", width: 15 },
          { header: "Amount", key: "amount", width: 15 },
        ];

        billItems.forEach((item) => {
          sheet.addRow({
            tenant: item.bill?.tenant?.fullName || "N/A",
            type: item.type,
            prev: Number(item.previousReading || 0),
            curr: Number(item.currentReading || 0),
            amount: Number(item.amount || 0),
          });
        });
      }
      else if (reportId === "rep-occupancy") {
        const rooms = await prisma.room.findMany({
          where: { unit: { propertyId: { in: propertyIds } } },
          include: { unit: true },
        });

        const units = await prisma.unit.findMany({
          where: { propertyId: { in: propertyIds } },
          include: { rooms: true },
        });

        sheet.columns = [
          { header: "Room / Unit Number", key: "roomNumber", width: 20 },
          { header: "Unit Name", key: "unit", width: 25 },
          { header: "Status", key: "status", width: 15 },
          { header: "Monthly Rent", key: "rent", width: 15 },
        ];

        rooms.forEach((r) => {
          sheet.addRow({
            roomNumber: `Room ${r.roomNumber}`,
            unit: r.unit.name,
            status: r.status || "Vacant",
            rent: Number(r.monthlyRent || 0),
          });
        });

        units.filter((u) => u.rooms.length === 0).forEach((u) => {
          sheet.addRow({
            roomNumber: `Unit: ${u.name}`,
            unit: u.name,
            status: u.status || "Vacant",
            rent: Number(u.monthlyRent || 0),
          });
        });
      }
      else if (reportId === "rep-expenses") {
        const expenses = await prisma.maintenanceRequest.findMany({
          where: propertyRelationFilter,
        });

        sheet.columns = [
          { header: "Request ID", key: "id", width: 30 },
          { header: "Title", key: "title", width: 25 },
          { header: "Category", key: "category", width: 15 },
          { header: "Status", key: "status", width: 15 },
          { header: "Expenses", key: "expenses", width: 15 },
        ];

        expenses.forEach((e) => {
          sheet.addRow({
            id: e.id,
            title: e.title,
            category: e.category,
            status: e.status,
            expenses: Number(e.expenses || 0),
          });
        });
      }

      const uint8Array = await workbook.xlsx.writeBuffer();
      fileBuffer = Buffer.from(uint8Array);
    } 
    else {
      fileBuffer = Buffer.from(`Ulat: ${reportId}\nPetsa: ${new Date().toISOString()}`);
      mimeType = "text/plain";
      fileExtension = "txt";
    }

    const base64Data = fileBuffer.toString("base64");

    return { 
      success: true, 
      fileName: `${reportId}-${new Date().toISOString().split("T")[0]}.${fileExtension}`,
      fileData: base64Data,
      mimeType,
      message: `Matagumpay na naihanda ang ulat sa format na ${format.toUpperCase()}.`
    };
  } catch (error) {
    console.error("Error generating report:", error);
    return { success: false, error: "Nagkaroon ng problema sa pag-generate ng ulat." };
  }
}

export async function generateAllReportsAction(format: unknown) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const formatStr = typeof format === "string" ? format : "pdf";
    const lowerFormat = formatStr.toLowerCase();
    const reportIds = [
      "rep-income",
      "rep-tenants",
      "rep-unpaid",
      "rep-utilities",
      "rep-occupancy",
      "rep-expenses",
    ];

    const zip = new AdmZip();

    // 1. Kunin ang Landlord Properties & Tenant IDs (Dual-Layer Match)
    const landlordProperties = await prisma.property.findMany({
      where: { landlordId: userId },
      select: { id: true },
    });
    const propertyIds = landlordProperties.map((p) => p.id);

    const directTenants = await prisma.tenant.findMany({
      where: { userId },
      select: { id: true },
    });

    const leaseTenants = await prisma.tenant.findMany({
      where: {
        leases: {
          some: {
            OR: [
              { unit: { propertyId: { in: propertyIds } } },
              { room: { unit: { propertyId: { in: propertyIds } } } },
            ],
          },
        },
      },
      select: { id: true },
    });

    const tenantIds = Array.from(
      new Set([
        ...directTenants.map((t) => t.id),
        ...leaseTenants.map((t) => t.id),
      ])
    );

    // Filter helper para sa Direct Lease / Property Relations
    const propertyRelationFilter = {
      OR: [
        { room: { unit: { propertyId: { in: propertyIds } } } },
        { unit: { propertyId: { in: propertyIds } } },
      ],
    };

    for (const reportId of reportIds) {
      let fileBuffer: Buffer;
      let fileExtension = lowerFormat;

      if (lowerFormat === "pdf") {
        fileExtension = "pdf";
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Paupahan System Report", 14, 20);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          `Report ID: ${reportId} | Petsa: ${new Date().toLocaleDateString("fil-PH")}`,
          14,
          28
        );

        let currentY = 40;

        if (reportId === "rep-income") {
          doc.setFont("helvetica", "bold");
          doc.text("Financial & Income Statement", 14, currentY);
          currentY += 8;

          // PAID ONLY
          const payments = await prisma.bill.findMany({
            where: {
              tenantId: { in: tenantIds },
              status: { in: ["paid"] },
            },
            include: { tenant: true },
          });

          doc.setFont("helvetica", "normal");
          payments.forEach((p) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(
              `${p.tenant?.fullName || "N/A"} - PHP ${Number(p.totalAmount || 0).toLocaleString()} (${p.status})`,
              14,
              currentY
            );
            currentY += 7;
          });
        } 
        else if (reportId === "rep-tenants") {
          doc.setFont("helvetica", "bold");
          doc.text("Tenant Masterlist & Records", 14, currentY);
          currentY += 8;

          const tenants = await prisma.tenant.findMany({
            where: { id: { in: tenantIds } },
          });

          doc.setFont("helvetica", "normal");
          tenants.forEach((t) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(
              `${t.fullName} | ${t.email || "N/A"} | ${t.phone || "N/A"}`,
              14,
              currentY
            );
            currentY += 7;
          });
        }
        else if (reportId === "rep-unpaid") {
          doc.setFont("helvetica", "bold");
          doc.text("Overdue & Balanse (Delinquency)", 14, currentY);
          currentY += 8;

          // OVERDUE, PENDING, & UNPAID
          const overdueBills = await prisma.bill.findMany({
            where: {
              tenantId: { in: tenantIds },
              status: { in: ["pending", "overdue", "draft"] },
            },
            include: { tenant: true },
          });

          doc.setFont("helvetica", "normal");
          overdueBills.forEach((b) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            const dateStr = b.dueDate
              ? new Date(b.dueDate).toLocaleDateString("fil-PH")
              : "N/A";
            doc.text(
              `${b.tenant?.fullName || "N/A"} - PHP ${Number(b.totalAmount || 0).toLocaleString()} | Status: ${b.status} (Due: ${dateStr})`,
              14,
              currentY
            );
            currentY += 7;
          });
        }
        else if (reportId === "rep-utilities") {
          doc.setFont("helvetica", "bold");
          doc.text("Sub-meter & Utility Readings", 14, currentY);
          currentY += 8;

          const billItems = await prisma.billItem.findMany({
            where: { bill: { tenantId: { in: tenantIds } } },
            include: { bill: { include: { tenant: true } } },
          });

          doc.setFont("helvetica", "normal");
          billItems.forEach((item) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(
              `${item.bill?.tenant?.fullName || "N/A"} - ${item.type}: ${item.currentReading || 0} (PHP ${Number(item.amount || 0).toLocaleString()})`,
              14,
              currentY
            );
            currentY += 7;
          });
        }
        else if (reportId === "rep-occupancy") {
          doc.setFont("helvetica", "bold");
          doc.text("Occupancy & Vacancy Report", 14, currentY);
          currentY += 8;

          const rooms = await prisma.room.findMany({
            where: { unit: { propertyId: { in: propertyIds } } },
            include: { unit: true },
          });

          const units = await prisma.unit.findMany({
            where: { propertyId: { in: propertyIds } },
            include: { rooms: true },
          });

          doc.setFont("helvetica", "normal");

          // Display Rooms
          rooms.forEach((r) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(
              `Room ${r.roomNumber} (${r.unit.name}) - ${r.status || "Vacant"} - PHP ${Number(r.monthlyRent || 0).toLocaleString()}`,
              14,
              currentY
            );
            currentY += 7;
          });

          // Display Direct Units (kung walang rooms / whole unit rental o vacant)
          units.filter((u) => u.rooms.length === 0).forEach((u) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(
              `Unit: ${u.name} - ${u.status || "Vacant"} - PHP ${Number(u.monthlyRent || 0).toLocaleString()}`,
              14,
              currentY
            );
            currentY += 7;
          });
        }
        else if (reportId === "rep-expenses") {
          doc.setFont("helvetica", "bold");
          doc.text("Maintenance & Expenses Log", 14, currentY);
          currentY += 8;

          const expenses = await prisma.maintenanceRequest.findMany({
            where: propertyRelationFilter,
          });

          doc.setFont("helvetica", "normal");
          expenses.forEach((e) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(
              `${e.title} [${e.category}] - ${e.status} - PHP ${Number(e.expenses || 0).toLocaleString()}`,
              14,
              currentY
            );
            currentY += 7;
          });
        }

        fileBuffer = Buffer.from(doc.output("arraybuffer"));
      } 
      else {
        fileExtension = "xlsx";
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Report Data");

        if (reportId === "rep-income") {
          // PAID ONLY
          const payments = await prisma.bill.findMany({
            where: {
              tenantId: { in: tenantIds },
              status: { in: ["paid"] },
            },
            include: { tenant: true },
          });

          sheet.columns = [
            { header: "Billing ID", key: "id", width: 30 },
            { header: "Tenant", key: "tenant", width: 25 },
            { header: "Total Amount", key: "amount", width: 15 },
            { header: "Status", key: "status", width: 15 },
          ];

          payments.forEach((p) => {
            sheet.addRow({
              id: p.id,
              tenant: p.tenant?.fullName || "N/A",
              amount: Number(p.totalAmount || 0),
              status: p.status,
            });
          });
        } 
        else if (reportId === "rep-tenants") {
          const tenants = await prisma.tenant.findMany({
            where: { id: { in: tenantIds } },
          });

          sheet.columns = [
            { header: "Full Name", key: "fullName", width: 25 },
            { header: "Email", key: "email", width: 25 },
            { header: "Phone", key: "phone", width: 15 },
          ];

          tenants.forEach((t) => {
            sheet.addRow({
              fullName: t.fullName,
              email: t.email || "N/A",
              phone: t.phone || "N/A",
            });
          });
        }
        else if (reportId === "rep-unpaid") {
          // OVERDUE, PENDING, & UNPAID
          const overdueBills = await prisma.bill.findMany({
            where: {
              tenantId: { in: tenantIds },
              status: { in: ["pending", "overdue", "draft"] },
            },
            include: { tenant: true },
          });

          sheet.columns = [
            { header: "Tenant", key: "tenant", width: 25 },
            { header: "Total Amount", key: "amount", width: 15 },
            { header: "Status", key: "status", width: 15 },
            { header: "Due Date", key: "dueDate", width: 15 },
          ];

          overdueBills.forEach((b) => {
            sheet.addRow({
              tenant: b.tenant?.fullName || "N/A",
              amount: Number(b.totalAmount || 0),
              status: b.status,
              dueDate: b.dueDate
                ? new Date(b.dueDate).toISOString().split("T")[0]
                : "N/A",
            });
          });
        }
        else if (reportId === "rep-utilities") {
          const billItems = await prisma.billItem.findMany({
            where: { bill: { tenantId: { in: tenantIds } } },
            include: { bill: { include: { tenant: true } } },
          });

          sheet.columns = [
            { header: "Tenant", key: "tenant", width: 25 },
            { header: "Utility Type", key: "type", width: 15 },
            { header: "Current Reading", key: "curr", width: 15 },
            { header: "Amount", key: "amount", width: 15 },
          ];

          billItems.forEach((item) => {
            sheet.addRow({
              tenant: item.bill?.tenant?.fullName || "N/A",
              type: item.type,
              curr: Number(item.currentReading || 0),
              amount: Number(item.amount || 0),
            });
          });
        }
        else if (reportId === "rep-occupancy") {
          const rooms = await prisma.room.findMany({
            where: { unit: { propertyId: { in: propertyIds } } },
            include: { unit: true },
          });

          const units = await prisma.unit.findMany({
            where: { propertyId: { in: propertyIds } },
            include: { rooms: true },
          });

          sheet.columns = [
            { header: "Room / Unit Number", key: "roomNumber", width: 20 },
            { header: "Unit Name", key: "unit", width: 25 },
            { header: "Status", key: "status", width: 15 },
            { header: "Monthly Rent", key: "rent", width: 15 },
          ];

          rooms.forEach((r) => {
            sheet.addRow({
              roomNumber: `Room ${r.roomNumber}`,
              unit: r.unit.name,
              status: r.status || "Vacant",
              rent: Number(r.monthlyRent || 0),
            });
          });

          units.filter((u) => u.rooms.length === 0).forEach((u) => {
            sheet.addRow({
              roomNumber: `Unit: ${u.name}`,
              unit: u.name,
              status: u.status || "Vacant",
              rent: Number(u.monthlyRent || 0),
            });
          });
        }
        else if (reportId === "rep-expenses") {
          const expenses = await prisma.maintenanceRequest.findMany({
            where: propertyRelationFilter,
          });

          sheet.columns = [
            { header: "Title", key: "title", width: 25 },
            { header: "Category", key: "category", width: 15 },
            { header: "Status", key: "status", width: 15 },
            { header: "Expenses", key: "expenses", width: 15 },
          ];

          expenses.forEach((e) => {
            sheet.addRow({
              title: e.title,
              category: e.category,
              status: e.status,
              expenses: Number(e.expenses || 0),
            });
          });
        }

        const uint8Array = await workbook.xlsx.writeBuffer();
        fileBuffer = Buffer.from(uint8Array);
      }

      zip.addFile(
        `${reportId}-${new Date().toISOString().split("T")[0]}.${fileExtension}`,
        fileBuffer
      );
    }

    const zipBuffer = zip.toBuffer();
    const base64Data = zipBuffer.toString("base64");

    return {
      success: true,
      fileName: `lahat-ng-ulat-${new Date().toISOString().split("T")[0]}.zip`,
      fileData: base64Data,
      mimeType: "application/zip",
      message: "Matagumpay na naihanda ang lahat ng ulat na may kumpletong laman.",
    };
  } catch (error) {
    console.error("Error generating all reports:", error);
    return {
      success: false,
      error: "Nagkaroon ng problema sa pag-generate ng lahat ng ulat.",
    };
  }
}