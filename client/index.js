document.addEventListener('DOMContentLoaded', () => { //function()
    fetch('http://localhost:5000/getAll')
    .then(res => res.json())
    .then(data => loadHTMLTable(data['data']));
});

const addBtn = document.querySelector('#add-info-btn');

addBtn.onclick = function (){
    const nameInput = document.querySelector('#name-input');
    const yearInput = document.querySelector('#year-input');
    const ratingInput = document.querySelector('#rating-input');

    const name = nameInput.value;
    const year = parseInt(yearInput.value);
    const rating = parseFloat(ratingInput.value);

    nameInput.value = '';
    yearInput.value = '';
    ratingInput.value = '';

    fetch('http://localhost:5000/insert', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({name: name, year: year, rating: rating})
    })
    .then(response => response.json())
    .then(data => insertRowIntoTable(data['data']));
}

function insertRowIntoTable(data){

}

function loadHTMLTable(data){
    const table = document.querySelector('table tbody');
    // console.log(data)

    if(data.length === 0){
        table.innerHTML = "<tr><td class='no-data' colspan='6'>No Data</td></tr>";
        return;
    }

    let tableHtml = "";

    data.forEach (function ({movie_id, name, year, rating}){
        tableHtml += "<tr>";
        tableHtml += `<td>${movie_id}</td>`;
        tableHtml += `<td>${name}</td>`;
        tableHtml += `<td>${year}</td>`;
        tableHtml += `<td>${rating}</td>`;
        tableHtml += `<td><button class="delete-row-btn" data-id=${movie_id}>Delete</button></td>`;
        tableHtml += `<td><button class="edit-row-btn" data-id=${movie_id}>Edit</button></td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}