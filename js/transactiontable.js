import {createTableRow} from './dom.js';

let tbody = null;

function refreshTransactionTable(transactions, table, toggleTransaction, createCheckbox) {
    tbody = document.getElementById("tablebody");
    tbody.innerHTML = '';
    transactions.map(function(d) {addToTransactionTable(d, toggleTransaction, createCheckbox)});
    table.refresh();
}

function addToTransactionTable(transaction, toggleTransaction, createCheckbox) {
    tbody.appendChild(createTableRow(transaction, toggleTransaction, createCheckbox));
}

export { refreshTransactionTable }
