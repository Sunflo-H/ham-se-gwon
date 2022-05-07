

const input = document.querySelector('input[type=text]');

console.log(input);

$(input).on("propertychange change paste input",function(e) {
    fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${e.target.value}&size=5`, {
    headers: { Authorization: `KakaoAK 621a24687f9ad83f695acc0438558af2` }
    })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.log("error:" + error));
});

// input.addEventListener('change', e => {
//     console.log(e.target);
//     console.log(e.target.value);
// })