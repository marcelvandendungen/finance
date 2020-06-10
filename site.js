(
    async () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let incomes = [];
        for(var i = 0; i < 12; i++) {
            incomes.push(0);
        }
        let expenses = []
        for(var i = 0; i < 12; i++) {
            expenses.push(0);
        }
        let categories = new Set();

        var apiData = await getApiData();
        apiData.map(d => processTransaction(d));

        addCheckboxes(Array.from(categories));

        const button = document.getElementById("refreshButton");
        button.addEventListener("click", refresh);

        const ctx = document.getElementById('myChart');
        const chart = new Chart(ctx, {
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
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

        function toggleCheckbox(elem) {
            console.log(elem.target.id);
            chart.data.datasets[1].data[2] = 3456;
            chart.update();
        }

        function addCheckboxes(categories) {
            let parentElement = document.getElementById("filters");
            for (var count in categories)
            {
                parentElement.appendChild(createCheckbox(count, categories[count]));
                parentElement.appendChild(createLabel(count, categories[count]))
            }
        }

        function createCheckbox(count, category) {
            let newCheckBox = document.createElement('input');
            newCheckBox.type = 'checkbox';
            newCheckBox.name = 'cat' + count;
            newCheckBox.id = '' + count;
            newCheckBox.value = category;
            newCheckBox.checked = true;
            newCheckBox.addEventListener('click', toggleCheckbox);
            return newCheckBox;
        }

        function createLabel(count, category) {
            let newLabel = document.createElement("label");
            newLabel.setAttribute('for', 'cat' + count);
            newLabel.innerText = category;
            return newLabel;
        }

        function processTransaction(transaction) {
            let month = transaction.month;
            expenses[month] += transaction.amount;
            transaction.categories.forEach(element => {
                categories.add(element);
            });
        }

        function refresh() {
            chart.data.datasets[1].data[2] = 3456;
            chart.update();
        }

        async function getApiData() {
            const result = await fetch('/transactions.json');
            const json = await result.json();
            return json;
        }
    }
)();
