(
    async () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let [incomes, expenses] = resetDataArrays();
        let categoriesSet = new Set();

        const dataUrl = getTransactionUrl();
        var transactions = await getTransactionData(dataUrl);
        transactions.map(d => processTransaction(d));   // calculates totals per month and fills categoriesSet

        const button = document.getElementById("refreshButton");
        button.addEventListener("click", async () => {await refresh()});

        let categories = Array.from(categoriesSet);

        addFilters(categories);
        let table = new Tablesort(document.getElementById('transactions'));
        let tbody = document.getElementById("tablebody");
        refreshTransactionTable();

        const ctx = document.getElementById('myChart');
        const chart = createChart();

        function createChart() {
            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'income',
                        data: incomes,
                        backgroundColor: '#0A0',
                        borderWidth: 2,
                        borderColor: '#777',
                        hoverBorderWidth: 3,
                        hoverBorderColor: '#000',
                        hoverBackgroundColor: '#0A0'
                        },
                        {
                        label: 'expenses',
                        data: expenses,
                        backgroundColor: '#D00',
                        borderWidth: 2,
                        borderColor: '#777',
                        hoverBorderWidth: 3,
                        hoverBorderColor: '#000',
                        hoverBackgroundColor: 'Red'
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                suggestedMax: 30000,
                                beginAtZero: true
                            }
                        }]
                    },
                    onClick: function (e) {
                        var activeElement = chart.getElementAtEvent(e);
                        console.log(activeElement[0]._model.label + ' ' + activeElement[0]._model.datasetLabel);
                    }
                }
            });
        }

        function resetDataArrays() {
            return [new Array(12).fill(0), new Array(12).fill(0)];
        }

        function refreshTransactionTable() {
            transactions.map(d => addToTransactionTable(d));
            table.refresh();    
        }

        function addToTransactionTable(transaction) {
            tbody.appendChild(createRow(transaction));
        }

        function createRow(transaction) {
            let row = document.createElement('tr');
            let cell = document.createElement('td');
            cell.appendChild(createCheckbox(1, transaction.reference, toggleTransaction))
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
            if (elem.srcElement.checked) {
                categoriesSet.add(elem.srcElement.value);
            } else {
                categoriesSet.delete(elem.srcElement.value);
            }
            recalc();
        }

        function toggleCategory(elem) {
            if (elem.srcElement.checked) {
                categoriesSet.add(elem.srcElement.value);
            } else {
                categoriesSet.delete(elem.srcElement.value);
            }
            recalc();
        }

        function addFilters(categories) {
            let parentElement = document.getElementById("filters");
            for (var count in categories)
            {
                parentElement.appendChild(createCheckbox(count, categories[count], toggleCategory));
                parentElement.appendChild(createLabel(count, categories[count]))
            }
        }

        function createCheckbox(count, category, handler) {
            let newCheckBox = document.createElement('input');
            newCheckBox.type = 'checkbox';
            newCheckBox.id = 'cat' + count;
            newCheckBox.value = category;
            newCheckBox.checked = true;
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
            transaction.categories.forEach(element => {
                categoriesSet.add(element);
            });
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

        function refreshChart() {
            chart.data.datasets[0].data = incomes;
            chart.data.datasets[1].data = expenses;
            chart.update();
        }

        function recalc() {
            [incomes, expenses] = resetDataArrays();
            transactions.map(t => calcExpenses(t));
            refreshChart();
        }

        function calcExpenses(transaction) {
            for (let c of transaction.categories) {
                if (categoriesSet.has(c)) {                 // if one of the categories is checked
                    processAmount(transaction.amount, transaction.month);
                    return;
                }
            }
        }

        async function refresh() {
            let p = document.getElementById("inputFile");
            let path = p != null && p.value ? "/in/" + p.value + ".json" : "/transactions.json";

            transactions = await getTransactionData(path);
            [incomes, expenses] = resetDataArrays();
            transactions.map(d => processTransaction(d));

            refreshChart();

            tbody.innerHTML = '';
            transactions.map(d => addToTransactionTable(d));
            table.refresh();    
        }

        async function getTransactionData(path) {
            const result = await fetch(path);
            const json = await result.json();
            return json;    
        }
    }
)();
