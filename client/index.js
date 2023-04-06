document.addEventListener('DOMContentLoaded', () => { //function()
    fetch('http://localhost:5000/getAll')
    .then(res => res.json())
    .then(data => loadHTMLTable(data['data']));
});

document.querySelector('table tbody').addEventListener('click', function(event){
    if(event.target.className === "delete-row-btn"){
        deleteRowById(event.target.dataset.id);
    }

    if(event.target.className === "edit-row-btn") {
        handleEditRow(event.target.dataset.id);
    }
});

const updateBtn = document.querySelector('#update-row-btn');
const searchBtn = document.querySelector('#search-btn');
const reportBtn = document.querySelector('#generate-report');

reportBtn.onclick = function(){
    const reportTable = document.querySelector('#report-table');
    reportTable.hidden = false

    fetch('http://localhost:5000/report')
    .then(res => res.json())
    .then(data => loadReport(data['data']));
}

searchBtn.onclick = function(){
    const searchNameValue = document.querySelector('#search-name-input').value;
    const searchYearValue = document.querySelector('#search-year-input').value;

    fetch('http://localhost:5000/search/' + searchNameValue + "/" + searchYearValue)
    .then(res => res.json())
    .then(data => loadHTMLTable(data['data']));
}

function deleteRowById(id){
    fetch('http://localhost:5000/delete/' + id, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            location.reload();
        }
    });
}

function handleEditRow(id){
    const updateSection = document.querySelector('#update-row');
    updateSection.hidden = false;
    document.querySelector('#update-rating-input').dataset.id = id
    
}

updateBtn.onclick = function(){
    const updateRatingeInput = document.querySelector('#update-rating-input');

    fetch('http://localhost:5000/update', {
        method: 'PATCH',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            id: updateRatingeInput.dataset.id,
            rating: updateRatingeInput.value
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            location.reload();
        }
    })
}

const addBtn = document.querySelector('#add-info-btn');

addBtn.onclick = function (){
    const idInput = document.querySelector('#id-input');
    const nameInput = document.querySelector('#name-input');
    const yearInput = document.querySelector('#year-input');
    const ratingInput = document.querySelector('#rating-input');

    const id = parseInt(idInput.value);
    const name = nameInput.value;
    const year = parseInt(yearInput.value);
    const rating = parseFloat(ratingInput.value);

    idInput.value = "";
    nameInput.value = '';
    yearInput.value = '';
    ratingInput.value = '';

    fetch('http://localhost:5000/insert', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({id: id, name: name, year: year, rating: rating})
    })
    .then(response => response.json())
    .then(data => insertRowIntoTable(data['data']));
}

function insertRowIntoTable(data){
    const table = document.querySelector('table tbody');
    const isTableData = table.querySelector('.no-data');

    let tableHtml = "<tr>";

    for(var key in data){
        tableHtml += `<td>${data[key]}</td>`
    }
   
    tableHtml += `<td><button class="delete-row-btn" data-id=${data.id}>Delete</button></td>`;
    tableHtml += `<td><button class="edit-row-btn" data-id=${data.id}>Edit</button></td>`;
    

    tableHtml += "</tr>"

    if(isTableData){
        table.innerHTML = tableHtml;
    }
    else{
        const newRow = table.insertRow();
        newRow.innerHTML = table.html;
    }
}

function loadHTMLTable(data){
    const table = document.querySelector('#table tbody');
    // console.log(data)

    if(data.length === 0){
        table.innerHTML = "<tr><td class='no-data' colspan='6'>No Data</td></tr>";
        return;
    }

    let tableHtml = "";

    data.forEach (function ({id, name, year, rating}){
        tableHtml += "<tr>";
        tableHtml += `<td>${id}</td>`;
        tableHtml += `<td>${name}</td>`;
        tableHtml += `<td>${year}</td>`;
        tableHtml += `<td>${rating}</td>`;
        tableHtml += `<td><button class="delete-row-btn" data-id=${id}>Delete</button></td>`;
        tableHtml += `<td><button class="edit-row-btn" data-id=${id}>Edit</button></td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}

function loadReport(data){
    const table = document.querySelector('#report-table tbody');
    console.log(data)

    let tableHtml = "";

    data.forEach (function ({year, name, rating}){
        tableHtml += "<tr>";
        tableHtml += `<td>${year}</td>`;
        tableHtml += `<td>${name}</td>`;
        tableHtml += `<td>${rating}</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}