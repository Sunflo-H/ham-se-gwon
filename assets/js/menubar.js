const menubar = document.querySelector('#menu-bar');
const menuWeathercontainer = menubar.querySelector('.menu-weather-container');
const menucontaineres = menubar.querySelectorAll('.menu-container');

const color = {
    blue : "#258fff",
    white : "#ffffff"
}
menuWeathercontainer.addEventListener('mouseenter',e => {
    
});

menucontaineres.forEach(menucontainer => {
     menucontainer.addEventListener('mouseenter', e => {
         const text = e.target.querySelector('span');
        e.target.style.backgroundColor = `${color.white}`;
        text.style.color = `${color.blue}`;
    });
});

menucontaineres.forEach(menucontainer => {
     menucontainer.addEventListener('mouseleave', e => {
        const text = e.target.querySelector('span');
        e.target.style.backgroundColor = `${color.blue}`;
        text.style.color = `${color.white}`;
    });
});
