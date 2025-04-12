"use strict";

// ========================
// CONFIGURATION
// ========================
const colors = {
  menuButtonBackgroundColor: "#00548e",
  menuButtonColor: "white",
  menuBackgroundColor: "white",
  menuBackgroundHoverColor: "#f1f1f1",
  menuItemColor: "black",
};

// ========================
// THIRD-PARTY LIBRARIES
// ========================
/**
 * Minified by jsDelivr using Terser v5.37.0.
 * Original file: /npm/prompts-js@0.0.4/index.js
 * https://github.com/simonw/prompts-js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
const Prompts = (function () {
  const e = {
      border: "none",
      borderRadius: "6px",
      padding: "20px",
      minWidth: "300px",
      maxWidth: "80%",
      boxSizing: "border-box",
      fontFamily: "sans-serif",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      background: "#fff",
    },
    n = {
      marginBottom: "20px",
      fontSize: "16px",
      color: "#333",
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
    },
    o = { textAlign: "right", marginTop: "20px" },
    t = {
      backgroundColor: colors.menuButtonBackgroundColor,
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      padding: "8px 12px",
      fontSize: "14px",
      cursor: "pointer",
      marginLeft: "8px",
    },
    d = { backgroundColor: "#6c757d" },
    r = {
      width: "100%",
      boxSizing: "border-box",
      padding: "8px",
      fontSize: "16px",
      marginBottom: "20px",
      borderRadius: "4px",
      border: "1px solid #ccc",
    };
  function a(e, n) {
    Object.assign(e.style, n);
  }
  function i(o) {
    const t = document.createElement("dialog");
    a(t, e),
      t.setAttribute("role", "dialog"),
      t.setAttribute("aria-modal", "true");
    const d = document.createElement("form");
    d.method = "dialog";
    const r = document.createElement("div");
    return (
      a(r, n),
      (r.textContent = o),
      d.appendChild(r),
      t.appendChild(d),
      { dialog: t, form: d }
    );
  }
  function c(e, n, o = {}, d = "submit") {
    const r = document.createElement("button");
    return (
      a(r, t), a(r, o), (r.type = d), (r.value = n), (r.textContent = e), r
    );
  }
  return {
    alert: async function (e) {
      return new Promise((n) => {
        const { dialog: t, form: d } = i(e),
          r = document.createElement("div");
        a(r, o);
        const p = c("OK", "ok");
        r.appendChild(p),
          d.appendChild(r),
          t.addEventListener("close", () => {
            n(), t.remove();
          }),
          document.body.appendChild(t),
          t.showModal(),
          p.focus();
      });
    },
    confirm: async function (e) {
      return new Promise((n) => {
        const { dialog: t, form: r } = i(e),
          p = document.createElement("div");
        a(p, o);
        const l = c("Cancel", "cancel", d),
          s = c("OK", "ok");
        p.appendChild(l),
          p.appendChild(s),
          r.appendChild(p),
          t.addEventListener("close", () => {
            const e = t.returnValue;
            n("ok" === e), t.remove();
          }),
          document.body.appendChild(t),
          t.showModal(),
          s.focus();
      });
    },
    prompt: async function (e) {
      return new Promise((n) => {
        const { dialog: t, form: p } = i(e),
          l = document.createElement("input");
        a(l, r), (l.type = "text"), (l.name = "promptInput"), p.appendChild(l);
        const s = document.createElement("div");
        a(s, o);
        const u = c("Cancel", "cancel", d, "button"),
          m = c("OK", "ok");
        s.appendChild(u),
          s.appendChild(m),
          p.appendChild(s),
          u.addEventListener("click", () => {
            t.close(null);
          }),
          t.addEventListener("close", () => {
            const e = "ok" === t.returnValue ? l.value : null;
            n(e), t.remove();
          }),
          document.body.appendChild(t),
          t.showModal(),
          l.focus();
      });
    },
  };
})();

// ========================
// UI COMPONENTS
// ========================
function createMenuItem(dropdownMenu, text, callback) {
  const menuItem = document.createElement("div");
  menuItem.className = "menuItem";
  menuItem.target = "_blank";
  menuItem.textContent = text;

  Object.assign(menuItem.style, {
    padding: "10px 20px",
    textDecoration: "none",
    color: colors.menuItemColor,
    display: "block",
    cursor: "pointer",
  });

  menuItem.addEventListener("mouseover", () => {
    menuItem.style.backgroundColor = colors.menuBackgroundHoverColor;
  });

  menuItem.addEventListener("mouseout", () => {
    menuItem.style.backgroundColor = colors.menuBackgroundColor;
  });

  if (callback) {
    menuItem.addEventListener("click", callback);
  }

  dropdownMenu.appendChild(menuItem);
}

function createMenuButtonAndContainer(buttonLabel) {
  try {
    const menuButton = document.createElement("button");
    menuButton.id = "menuButton";
    menuButton.textContent = buttonLabel;
    document.body.appendChild(menuButton);

    // Style the menu button
    Object.assign(menuButton.style, {
      position: "fixed",
      top: "90px",
      right: "10px",
      padding: "10px 20px",
      backgroundColor: colors.menuButtonBackgroundColor,
      color: colors.menuButtonColor,
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      zIndex: "99999",
    });

    // Create the dropdown menu container
    const dropdownMenu = document.createElement("div");
    dropdownMenu.id = "dropdownMenu";
    document.body.appendChild(dropdownMenu);

    // Style the dropdown menu
    Object.assign(dropdownMenu.style, {
      display: "none",
      position: "fixed",
      top: "130px",
      right: "10px",
      backgroundColor: colors.menuBackgroundColor,
      border: "1px solid #ccc",
      borderRadius: "5px",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
      zIndex: "99999",
    });

    // Close the dropdown if the user clicks outside of it
    window.addEventListener("click", function (event) {
      if (!event.target.matches(`#${menuButton.id}`)) {
        if (dropdownMenu.style.display === "block") {
          dropdownMenu.style.display = "none";
        }
      }
    });

    // Handle menu button click
    menuButton.addEventListener("click", function () {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    });

    return dropdownMenu;
  } catch (error) {
    console.error("Error creating menu:", error);
    return null;
  }
}

function createCopyIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.cursor = "pointer";

  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  const rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect1.setAttribute("x", "9");
  rect1.setAttribute("y", "9");
  rect1.setAttribute("width", "13");
  rect1.setAttribute("height", "13");
  rect1.setAttribute("rx", "2");
  rect1.setAttribute("ry", "2");
  svg.appendChild(rect1);

  const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line1.setAttribute("x1", "5");
  line1.setAttribute("y1", "5");
  line1.setAttribute("x2", "5");
  line1.setAttribute("y2", "18");
  line1.setAttribute("stroke", "currentColor");
  line1.setAttribute("stroke-width", "2");
  svg.appendChild(line1);

  const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line2.setAttribute("x1", "5");
  line2.setAttribute("y1", "5");
  line2.setAttribute("x2", "18");
  line2.setAttribute("y2", "5");
  line2.setAttribute("stroke", "currentColor");
  line2.setAttribute("stroke-width", "2");
  svg.appendChild(line2);

  return svg;
}

// ========================
// DATA HANDLING
// ========================
function getRowData(row) {
  try {
    const dateValue = row.querySelector("td.column-date")?.outerText || "";
    const description =
      row.querySelector("td.column-description")?.outerText || "";
    const amountElement = row.querySelector(
      "td.column-amount span.transaction-"
    );

    if (!dateValue || !description || !amountElement) {
      console.error("Missing elements in transaction row");
      return null;
    }

    const amount = amountElement.outerText;
    return {
      date: dateValue,
      description: description.replace(",", "").replace("\n", ""),
      amount: Number(amount.replace("$", "").replace(",", "")),
    };
  } catch (error) {
    console.error("Error parsing row data:", error);
    return null;
  }
}

function convertTransactionToTSV(transaction) {
  return `${transaction.date}\t${transaction.description}\t${transaction.amount}`;
}

function getAllRowsInPastTransactionTable() {
  try {
    return [
      ...document.querySelectorAll("#PastTransactionsGrid table tbody tr"),
    ];
  } catch (error) {
    console.error("Error getting transaction rows:", error);
    return [];
  }
}

function gatherDebitTransactionsInViewSortedByDate() {
  try {
    return getAllRowsInPastTransactionTable()
      .map((row) => getRowData(row))
      .filter((transaction) => transaction && transaction.amount < 0)
      .map((transaction) => ({
        ...transaction,
        amount: Math.abs(transaction.amount),
      }))
      .sort((a, b) => {
        const dateComparison = Date.parse(a.date) - Date.parse(b.date);
        return dateComparison === 0
          ? a.description.localeCompare(b.description)
          : dateComparison;
      });
  } catch (error) {
    console.error("Error gathering transactions:", error);
    return [];
  }
}

function getAvailableBalance() {
  try {
    const accountDetails = document.querySelector("div.account-details");
    if (!accountDetails) {
      throw new Error("Account details section not found");
    }

    const balanceRow = [...accountDetails.querySelectorAll(".row")].find(
      (row) =>
        row
          .querySelector(".detail-label-col span")
          ?.innerText.includes("Available Balance")
    );

    if (!balanceRow) {
      throw new Error("Available balance not found");
    }

    return balanceRow
      .querySelector(".detail-item-col span")
      .innerText.replace("$", "")
      .replace(",", "");
  } catch (error) {
    console.error("Error getting available balance:", error);
    Prompts.alert(`Error: ${error.message}`);
    return null;
  }
}

// ========================
// FEATURE FUNCTIONS
// ========================
function debitTransactionsWithDate() {
  try {
    Prompts.prompt("Enter start date (blank for today)").then(
      (selectedDate) => {
        const today = new Date().toLocaleDateString();
        const filterDate = selectedDate
          ? Date.parse(selectedDate)
          : Date.parse(today);
        filterDebitsByDate(filterDate);
      }
    );
  } catch (error) {
    console.error("Error in transaction date selection:", error);
    Prompts.alert("Error selecting date. Please try again.");
  }
}

function debitTransactionsFromYesterday() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    filterDebitsByDate(Date.parse(yesterday.toLocaleDateString()));
  } catch (error) {
    console.error("Error getting yesterday's transactions:", error);
    Prompts.alert("Error retrieving yesterday's transactions.");
  }
}

function debitTransactionsFromToday() {
  try {
    filterDebitsByDate(Date.parse(new Date().toLocaleDateString()));
  } catch (error) {
    console.error("Error getting today's transactions:", error);
    Prompts.alert("Error retrieving today's transactions.");
  }
}

function filterDebitsByDate(filterDate) {
  try {
    const transactions = gatherDebitTransactionsInViewSortedByDate()
      .filter((transaction) => Date.parse(transaction.date) >= filterDate)
      .map((t) => convertTransactionToTSV(t))
      .join("\n");

    if (!transactions) {
      Prompts.alert("No transactions found for the selected date range.");
      return;
    }

    navigator.clipboard
      .writeText(transactions)
      .then(() => Prompts.alert("Transactions copied to clipboard"))
      .catch((error) => {
        console.error("Error copying to clipboard:", error);
        Prompts.alert("Error copying to clipboard. Please try again.");
      });
  } catch (error) {
    console.error("Error filtering transactions by date:", error);
    Prompts.alert("Error filtering transactions. Please try again.");
  }
}

function availableBalance() {
  try {
    const balance = getAvailableBalance();
    if (balance) {
      navigator.clipboard
        .writeText(balance)
        .then(() => Prompts.alert("Available balance copied to clipboard"))
        .catch((error) => {
          console.error("Error copying balance to clipboard:", error);
          Prompts.alert("Error copying balance. Please try again.");
        });
    }
  } catch (error) {
    console.error("Error with available balance:", error);
    Prompts.alert("Error retrieving balance. Please try again.");
  }
}

function setupIndividualDebitTransactionLinks() {
  try {
    getAllRowsInPastTransactionTable().forEach((row) => {
      const transaction = getRowData(row);
      if (transaction && transaction.amount < 0) {
        const debitTransaction = {
          ...transaction,
          amount: Math.abs(transaction.amount),
        };
        row.style.cursor = "pointer";

        // Remove previous event listeners if the row was already processed
        const newRow = row.cloneNode(true);
        row.parentNode.replaceChild(newRow, row);

        newRow.addEventListener("mouseover", () => {
          newRow.style.color = "blue";
        });

        newRow.addEventListener("mouseout", () => {
          newRow.style.color = "unset";
        });

        newRow.addEventListener("click", () => {
          navigator.clipboard
            .writeText(convertTransactionToTSV(debitTransaction))
            .then(() => console.log("Saved to clipboard", debitTransaction))
            .catch((error) =>
              console.error("Error copying transaction:", error)
            );
        });
      }
    });
  } catch (error) {
    console.error("Error setting up transaction links:", error);
  }
}

function delayedIndividualDebitTransactionLinks() {
  setTimeout(setupIndividualDebitTransactionLinks, 2000);
}

// ========================
// EVENT MANAGEMENT
// ========================
function setupEventListeners() {
  try {
    const dateRangeDropdown = document.querySelector(
      "#TransactionFilter_TransactionDatePeriod"
    );
    if (dateRangeDropdown) {
      dateRangeDropdown.addEventListener(
        "change",
        delayedIndividualDebitTransactionLinks
      );
    }

    const filterSubmitButton = document.querySelector("#SubmitFilter");
    if (filterSubmitButton) {
      filterSubmitButton.addEventListener(
        "click",
        delayedIndividualDebitTransactionLinks
      );
    }

    const form = document.querySelector("form#TransactionFilter");
    if (form) {
      form.addEventListener("submit", delayedIndividualDebitTransactionLinks);
    }
  } catch (error) {
    console.error("Error setting up event listeners:", error);
  }
}

// ========================
// INITIALIZATION
// ========================
function initBudgetingFeatures() {
  try {
    // Create main menu
    const dropdownMenu = createMenuButtonAndContainer("Budgeting");
    if (!dropdownMenu) {
      throw new Error("Failed to create budgeting menu");
    }

    // Add menu items
    createMenuItem(
      dropdownMenu,
      "Debits from Yesterday",
      debitTransactionsFromYesterday
    );
    createMenuItem(
      dropdownMenu,
      "Debits from Today",
      debitTransactionsFromToday
    );
    createMenuItem(dropdownMenu, "Debits from Date", debitTransactionsWithDate);
    createMenuItem(dropdownMenu, "Balance", availableBalance);

    // Setup transaction links and event listeners
    delayedIndividualDebitTransactionLinks();
    setupEventListeners();

    console.log("AFCU Budgeting extension initialized");
  } catch (error) {
    console.error("Error initializing budgeting features:", error);
  }
}

// Start the extension
initBudgetingFeatures();
