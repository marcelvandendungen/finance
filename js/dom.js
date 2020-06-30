
function createCheckbox(id, checked, category, handler) {
    let newCheckBox = document.createElement('input');
    newCheckBox.type = 'checkbox';
    newCheckBox.id = id;
    newCheckBox.name = id;
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

function createTableRow(transaction, toggleTransaction, createCheckbox) {
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

export {createCheckbox, createLabel, createTableRow}