

// fetch("https://dapi.kakao.com/v2/local/search/keyword.json?y=37.514322572335935&x=127.06283102249932&radius=20000&query=햄버거",{
//     headers: { Authorization: `KakaoAK 621a24687f9ad83f695acc0438558af2` }
// })
// .then((response) => {
//     console.log(response);
//     return response.json();
// })
// .then((data) => console.log(data))
// .catch((error) => console.log(error))

function getPosition() {
    return new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej);
    });
}

function main() {
    getPosition()
    .then(result => {
        console.log(result)
        return result
    })
    .then(result => console.log(result.coords.latitude, result.coords.longitude))
}

main();

function success(position) {
    return new Promise(resolve => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const coords = {lat : lat, lng : lng};
        resolve(coords);
    })
}

function error() {
    alert('Sorry, no position available.');
}

let position_data = navigator.geolocation.getCurrentPosition(success);

function success(position) {
    console.log(position);
}