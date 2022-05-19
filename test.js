const city = document.querySelector('#city');

console.log(city);

city.addEventListener('keyup', e => {
    if(e.keyCode === 38) return;
    if(e.keyCode === 40) return;
    console.log(city.value);
})