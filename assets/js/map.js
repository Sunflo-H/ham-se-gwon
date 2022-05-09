const input = document.querySelector('.search-bar input[type=text]');

let addresses = [];

function setMap(lat, lng) {
    const mapContainer = document.getElementById('map'); // 지도를 표시할 div 

    let mapOption = {
        center: new kakao.maps.LatLng(lat, lng), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
    };

    // 지도 그리기
    let map = new kakao.maps.Map(mapContainer, mapOption);

    // 마커가 표시될 위치입니다 
    var markerPosition = new kakao.maps.LatLng(lat, lng);

    // 마커를 생성합니다
    var marker = new kakao.maps.Marker({
        position: markerPosition
    });

    // 마커가 지도 위에 표시되도록 설정합니다
    marker.setMap(map);

    // 아래 코드는 지도 위의 마커를 제거하는 코드입니다
    // marker.setMap(null);  
}


// 내 위치 정보를 얻어 지도에 표시한다.
function getUserLocation() {
    if(navigator.geolocation) navigator.geolocation.getCurrentPosition(success, error);
    else { throw "위치 정보가 지원되지 않습니다."; }
}

function success(position) {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    setMap(userLat, userLng);
}

function error() {
    alert('Sorry, no position available.');
}


function showRelation(data) {
    const relationContainer = document.querySelector('.relation-container');
    const api_data =  data.documents;
    while ( relationContainer.hasChildNodes() ) {
          relationContainer.removeChild( relationContainer.firstChild ); 
    }
    api_data.forEach(data => {
        let html = `<div class="relation"><span>${data.address_name}</span></div>`
        relationContainer.insertAdjacentHTML('beforeend',html);
    }); 
}

function createHistory(data) {

}

function init() {
    /**
     * 현재 위치 정보 알아낸뒤 (getUserLocation -> success -> setMap)
     * 현재 위치를 지도에 보여줘
     * 
     * 검색
     * 검색해서 나온 data를 
     * .relation-container, .history-container 안에
     * .relation과 .history를 만들어서 보여주고, 
     * 가장 마지막으로 출력된 data를 저장
     * 만약 data를 검색한 적이 없으면 검색바는 모양이 달라지지 않는다.
     * 
     * 
     * 보여주기, 거리
     */
    getUserLocation();
}

init();

// 검색창에 값이 입력될 때마다 연관검색어를 보여주는 이벤트
$(input).on("change paste input",function(e) {
    if(e.target.value === '') return; //value가 공백이 되면 query에러가 발생하여 넣은 코드
    fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${e.target.value}&size=5`, {
    headers: { Authorization: `KakaoAK 621a24687f9ad83f695acc0438558af2` }
    })
    .then((response) => response.json())
    .then((data) => {
        showRelation(data);
    })
    .catch((error) => console.log("error:" + error));
    console.log(e.target.value);
});

input.addEventListener('focus', e => {
    const wordContainer = document.querySelector('.word-container');
    const searchBar = document.querySelector('.search-bar');
    wordContainer.classList.remove('hide');
    searchBar.style.borderRadius = "15px 15px 0px 0px";
});
input.addEventListener('blur', e => {
    const wordContainer = document.querySelector('.word-container');
    const searchBar = document.querySelector('.search-bar');
    wordContainer.classList.add('hide');
    searchBar.style.borderRadius = "15px";
});

// // 주소 검색 객체를 생성합니다.
// var geocoder = new kakao.maps.services.Geocoder();
// // 장소 검색 객체를 생성합니다
// var ps = new kakao.maps.services.Places();
// // 장소 검색 옵션 객체
// let coords = new kakao.maps.LatLng(37.566826, 126.9786567);



// function a(address) {
//     return new Promise((resolve, reject) => {
//         geocoder.addressSearch(`${address}`, (result, status) => {
//             if (status === kakao.maps.services.Status.OK) {
//                 let coords = new kakao.maps.LatLng(result[0].y, result[0].x);
//                 map.setCenter(coords);

//                 // 결과값으로 받은 위치를 마커로 표시합니다
//                 var marker = new kakao.maps.Marker({
//                     map: map, // 추후 추가하려면 marker.setMap을 이용한다.
//                     position: coords
//                 });

//                 // 인포윈도우로 장소에 대한 설명을 표시합니다
//                 var infowindow = new kakao.maps.InfoWindow({
//                     content: `<div style="width:150px;text-align:center;padding:6px 0;">${result[0].address_name}</div>`
//                 });
//                 infowindow.open(map, marker);

//                 resolve(result[0]);
//             } else {
//                 const error = new Error();
//                 error.name = "stateIsNotOk";
//                 reject(error);
//             }
//         });
//     })
// }





// function setMapType(maptype) {
//     map.setMapTypeId(kakao.maps.MapTypeId[maptype]);
// }

// function addressSearchPopUp() {
//     new daum.Postcode({
//         oncomplete: function (data) {
//             // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

//             // 각 주소의 노출 규칙에 따라 주소를 조합한다.
//             // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
//             var addr = ''; // 주소 변수
//             //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
//             if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
//                 addr = data.roadAddress;
//             } else { // 사용자가 지번 주소를 선택했을 경우(J)
//                 addr = data.jibunAddress;
//             }
//             addressPopup = addr;
//             console.log(addressPopup);
//         }
//     }).open();
// }

// inputButton.addEventListener('click', () => {
//     a('서울시 광진구 구의동')
//         .then(console.log)
//         .catch(console.log);
// })
