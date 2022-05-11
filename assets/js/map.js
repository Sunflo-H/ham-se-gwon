const input = document.querySelector('.search-bar input[type=text]');
const searchWrapper = document.querySelector('.search-wrapper');
const body = document.querySelector('body');

let historyList = [];

function showInMap(lat, lng) {
    const mapContainer = document.getElementById('map'); // 지도를 표시할 div 
    let mapOption = {
        center: new kakao.maps.LatLng(lat, lng), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
    };
    let map = new kakao.maps.Map(mapContainer, mapOption);
    var coords = new kakao.maps.LatLng(lat, lng);
    var marker = new kakao.maps.Marker({
        position: coords
    });

    marker.setMap(null);  
    marker.setMap(map);

}


// 내 위치 정보를 얻어 지도에 표시한다.
function findUserLocation() {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(success, error);
    else { throw "위치 정보가 지원되지 않습니다."; }
}

function success(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    showInMap(lat, lng);
}

function error() {
    alert('Sorry, no position available.');
}


function showRelation(data) {
    const relationContainer = document.querySelector('.relation-container');
    const api_data = data.documents;

    while (relationContainer.hasChildNodes()) {
        relationContainer.removeChild(relationContainer.firstChild);
    }

    api_data.forEach(data => {
        let html = `<div class="relation">${data.address_name}</div>`
        relationContainer.insertAdjacentHTML('beforeend', html);
    });

    relationContainer.addEventListener('click', clickRelation);
}

// 연관 단어를 클릭하면 바로 검색결과 나타나게 하는 함수
function clickRelation(e) {
    const addr = e.target.innerText;

    findCoordsByAddr(addr);
}

function showHistory() {
    const historyContainer = document.querySelector('.history-container');
    while(historyContainer.hasChildNodes()){
        historyContainer.removeChild(historyContainer.firstChild);
    }
    historyList.forEach(history => {
        let html = `<div class="history"><i class="fa-solid fa-location-dot"></i>${history}</div>`
        historyContainer.insertAdjacentHTML('beforeend', html);
    })
    historyContainer.addEventListener('click', clickHistory);
}

function clickHistory() {
    console.log(e.target);
}

function setHistoryList(history) {
    // 값이 중복이 아니면 push , 배열의 크기가 5면 shift
    if(historyList.find(_history => history === _history) === undefined){

        if(historyList.length === 5) {
            historyList.shift();
        }
        
        historyList.push(history);
    }
}

function findCoordsByAddr(addr) {
    // 주소-좌표 변환 객체를 생성합니다
    var geocoder = new kakao.maps.services.Geocoder();

    // 주소로 좌표를 검색합니다
    geocoder.addressSearch(addr, function (result, status) {

        // 정상적으로 검색이 완료됐으면 
        if (status === kakao.maps.services.Status.OK) {
            const lat = result[0].y;
            const lng = result[0].x;
            showInMap(lat, lng);
            setHistoryList(addr);
        }
    });
}

function findCoordsByKeyword(keyword) {

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
    findUserLocation();
}

init();

// 검색창에 값이 입력될 때마다 연관검색어를 보여주는 이벤트
$(input).on("change paste input", function (e) {
    if (e.target.value === '') return; //value가 공백이 되면 query에러가 발생하여 넣은 코드
    fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${e.target.value}&size=5`, {
        headers: { Authorization: `KakaoAK 621a24687f9ad83f695acc0438558af2` }
    })
        .then((response) => response.json())
        .then((data) => {
            showRelation(data);
            if(historyList.length !== 0) showHistory();
        })
        .catch((error) => console.log("error:" + error));
});

// 검색창 클릭시 연관검색어, 히스토리 리스트를 보여주는 이벤트
searchWrapper.addEventListener('click', e => {
    const listContainer = document.querySelector('.list-container');
    const searchBar = document.querySelector('.search-bar');
    listContainer.classList.remove('hide');
    searchBar.style.borderRadius = "15px 15px 0px 0px";
});

// e.target이 searchWrapper면 검색창을 유지하고, 그 외의 요소들이면 검색창 닫는 이벤트
body.addEventListener('click', e => {
    if (e.target === searchWrapper ||
        e.target.parentNode === searchWrapper ||
        e.target.parentNode.parentNode === searchWrapper ||
        e.target.parentNode.parentNode.parentNode === searchWrapper ||
        e.target.parentNode.parentNode.parentNode.parentNode === searchWrapper) {
        return;
    }
    else {
        const listContainer = document.querySelector('.list-container');
        const searchBar = document.querySelector('.search-bar');
        listContainer.classList.add('hide');
        searchBar.style.borderRadius = "15px";
    }
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
