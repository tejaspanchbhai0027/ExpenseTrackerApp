let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let walletTotal = parseFloat(localStorage.getItem("walletTotal")) || 0;

function setWallet() {
  const walletInput = parseFloat(document.getElementById("wallet-input").value);
  if (isNaN(walletInput) || walletInput <= 0) {
    alert("Enter a valid wallet amount.");
    return;
  }
  walletTotal = walletInput;
  localStorage.setItem("walletTotal", walletTotal);
  updateUI();
}

function addExpense() {
  const desc = document.getElementById("description").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const date = document.getElementById("date").value;
  const location = document.getElementById("location").value;

  if (!desc || isNaN(amount) || amount <= 0 || !date || !location) {
    alert("Please fill all fields correctly.");
    return;
  }

  expenses.push({ description: desc, amount, date, location });
  localStorage.setItem("expenses", JSON.stringify(expenses));

  document.getElementById("description").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("date").value = "";
  document.getElementById("location").value = "";

  updateUI();
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateUI();
}

function updateUI() {
  const tableBody = document.getElementById("transaction-list");
  const totalGroupDisplay = document.getElementById("total-group");
  const totalPersonDisplay = document.getElementById("total-person");
  const dailySummaryList = document.getElementById("daily-summary");
  const locationSummaryList = document.getElementById("location-summary");
  const walletTotalDisplay = document.getElementById("wallet-total");
  const walletRemainingDisplay = document.getElementById("wallet-remaining");

  tableBody.innerHTML = "";
  dailySummaryList.innerHTML = "";
  locationSummaryList.innerHTML = "";

  const dailyGroups = {};
  const locationGroups = {};
  let totalGroup = 0;

  expenses.forEach((exp, index) => {
    if (!dailyGroups[exp.date]) dailyGroups[exp.date] = [];
    dailyGroups[exp.date].push({ ...exp, index });

    if (!locationGroups[exp.location]) locationGroups[exp.location] = 0;
    locationGroups[exp.location] += exp.amount;

    totalGroup += exp.amount;
  });

  let totalPerPerson = totalGroup / 2;

  for (const date in dailyGroups) {
    const group = dailyGroups[date];
    const groupTotal = group.reduce((sum, e) => sum + e.amount, 0);
    const perPerson = groupTotal / 2;
    const uniqueLocations = [...new Set(group.map(e => e.location))].join(", ");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${date}</td>
      <td>${uniqueLocations}</td>
      <td>₹${perPerson.toFixed(2)}</td>
      <td>₹${groupTotal.toFixed(2)}</td>
      <td>
        ${group.map(e => `
          <div>
            ${e.description} - ₹${e.amount}
            <button class="delete-btn" onclick="deleteExpense(${e.index})">Delete</button>
          </div>
        `).join('')}
      </td>
    `;
    tableBody.appendChild(tr);

    const li = document.createElement("li");
    li.textContent = `${date}: Per Person = ₹${perPerson.toFixed(2)} | Group = ₹${groupTotal.toFixed(2)}`;
    dailySummaryList.appendChild(li);
  }

  for (const location in locationGroups) {
    const li = document.createElement("li");
    li.textContent = `${location}: ₹${locationGroups[location].toFixed(2)}`;
    locationSummaryList.appendChild(li);
  }

  walletTotalDisplay.innerText = walletTotal.toFixed(2);
  walletRemainingDisplay.innerText = (walletTotal - totalGroup).toFixed(2);
  totalGroupDisplay.innerText = totalGroup.toFixed(2);
  totalPersonDisplay.innerText = totalPerPerson.toFixed(2);
}

function exportToCSV() {
  // CSV header
  let csv = "Date,Location,Description,Amount\n";

  // Loop through each expense and format line
  expenses.forEach(exp => {
    // Ensure fields are not undefined/null and safely formatted
    const date = exp.date || "N/A";
    const location = `"${(exp.location || "").replace(/"/g, '""')}"`;
    const description = `"${(exp.description || "").replace(/"/g, '""')}"`;
    const amount = exp.amount || 0;

    // Append the formatted line to CSV
    csv += `${date},${location},${description},${amount}\n`;
  });

  // Create a Blob for the CSV file
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  // Generate a downloadable URL
  const url = URL.createObjectURL(blob);

  // Create a hidden anchor element to trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = "group-expenses.csv";
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
}
updateUI();
