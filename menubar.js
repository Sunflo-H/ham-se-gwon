import icons from './weatherIcon.js'; 

const menubar = document.querySelector('#menu-bar');
const menuWeatherBox = menubar.querySelector('.menu-weather-box');
const menuBoxes = menubar.querySelectorAll('.menu-box');
const weatherIcon = menuWeatherBox.querySelector('.menu-weather-icon');

const color = {
    blue : "#258fff",
    white : "#ffffff"
}
menuWeatherBox.addEventListener('mouseenter',e => {
    
});

menuBoxes.forEach(menuBox => {
     menuBox.addEventListener('mouseenter', e => {
         const text = e.target.querySelector('span');
        e.target.style.backgroundColor = `${color.white}`;
        text.style.color = `${color.blue}`;
    });
});

menuBoxes.forEach(menuBox => {
     menuBox.addEventListener('mouseleave', e => {
        const text = e.target.querySelector('span');
        e.target.style.backgroundColor = `${color.blue}`;
        text.style.color = `${color.white}`;
    });
});
