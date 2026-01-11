// Set role manually for now (will be set from login)
const currentRole = "manager"; // or "admin"

// Dummy backend data
const requests = [
    {
        brid: "BR1234",
        name: "Amit Sharma",
        email: "amit@company.com",
        items: ["VPN", "Git Access", "Database", "Admin Panel"],
        managerApproved: true
    },
    {
        brid: "BR5678",
        name: "Neha Singh",
        email: "neha@company.com",
        items: ["Server Access", "VPN", "Git"],
        managerApproved: false
    },
    {
        brid: "BR9999",
        name: "Rajat Patel",
        email: "rajat@company.com",
        items: ["Database", "Analytics Tool", "Admin Panel", "Git Access"],
        managerApproved: true
    }
];

const tableBody = document.getElementById("requestTable");

// Render UI
function renderTable() {
    tableBody.innerHTML = "";

    requests.forEach(req => {

        // Managers only see their pending approvals
        if (currentRole === "manager" && req.managerApproved) return;

        const row = document.createElement("tr");
        row.className = "border-b border-gray-200 hover:bg-gray-50 transition";

        row.innerHTML = `
            <td class="p-3">${req.brid}</td>
            <td class="p-3">${req.name}</td>
            <td class="p-3">${req.email}</td>

            <td class="p-3">
                <div class="flex flex-wrap gap-2">
                    ${req.items.map(item => `
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs shadow">
                            ${item}
                        </span>
                    `).join("")}
                </div>
            </td>

            <td class="p-3">
                <span class="px-3 py-1 rounded-full text-sm ${
                    req.managerApproved 
                    ? "bg-green-200 text-green-800"
                    : "bg-yellow-200 text-yellow-800"
                }">
                    ${req.managerApproved ? "Approved" : "Pending"}
                </span>
            </td>

            <td class="p-3 flex gap-2">
                <button class="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                    Approve
                </button>
                <button class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                    Reject
                </button>

                ${currentRole === "admin" ? `
                    <button onclick="generatePassword()" class="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                        Password
                    </button>
                ` : ""}
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Password generator
function generatePassword() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
        pwd += chars[Math.floor(Math.random() * chars.length)];
    }

    document.getElementById("generatedPassword").textContent = pwd;

    const modal = document.getElementById("passwordModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModal() {
    const modal = document.getElementById("passwordModal");
    modal.classList.remove("flex");
    modal.classList.add("hidden");
}

// Initial load
renderTable();
