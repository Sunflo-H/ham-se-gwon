const box = document.querySelector('.box');
const click = document.querySelector('.click');
click.addEventListener('click',(e) => {
    console.log('hi');

    if(box.style.height === '200px') {
        box.style.transform = 'rotate(90deg)';
        box.style.height = '0px';
    }
    else {
        box.style.height = '200px';
    }
});

let bat = {
    name: 'bruce'
}
console.log(bat);
bat.power = 'rich';
console.log(bat);