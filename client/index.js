document.addEventListener('DOMContentLoaded', () => { //function()
    fetch('http://localhost:5000/getAll')
    .then(res => res.json())
    .then(data => console.log(data));
    loadHTMLTable([]);
});

function loadHTMLTable(data){
    const table = document.querySelector('table tbody');

    if(data.length === 0){
        table.innerHTML = "<tr><td class='no-data' colspan='6'>No Data</td></tr>";
    }
}