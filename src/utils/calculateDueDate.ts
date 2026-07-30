// src/utils/calculateTenantDueDate.ts

interface LeaseData {
    dueDate?: number | string | null;
    dueDay?: number | string | null;
    movedInDate?: string | Date | null;
    startDate?: string | Date | null;
}

export function calculateTenantDueDate(lease?: LeaseData | null): string {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1; // Default sa kasalukuyang buwan
    let dueDayNum = 1;

    if (lease) {
        const startDateVal = lease.movedInDate || lease.startDate;

        // 1. Kunin ang tamang araw (Day of the month, hal. 27)
        if (lease.dueDate) {
            const parsed = parseInt(String(lease.dueDate), 10);
            if (!isNaN(parsed)) dueDayNum = parsed;
        } else if (lease.dueDay) {
            const parsed = parseInt(String(lease.dueDay), 10);
            if (!isNaN(parsed)) dueDayNum = parsed;
        } else if (startDateVal) {
            const start = new Date(startDateVal);
            if (!isNaN(start.getTime())) {
                dueDayNum = start.getDate(); // Nakukuha ang 27 mula sa July 27
            }
        }

        // 2. Kalkulahin ang tamang taon at susunod na buwan (Advance Rent rule)
        if (startDateVal) {
            const moveInDateObj = new Date(startDateVal);
            if (!isNaN(moveInDateObj.getTime())) {
                year = moveInDateObj.getFullYear();

                // Kunin ang buwan ng move-in at gawing susunod na buwan (+1 para sa sunod na buwan)
                // Halimbawa: July (7) + 1 = August (8)
                month = moveInDateObj.getMonth() + 2;

                // Kung ang move-in ay nakaraan pang mga buwan (luma na ang lease at huli na sa billing),
                // maaari mong ibase sa kasalukuyang buwan ngayon. Pero kung bago pa lang o para sa susunod na cycle:
                // Kung gusto mo laging sumunod na buwan mula ngayon kung lampas na ang move-in:
                if (moveInDateObj < now) {
                    // Kung lumipas na ang petsa ngayong buwan, ang due date ay kasalukuyang buwan o susunod na buwan
                    month = now.getMonth() + 1;
                    year = now.getFullYear();

                    // Kung lumampas na ang araw ng due date ngayong buwan, i-move sa susunod na buwan
                    if (now.getDate() > dueDayNum) {
                        month += 1;
                    }
                }
            } else {
                month = now.getMonth() + 2;
            }
        } else {
            month = now.getMonth() + 2;
        }
    } else {
        month = now.getMonth() + 2;
    }

    // Ayusin kung lumampas ng Disyembre (Month 12)
    if (month > 12) {
        month = 1;
        year += 1;
    }

    // 3. Siguruhing ligtas ang araw (iwas overflow kung 31 ang petsa pero 30 days lang ang buwan)
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const safeDay = Math.min(dueDayNum, lastDayOfMonth);

    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(safeDay).padStart(2, '0');

    return `${year}-${formattedMonth}-${formattedDay}`;
}