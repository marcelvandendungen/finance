import {createChart, refreshChart} from './barchart.js';

(
    async () => {
        let [incomes, expenses] = resetDataArrays();
        let categoriesSet = new Set();
        categoriesSet.add("other");     // add default category for every transaction without a category

        const dataUrl = getTransactionUrl();
        var transactions = await getTransactionData(dataUrl);
        transactions.map(d => processTransaction(d));   // calculates totals per month and fills categoriesSet

        const button = document.getElementById("refreshButton");
        button.addEventListener("click", async () => {await refresh()});

        let categories = Array.from(categoriesSet);

        addFilters(categories);
        let table = new Tablesort(document.getElementById('transactions'));
        let tbody = document.getElementById("tablebody");
        refreshTransactionTable(table);

        const ctx = document.getElementById('myChart');
        createChart(ctx, incomes, expenses);

        function resetDataArrays() {
            return [new Array(12).fill(0), new Array(12).fill(0)];
        }

        function refreshTransactionTable(table) {
            transactions.map(d => addToTransactionTable(d));
            table.refresh();    
        }

        function addToTransactionTable(transaction) {
            tbody.appendChild(createRow(transaction));
        }

        function createRow(transaction) {
            let row = document.createElement('tr');
            let cell = document.createElement('td');
            cell.appendChild(createCheckbox(transaction.reference, transaction.selected, transaction.reference, toggleTransaction))
            row.appendChild(cell);
            cell = document.createElement('td');
            cell.innerText = transaction.amount;
            row.appendChild(cell);
            cell = document.createElement('td');
            cell.innerText = transaction.description;
            row.appendChild(cell);
            cell = document.createElement('td');
            cell.innerText = transaction.categories;
            row.appendChild(cell);
            return row;
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

        function createCheckbox(id, checked, category, handler) {
            let newCheckBox = document.createElement('input');
            newCheckBox.type = 'checkbox';
            newCheckBox.id = id;
            newCheckBox.value = category;
            newCheckBox.checked = checked;
            newCheckBox.addEventListener('click', handler);
            return newCheckBox;
        }

        function createLabel(count, category) {
            let newLabel = document.createElement("label");
            newLabel.setAttribute('for', 'cat' + count);
            newLabel.innerText = category;
            return newLabel;
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
                transactions.map(function(t) { return calcExpenses(t, parameters.category, parameters.checked) });
            } else {
                transactions.map(function(t) { return calcExpenses2(t, parameters.reference, parameters.checked) });
            }
            refreshChart(incomes, expenses);
        }

        function calcExpenses(transaction, category, checked) {
            if (category && transaction.categories.includes(category)) {
                let e = document.getElementById(transaction.reference);
                e.checked = checked;
                transaction.selected = checked;
            }
            if (transaction.selected) {
                processAmount(transaction.amount, transaction.month);
            }
        }

        function calcExpenses2(transaction, reference, checked) {
            if (transaction.reference == reference) {
                transaction.selected = checked;
            }
            if (transaction.selected) {
                processAmount(transaction.amount, transaction.month);
            }
        }

        async function refresh() {
            let p = document.getElementById("inputFile");
            let path = p != null && p.value ? "/in/" + p.value + ".json" : "/transactions.json";

            categoriesSet = new Set();
            categoriesSet.add("other")
            transactions = await getTransactionData(path);
            [incomes, expenses] = resetDataArrays();
            transactions.map(d => processTransaction(d));

            categories = Array.from(categoriesSet);
            addFilters(categories);
            refreshChart(incomes, expenses);

            tbody.innerHTML = '';
            refreshTransactionTable(table)
        }

        async function getTransactionData(path) {
            const result = await fetch(path);
            const json = await result.json();
            return json;
        }
    }
)();
