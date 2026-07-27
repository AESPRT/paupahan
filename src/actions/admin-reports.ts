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

    // 💡 Kunin ang parehong Rooms at Units para sa Occupancy at Bilang
    const units = await prisma.unit.findMany({
      where: { property: { landlordId: userId } },
      include: {
        rooms: {
          include: {
            leases: { where: { status: "active" } },
          },
        },
        leases: { where: { status: "active" } }, // Para sa unit-level leases
      },
    });

    let totalRoomsOrUnits = 0;
    let occupiedCount = 0;

    units.forEach((unit) => {
      if (unit.rooms && unit.rooms.length > 0) {
        unit.rooms.forEach((room) => {
          totalRoomsOrUnits++;
          if ((room.leases && room.leases.length > 0) || room.status === "occupied") {
            occupiedCount++;
          }
        });
      } else {
        totalRoomsOrUnits++;
        if (unit.leases && unit.leases.length > 0) {
          occupiedCount++;
        }
      }
    });

    const occupancyRate = totalRoomsOrUnits > 0 ? Math.round((occupiedCount / totalRoomsOrUnits) * 100) : 0;

    // 💡 Ayusin ang query para sa Payments / Bills (suportahan ang Room at Unit level lease)
    const payments = await prisma.bill.findMany({
      where: {
        lease: {
          OR: [
            { room: { unit: { property: { landlordId: userId } } } },
            { unit: { property: { landlordId: userId } } },
          ],
        },
        status: "paid",
      },
    });

    const totalRevenue = payments.reduce((acc, bill) => acc + Number(bill.totalAmount || 0), 0);

    const maintenanceExpenses = await prisma.maintenanceRequest.findMany({
      where: {
        OR: [
          { room: { unit: { property: { landlordId: userId } } } },
          { unit: { property: { landlordId: userId } } },
        ],
      },
      select: { expenses: true },
    });

    const totalExpenses = maintenanceExpenses.reduce(
      (acc, req) => acc + Number(req.expenses || 0), 
      0
    );

    const netIncome = totalRevenue - totalExpenses;

    const financialSummary = {
      period: new Date().toLocaleString("fil-PH", { month: "long", year: "numeric" }),
      totalRevenue,
      totalExpenses,
      netIncome,
      occupancyRate,
    };

    const totalTenants = await prisma.tenant.count({
      where: {
        leases: {
          some: {
            OR: [
              { room: { unit: { property: { landlordId: userId } } } },
              { unit: { property: { landlordId: userId } } },
            ],
          },
        },
      },
    });

    const overdueBillsCount = await prisma.bill.count({
      where: {
        lease: {
          OR: [
            { room: { unit: { property: { landlordId: userId } } } },
            { unit: { property: { landlordId: userId } } },
          ],
        },
        status: "overdue",
      },
    });

    const maintenanceCount = await prisma.maintenanceRequest.count({
      where: {
        OR: [
          { room: { unit: { property: { landlordId: userId } } } },
          { unit: { property: { landlordId: userId } } },
        ],
      },
    });

    const reportsList = [
      {
        id: "rep-income",
        title: "Financial & Income Statement",
        description: "Buong ulat ng koleksyon ng renta, utilities, at natanggap na bayad sa napiling buwan.",
        lastGenerated: "Ngayon",
        fileSize: `${(payments.length * 0.1 + 0.8).toFixed(1)} MB`,
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

    // Helper condition para sa landlord filter
    const landlordFilter = {
      OR: [
        { room: { unit: { property: { landlordId: userId } } } },
        { unit: { property: { landlordId: userId } } },
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

        const payments = await prisma.bill.findMany({
          where: { lease: landlordFilter },
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
          doc.text(`PHP ${Number(p.totalAmount).toLocaleString()}`, 140, currentY);
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
          where: { leases: { some: landlordFilter } },
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

        const overdueBills = await prisma.bill.findMany({
          where: {
            lease: landlordFilter,
            status: "overdue",
          },
          include: { tenant: true },
        });

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Tenant", 14, currentY);
        doc.text("Amount", 90, currentY);
        doc.text("Due Date", 140, currentY);
        currentY += 6;

        doc.setFont("helvetica", "normal");
        overdueBills.forEach((b) => {
          if (currentY > 270) { doc.addPage(); currentY = 20; }
          doc.text(b.tenant?.fullName || "N/A", 14, currentY);
          doc.text(`PHP ${Number(b.totalAmount).toLocaleString()}`, 90, currentY);
          doc.text(new Date(b.dueDate).toLocaleDateString(), 140, currentY);
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
            bill: { lease: landlordFilter },
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
          doc.text(item.bill.tenant?.fullName || "N/A", 14, currentY);
          doc.text(item.type, 80, currentY);
          doc.text(String(item.currentReading || 0), 130, currentY);
          doc.text(`PHP ${Number(item.amount).toLocaleString()}`, 175, currentY);
          currentY += 8;
        });
      }
      else if (reportId === "rep-occupancy") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Occupancy & Vacancy Report", 14, currentY);
        currentY += 10;

        const rooms = await prisma.room.findMany({
          where: { unit: { property: { landlordId: userId } } },
          include: { unit: true },
        });

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Room Number", 14, currentY);
        doc.text("Unit", 70, currentY);
        doc.text("Status", 130, currentY);
        doc.text("Monthly Rent", 170, currentY);
        currentY += 6;

        doc.setFont("helvetica", "normal");
        rooms.forEach((r) => {
          if (currentY > 270) { doc.addPage(); currentY = 20; }
          doc.text(r.roomNumber, 14, currentY);
          doc.text(r.unit.name, 70, currentY);
          doc.text(r.status, 130, currentY);
          doc.text(`PHP ${Number(r.monthlyRent).toLocaleString()}`, 170, currentY);
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
          where: {
            OR: [
              { room: { unit: { property: { landlordId: userId } } } },
              { unit: { property: { landlordId: userId } } },
            ],
          },
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
        const payments = await prisma.bill.findMany({
          where: { lease: landlordFilter },
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
            amount: Number(p.totalAmount),
            status: p.status,
            dueDate: p.dueDate.toISOString().split("T")[0],
          });
        });
      } 
      else if (reportId === "rep-tenants") {
        const tenants = await prisma.tenant.findMany({
          where: { leases: { some: landlordFilter } },
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
        const overdueBills = await prisma.bill.findMany({
          where: {
            lease: landlordFilter,
            status: "overdue",
          },
          include: { tenant: true },
        });

        sheet.columns = [
          { header: "Bill ID", key: "id", width: 30 },
          { header: "Tenant", key: "tenant", width: 25 },
          { header: "Total Amount", key: "amount", width: 15 },
          { header: "Due Date", key: "dueDate", width: 15 },
        ];

        overdueBills.forEach((b) => {
          sheet.addRow({
            id: b.id,
            tenant: b.tenant?.fullName || "N/A",
            amount: Number(b.totalAmount),
            dueDate: b.dueDate.toISOString().split("T")[0],
          });
        });
      }
      else if (reportId === "rep-utilities") {
        const billItems = await prisma.billItem.findMany({
          where: {
            bill: { lease: landlordFilter },
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
            tenant: item.bill.tenant?.fullName || "N/A",
            type: item.type,
            prev: Number(item.previousReading || 0),
            curr: Number(item.currentReading || 0),
            amount: Number(item.amount),
          });
        });
      }
      else if (reportId === "rep-occupancy") {
        const rooms = await prisma.room.findMany({
          where: { unit: { property: { landlordId: userId } } },
          include: { unit: true },
        });

        sheet.columns = [
          { header: "Room Number", key: "roomNumber", width: 15 },
          { header: "Unit Name", key: "unit", width: 25 },
          { header: "Status", key: "status", width: 15 },
          { header: "Monthly Rent", key: "rent", width: 15 },
        ];

        rooms.forEach((r) => {
          sheet.addRow({
            roomNumber: r.roomNumber,
            unit: r.unit.name,
            status: r.status,
            rent: Number(r.monthlyRent),
          });
        });
      }
      else if (reportId === "rep-expenses") {
        const expenses = await prisma.maintenanceRequest.findMany({
          where: {
            OR: [
              { room: { unit: { property: { landlordId: userId } } } },
              { unit: { property: { landlordId: userId } } },
            ],
          },
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
  // Katulad ng ginawa sa itaas, ang mga filters ay maaari ding i-update gamit ang landlordFilter kung kinakailangan.
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const formatStr = typeof format === "string" ? format : "pdf";
    const lowerFormat = formatStr.toLowerCase();
    const reportIds = ["rep-income", "rep-tenants", "rep-unpaid", "rep-utilities", "rep-occupancy", "rep-expenses"];
    
    const zip = new AdmZip();
    const landlordFilter = {
      OR: [
        { room: { unit: { property: { landlordId: userId } } } },
        { unit: { property: { landlordId: userId } } },
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
        doc.text(`Report ID: ${reportId} | Petsa: ${new Date().toLocaleDateString("fil-PH")}`, 14, 28);

        let currentY = 40;

        if (reportId === "rep-income") {
          doc.setFont("helvetica", "bold");
          doc.text("Financial & Income Statement", 14, currentY);
          currentY += 8;
          const payments = await prisma.bill.findMany({
            where: { lease: landlordFilter },
            include: { tenant: true },
          });
          doc.setFont("helvetica", "normal");
          payments.forEach((p) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(`${p.tenant?.fullName || "N/A"} - PHP ${Number(p.totalAmount).toLocaleString()} (${p.status})`, 14, currentY);
            currentY += 7;
          });
        } 
        else if (reportId === "rep-tenants") {
          doc.setFont("helvetica", "bold");
          doc.text("Tenant Masterlist & Records", 14, currentY);
          currentY += 8;
          const tenants = await prisma.tenant.findMany({
            where: { leases: { some: landlordFilter } },
          });
          doc.setFont("helvetica", "normal");
          tenants.forEach((t) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(`${t.fullName} | ${t.email || "N/A"} | ${t.phone || "N/A"}`, 14, currentY);
            currentY += 7;
          });
        }
        else if (reportId === "rep-unpaid") {
          doc.setFont("helvetica", "bold");
          doc.text("Overdue & Balanse (Delinquency)", 14, currentY);
          currentY += 8;
          const overdueBills = await prisma.bill.findMany({
            where: { lease: landlordFilter, status: "overdue" },
            include: { tenant: true },
          });
          doc.setFont("helvetica", "normal");
          overdueBills.forEach((b) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(`${b.tenant?.fullName || "N/A"} - PHP ${Number(b.totalAmount).toLocaleString()} (Due: ${new Date(b.dueDate).toLocaleDateString()})`, 14, currentY);
            currentY += 7;
          });
        }
        else if (reportId === "rep-utilities") {
          doc.setFont("helvetica", "bold");
          doc.text("Sub-meter & Utility Readings", 14, currentY);
          currentY += 8;
          const billItems = await prisma.billItem.findMany({
            where: { bill: { lease: landlordFilter } },
            include: { bill: { include: { tenant: true } } },
          });
          doc.setFont("helvetica", "normal");
          billItems.forEach((item) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(`${item.bill.tenant?.fullName || "N/A"} - ${item.type}: ${item.currentReading || 0} (PHP ${Number(item.amount).toLocaleString()})`, 14, currentY);
            currentY += 7;
          });
        }
        else if (reportId === "rep-occupancy") {
          doc.setFont("helvetica", "bold");
          doc.text("Occupancy & Vacancy Report", 14, currentY);
          currentY += 8;
          const rooms = await prisma.room.findMany({
            where: { unit: { property: { landlordId: userId } } },
            include: { unit: true },
          });
          doc.setFont("helvetica", "normal");
          rooms.forEach((r) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(`Room ${r.roomNumber} (${r.unit.name}) - ${r.status} - PHP ${Number(r.monthlyRent).toLocaleString()}`, 14, currentY);
            currentY += 7;
          });
        }
        else if (reportId === "rep-expenses") {
          doc.setFont("helvetica", "bold");
          doc.text("Maintenance & Expenses Log", 14, currentY);
          currentY += 8;
          const expenses = await prisma.maintenanceRequest.findMany({
            where: landlordFilter,
          });
          doc.setFont("helvetica", "normal");
          expenses.forEach((e) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(`${e.title} [${e.category}] - ${e.status} - PHP ${Number(e.expenses || 0).toLocaleString()}`, 14, currentY);
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
          const payments = await prisma.bill.findMany({
            where: { lease: landlordFilter },
            include: { tenant: true },
          });
          sheet.columns = [
            { header: "Billing ID", key: "id", width: 30 },
            { header: "Tenant", key: "tenant", width: 25 },
            { header: "Total Amount", key: "amount", width: 15 },
            { header: "Status", key: "status", width: 15 },
          ];
          payments.forEach((p) => {
            sheet.addRow({ id: p.id, tenant: p.tenant?.fullName || "N/A", amount: Number(p.totalAmount), status: p.status });
          });
        } 
        else if (reportId === "rep-tenants") {
          const tenants = await prisma.tenant.findMany({
            where: { leases: { some: landlordFilter } },
          });
          sheet.columns = [
            { header: "Full Name", key: "fullName", width: 25 },
            { header: "Email", key: "email", width: 25 },
            { header: "Phone", key: "phone", width: 15 },
          ];
          tenants.forEach((t) => {
            sheet.addRow({ fullName: t.fullName, email: t.email || "N/A", phone: t.phone || "N/A" });
          });
        }
        else if (reportId === "rep-unpaid") {
          const overdueBills = await prisma.bill.findMany({
            where: { lease: landlordFilter, status: "overdue" },
            include: { tenant: true },
          });
          sheet.columns = [
            { header: "Tenant", key: "tenant", width: 25 },
            { header: "Total Amount", key: "amount", width: 15 },
            { header: "Due Date", key: "dueDate", width: 15 },
          ];
          overdueBills.forEach((b) => {
            sheet.addRow({ tenant: b.tenant?.fullName || "N/A", amount: Number(b.totalAmount), dueDate: b.dueDate.toISOString().split("T")[0] });
          });
        }
        else if (reportId === "rep-utilities") {
          const billItems = await prisma.billItem.findMany({
            where: { bill: { lease: landlordFilter } },
            include: { bill: { include: { tenant: true } } },
          });
          sheet.columns = [
            { header: "Tenant", key: "tenant", width: 25 },
            { header: "Utility Type", key: "type", width: 15 },
            { header: "Current Reading", key: "curr", width: 15 },
            { header: "Amount", key: "amount", width: 15 },
          ];
          billItems.forEach((item) => {
            sheet.addRow({ tenant: item.bill.tenant?.fullName || "N/A", type: item.type, curr: Number(item.currentReading || 0), amount: Number(item.amount) });
          });
        }
        else if (reportId === "rep-occupancy") {
          const rooms = await prisma.room.findMany({
            where: { unit: { property: { landlordId: userId } } },
            include: { unit: true },
          });
          sheet.columns = [
            { header: "Room Number", key: "roomNumber", width: 15 },
            { header: "Unit Name", key: "unit", width: 25 },
            { header: "Status", key: "status", width: 15 },
            { header: "Monthly Rent", key: "rent", width: 15 },
          ];
          rooms.forEach((r) => {
            sheet.addRow({ roomNumber: r.roomNumber, unit: r.unit.name, status: r.status, rent: Number(r.monthlyRent) });
          });
        }
        else if (reportId === "rep-expenses") {
          const expenses = await prisma.maintenanceRequest.findMany({
            where: landlordFilter,
          });
          sheet.columns = [
            { header: "Title", key: "title", width: 25 },
            { header: "Category", key: "category", width: 15 },
            { header: "Status", key: "status", width: 15 },
            { header: "Expenses", key: "expenses", width: 15 },
          ];
          expenses.forEach((e) => {
            sheet.addRow({ title: e.title, category: e.category, status: e.status, expenses: Number(e.expenses || 0) });
          });
        }

        const uint8Array = await workbook.xlsx.writeBuffer();
        fileBuffer = Buffer.from(uint8Array);
      }

      zip.addFile(`${reportId}-${new Date().toISOString().split("T")[0]}.${fileExtension}`, fileBuffer);
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
    return { success: false, error: "Nagkaroon ng problema sa pag-generate ng lahat ng ulat." };
  }
}