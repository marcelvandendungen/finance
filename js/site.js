import {createChart, refreshChart} from './barchart.js';
import {refreshTransactionTable} from './transactiontable.js';
import {createCheckbox, createLabel} from './dom.js';

(
    async () => {
        let [incomes, expenses] = resetDataArrays();
        let categoriesSet = new Set();
        categoriesSet.add("other");     // add default category for every transaction without a category

        let transactions = await loadTransactions(getTransactionUrl());

        let categories = Array.from(categoriesSet);
        addFilters(categories);

        const button = document.getElementById("refreshButton");
        button.addEventListener("click", async () => {await refresh()});

        let table = new Tablesort(document.getElementById('transactions'));
        refreshTransactionTable(transactions, table, toggleTransaction, createCheckbox);

        createChart(document.getElementById('myChart'), incomes, expenses);

        function resetDataArrays() {
            return [new Array(12).fill(0), new Array(12).fill(0)];
        }

        async function loadTransactions(dataUrl) {
            let transactions = await getTransactionData(dataUrl);
            transactions.map(d => processTransaction(d));   // calculates totals per month and fills categoriesSet
            return transactions;
        }

        function getTransactionUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            const filename = urlParams.get('file');
            const path = filename ? "/in/" + filename + ".json" : "/transactions.json";
            return path;
        }

        function toggleTransaction(elem) {
            // find in transactions the transaction with reference
            // toggle its selected field
            let params = {
                reference: elem.srcElement.value,
                checked: elem.srcElement.checked
            }
            recalc(params);
        }

        function toggleCategory(elem) {
            if (elem.srcElement.checked) {
                categoriesSet.add(elem.srcElement.value);
            } else {
                categoriesSet.delete(elem.srcElement.value);
            }
            let params = {
                category: elem.srcElement.value,
                checked: elem.srcElement.checked
            }
            recalc(params);
        }

        function addFilters(categories) {
            let parentElement = document.getElementById("filters");
            parentElement.innerHTML = '';
            for (var count in categories)
            {
                parentElement.appendChild(createCheckbox("cat" + count, true, categories[count], toggleCategory));
                parentElement.appendChild(createLabel(count, categories[count]))
            }
        }

        function processTransaction(transaction) {
            processAmount(transaction.amount, transaction.month);
            transaction.selected = true;
            transaction.categories.forEach(element => {
                categoriesSet.add(element);
            });
            if (!transaction.categories.length) {
                transaction.categories = ["other"];
            }
        }

        function processAmount(amount, month) {
            if (amount > 0) {
                incomes[month] += amount;
                // console.log("adding " + Math.abs(transaction.amount) + " to income of " + transaction.month + " with " + transaction.categories);
            } else {
                expenses[month] += Math.abs(amount);
                // console.log("adding " + Math.abs(transaction.amount) + " to expenses of " + transaction.month + " with " + transaction.categories);
            }
        }

        function recalc(parameters) {
            [incomes, expenses] = resetDataArrays();
            if ('category' in parameters) {
                transactions.map(function(t) {
                    toggleCheckbox(t, parameters.category, parameters.checked);
                    return calcExpenses(t, parameters.category, parameters.checked); 
                });
            } else {
                transactions.map(function(t) {
                    selectTransaction(t, parameters.reference, parameters.checked);
                    return calcExpenses(t, parameters.reference, parameters.checked); 
                });
            }
            refreshChart(incomes, expenses);
        }

        function toggleCheckbox(transaction, category, checked) {
            if (category && transaction.categories.includes(category)) {
                let e = document.getElementById(transaction.reference);
                e.checked = checked;
                transaction.selected = checked;
            }
        }

        function calcExpenses(transaction, category, checked) {
            if (transaction.selected) {
                processAmount(transaction.amount, transaction.month);
            }
        }

        function selectTransaction(transaction, reference, checked) {
            if (transaction.reference == reference) {
                transaction.selected = checked;
            }
        }

        async function refresh() {
            let p = document.getElementById("inputFile");
            let path = p != null && p.value ? "/in/" + p.value + ".json" : "/transactions.json";

            categoriesSet = new Set();
            categoriesSet.add("other")
            [incomes, expenses] = resetDataArrays();
            transactions = await loadTransactions(path);


            categories = Array.from(categoriesSet);
            addFilters(categories);
            refreshChart(incomes, expenses);
            refreshTransactionTable(transactions, table, toggleTransaction, createCheckbox)
        }

        async function getTransactionData(path) {
            const result = await fetch(path);
            const json = await result.json();
            return json;
        }
    }
)();
