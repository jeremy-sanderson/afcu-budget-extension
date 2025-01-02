'use strict';


const colors = {
    menuButtonBackgroundColor: "#00548e",
    menuButtonColor: "white",
    menuBackgroundColor: "white",
    menuBackgroundHoverColor: "#f1f1f1",
    menuItemColor: "black"
};


/**
 * Minified by jsDelivr using Terser v5.37.0.
 * Original file: /npm/prompts-js@0.0.4/index.js
 * https://github.com/simonw/prompts-js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
const Prompts=function(){const e={border:"none",borderRadius:"6px",padding:"20px",minWidth:"300px",maxWidth:"80%",boxSizing:"border-box",fontFamily:"sans-serif",boxShadow:"0 2px 10px rgba(0,0,0,0.2)",background:"#fff"},n={marginBottom:"20px",fontSize:"16px",color:"#333",whiteSpace:"pre-wrap",wordWrap:"break-word"},o={textAlign:"right",marginTop:"20px"},t={backgroundColor: colors.menuButtonBackgroundColor,color:"#fff",border:"none",borderRadius:"4px",padding:"8px 12px",fontSize:"14px",cursor:"pointer",marginLeft:"8px"},d={backgroundColor:"#6c757d"},r={width:"100%",boxSizing:"border-box",padding:"8px",fontSize:"16px",marginBottom:"20px",borderRadius:"4px",border:"1px solid #ccc"};function a(e,n){Object.assign(e.style,n)}function i(o){const t=document.createElement("dialog");a(t,e),t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true");const d=document.createElement("form");d.method="dialog";const r=document.createElement("div");return a(r,n),r.textContent=o,d.appendChild(r),t.appendChild(d),{dialog:t,form:d}}function c(e,n,o={},d="submit"){const r=document.createElement("button");return a(r,t),a(r,o),r.type=d,r.value=n,r.textContent=e,r}return{alert:async function(e){return new Promise((n=>{const{dialog:t,form:d}=i(e),r=document.createElement("div");a(r,o);const p=c("OK","ok");r.appendChild(p),d.appendChild(r),t.addEventListener("close",(()=>{n(),t.remove()})),document.body.appendChild(t),t.showModal(),p.focus()}))},confirm:async function(e){return new Promise((n=>{const{dialog:t,form:r}=i(e),p=document.createElement("div");a(p,o);const l=c("Cancel","cancel",d),s=c("OK","ok");p.appendChild(l),p.appendChild(s),r.appendChild(p),t.addEventListener("close",(()=>{const e=t.returnValue;n("ok"===e),t.remove()})),document.body.appendChild(t),t.showModal(),s.focus()}))},prompt:async function(e){return new Promise((n=>{const{dialog:t,form:p}=i(e),l=document.createElement("input");a(l,r),l.type="text",l.name="promptInput",p.appendChild(l);const s=document.createElement("div");a(s,o);const u=c("Cancel","cancel",d,"button"),m=c("OK","ok");s.appendChild(u),s.appendChild(m),p.appendChild(s),u.addEventListener("click",(()=>{t.close(null)})),t.addEventListener("close",(()=>{const e="ok"===t.returnValue?l.value:null;n(e),t.remove()})),document.body.appendChild(t),t.showModal(),l.focus()}))}}}();



function createMenuItem(dropdownMenu, text, callback) {
    var menuItem = document.createElement('div');
    menuItem.className = 'menuItem';
    menuItem.target = '_blank';
    menuItem.textContent = text;
    Object.assign(menuItem.style, {
        padding: '10px 20px',
        textDecoration: 'none',
        color: colors.menuItemColor,
        display: 'block',
        cursor: 'pointer'
    });
    menuItem.addEventListener('mouseover', function() {
        menuItem.style.backgroundColor = colors.menuBackgroundHoverColor;
    });
    menuItem.addEventListener('mouseout', function() {
        menuItem.style.backgroundColor = colors.menuBackgroundColor;
    });
    if (callback) {
        menuItem.addEventListener('click', function() {
            callback();
        });
    }
    dropdownMenu.appendChild(menuItem);
}


function createMenuButtonAndContainer(buttonLabel) {
    const menuButton = document.createElement('button');
    menuButton.id = 'menuButton';
    menuButton.textContent = buttonLabel;
    document.body.appendChild(menuButton);

    // Style the menu button
    Object.assign(menuButton.style, {
        position: 'fixed',
        top: '90px',
        right: '10px',
        padding: '10px 20px',
        backgroundColor: colors.menuButtonBackgroundColor,
        color: colors.menuButtonColor,
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: '99999'
    });


    // Create the dropdown menu container
    const dropdownMenu = document.createElement('div');
    dropdownMenu.id = 'dropdownMenu';
    document.body.appendChild(dropdownMenu);

    // Style the dropdown menu
    Object.assign(dropdownMenu.style, {
        display: 'none',
        position: 'fixed',
        top: '130px',
        right: '10px',
        backgroundColor: colors.menuBackgroundColor,
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        zIndex: '99999'
    });

    // Close the dropdown if the user clicks outside of it
    window.onclick = function(event) {
        if (!event.target.matches(`#${menuButton.id}`)) {
            if (dropdownMenu.style.display === 'block') {
                dropdownMenu.style.display = 'none';
            }
        }
    }

    // JavaScript to handle menu button click
    menuButton.addEventListener('click', function() {
        if (dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';
        } else {
            dropdownMenu.style.display = 'block';
        }
    });

    return dropdownMenu;
}


const getRowData = (row) => {
    const dateValue = row.querySelector('td.column-date').outerText;
    const description = row.querySelector('td.column-description').outerText;
    const amount = row.querySelector('td.column-amount span.transaction-').outerText;
    return { 'date': dateValue,
            'description': description.replace(",", "").replace("\n", ""),
            'amount': Number(amount.replace("$", "").replace(",", ""))
           };
};

const convertTransactionToTSV = (transaction) => `${transaction.date}\t${transaction.description}\t${transaction.amount}`;
const getAllRowsInPastTransactionTable = () => [...document.querySelectorAll('#PastTransactionsGrid table tbody tr')];

const gatherDebitTransactionsInViewSortedByDate = () => 
    getAllRowsInPastTransactionTable().map(row => getRowData(row))
        .filter(transaction => transaction.amount < 0)
        .map(transaction => ({...transaction, amount: Math.abs(transaction.amount) }))
        .sort((a,b) => {
            const dateComparison = Date.parse(a.date) - Date.parse(b.date);
            if (dateComparison === 0) {
                return a.description.localeCompare(b.description);
            }
            else {
                return dateComparison;
            }
        });
    

const debitTransactionsWithDate = () => {
    const today = new Date().toLocaleDateString();
    Prompts.prompt("Enter start date (blank for today)").then(selectedDate => {
        const filterDate = !!selectedDate ? Date.parse(selectedDate) : Date.parse(new Date().toLocaleDateString());
        filterDebitsByDate(filterDate);
    });
};

const debitTransactionsFromYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    filterDebitsByDate(Date.parse(yesterday.toLocaleDateString()));
};

const debitTransactionsFromToday = () => {
    filterDebitsByDate(Date.parse(new Date().toLocaleDateString()));
}

const filterDebitsByDate = (filterDate) => {
    const transactions = gatherDebitTransactionsInViewSortedByDate()
        .filter(transaction => Date.parse(transaction.date) >= filterDate)
        .map(t => convertTransactionToTSV(t)).join('\n');
    navigator.clipboard.writeText(transactions);
    Prompts.alert("Transactions copied to clipboard");
};

const debitsFromToday = () => {


};

const availableBalance = () => {
    const accountDetails = document.querySelector("div.account-details");
    const availableBalance = [...accountDetails.querySelectorAll(".row")].filter((accountDetail) => accountDetail.querySelector(".detail-label-col span").innerText.includes('Available Balance'))
    .map((accountDetail) => accountDetail.querySelector(".detail-item-col span").innerText.replace("$", "").replace(",", ""))[0];
    navigator.clipboard.writeText(availableBalance);
    Prompts.alert("Available balance copied to clipboard");
};

const createCopyIcon = () => {

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.cursor = 'pointer';

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

const setupIndividualDebitTransactionLinks = () => {
    getAllRowsInPastTransactionTable().forEach(row => {
        const transaction = getRowData(row);
        if (transaction.amount < 0) {
            // todo - put a copy icon in the table itself
            const debitTransaction = {...transaction, amount: Math.abs(transaction.amount)};
            row.style.cursor = 'pointer';
            row.addEventListener('mouseover', () => {
                row.style.color = 'blue';
            });

            row.addEventListener('mouseout', () => {
                row.style.color = 'unset';
            });

            row.addEventListener('click', () => {
                navigator.clipboard.writeText(convertTransactionToTSV(debitTransaction));
                console.log('Saved to clipboard', debitTransaction);
            });
        }
    });
};

const delayedIndividualDebitTransactionLinks = () => {
    setTimeout(setupIndividualDebitTransactionLinks, 2000);
};


const dropdownMenu = createMenuButtonAndContainer('Budgeting');
createMenuItem(dropdownMenu, 'Debits from Yesterday', debitTransactionsFromYesterday);
createMenuItem(dropdownMenu, 'Debits from Today', debitTransactionsFromToday);
createMenuItem(dropdownMenu, 'Debits from Date', debitTransactionsWithDate);
createMenuItem(dropdownMenu, 'Balance', availableBalance);
delayedIndividualDebitTransactionLinks();

const dateRangeDropdown = document.querySelector('#TransactionFilter_TransactionDatePeriod');
dateRangeDropdown.addEventListener('change', delayedIndividualDebitTransactionLinks);

const filterSubmitButton = document.querySelector('#SubmitFilter');
filterSubmitButton.addEventListener('click', delayedIndividualDebitTransactionLinks);

const form = document.querySelector("form#TransactionFilter");

form.addEventListener('submit', delayedIndividualDebitTransactionLinks);

