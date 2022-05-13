const searchInput = document.querySelector('.search-bar input[type=text]');
const searchBar = document.querySelector('.search-bar');
const body = document.querySelector('body');

let historyList = [];
const HISTORY_LIST_MAX_LENGTH = 5;


/**
 * setMap(lat, lng) : 좌표를 받아 지도를 만듬 , 좌표는 지도의 center
 * setMarker(lat, lng) : 좌표를 받아 마커를 지도에 띄움
 */
function setMap(lat, lng) {
    const mapContainer = document.getElementById('map'); // 지도를 표시할 div 
    let mapOption = {
        center: new kakao.maps.LatLng(lat, lng), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
    };
    let map = new kakao.maps.Map(mapContainer, mapOption);
    let data = {
        map: map,
        lat: lat,
        lng: lng
    }
    return data;
}

function setMarker_user(data) {
    const { map, lat, lng } = data;
    var coords = new kakao.maps.LatLng(lat, lng);
    var marker = new kakao.maps.Marker({
        position: coords
    });

    marker.setMap(null);
    marker.setMap(map);
}

/**
 * getCurrentPosition 함수의 콜백으로 넣을 함수명 
 * 현재 위치를 얻어온다. 얻은 위치의 주소를 찾는다.
 * 현재 위치를 얻어온다. 얻은 위치를 기반으로 키워드를 찾는다.
 */

function getUserLocation(callback, event) {
    return new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej);
    });
}

function findAddress(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    setMap(lat, lng);
}

function findKeyword(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?y=${lat}&x=${lng}&radius=20000&query=롯데리아`, {
        headers: { Authorization: `KakaoAK 621a24687f9ad83f695acc0438558af2` }
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            // showRelation(data);
            // showHistory();
            // if (data.documents.length !== 0 || historyList.length !== 0) {
            //     openSearchBar();
            // } else {
            //     closeSearchBar();
            // }
            // openSearchBar_relation();
            // openSearchBar_histroy();
        })
        .catch((error) => console.log("error:" + error));
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
    const relation = e.target.innerText;
    const currentLocation = document.querySelector('.current-location');

    findCoordsByAddr(relation);
    closeSearchBar();
    currentLocation.innerText = relation;
}

function showHistory() {
    const historyContainer = document.querySelector('.history-container');

    while (historyContainer.hasChildNodes()) {
        historyContainer.removeChild(historyContainer.firstChild);
    }

    historyList.forEach(history => {
        let html = `<div class="history"><i class="fa-solid fa-location-dot"></i>${history}</div>`
        historyContainer.insertAdjacentHTML('beforeend', html);
    })

    historyContainer.addEventListener('click', clickHistory);
}

function clickHistory(e) {
    const history = e.target.innerText;
    const currentLocation = document.querySelector('.current-location');

    findCoordsByAddr(history);
    closeSearchBar();
    currentLocation.innerText = history;
}

function setHistoryList(history) {
    // 값이 중복이 아닐 경우 push , 배열이 이미 최대크기면 shift
    if (historyList.find(_history => history === _history) === undefined) {
        if (historyList.length === HISTORY_LIST_MAX_LENGTH) historyList.shift();

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
            setMap(lat, lng);
            setHistoryList(addr);
        }
    });
}

function findCoordsByKeyword(keyword) {
    // 장소 검색 객체를 생성합니다
    var ps = new kakao.maps.services.Places();

    // 키워드로 장소를 검색합니다
    ps.keywordSearch(keyword, placesSearchCB);
}

// 키워드 검색 완료 시 호출되는 콜백함수 입니다
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        var bounds = new kakao.maps.LatLngBounds();

        for (var i = 0; i < data.length; i++) {
            displayMarker(data[i]);
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
    }
}

// 지도에 마커를 표시하는 함수입니다
function displayMarker(place) {
    // 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
    var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

    // 마커를 생성하고 지도에 표시합니다
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x)
    });

    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker, 'click', function () {
        // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
        infowindow.open(map, marker);
    });
}

function closeSearchBar() {
    const listContainer = document.querySelector('.list-container');
    const searchBar = document.querySelector('.search-bar');
    const historyContainer = document.querySelector('.history-container');
    const relationContainer = document.querySelector('.relation-container');

    searchBar.style.borderRadius = "15px";
    listContainer.classList.add('hide');
    historyContainer.classList.add('hide');
    relationContainer.classList.add('hide');
}

function openSearchBar() {
    const listContainer = document.querySelector('.list-container');
    const searchBar = document.querySelector('.search-bar');

    listContainer.classList.remove('hide');
    searchBar.style.borderRadius = "15px 15px 0px 0px";
}

function openSearchBar_relation() {
    const relationContainer = document.querySelector('.relation-container');

    relationContainer.classList.remove('hide');
}

function openSearchBar_histroy() {
    const historyContainer = document.querySelector('.history-container');

    historyContainer.classList.remove('hide');
}

function enterKey(e) {
    if (e.keyCode === 13) search();
}

function search() {
    console.log(searchInput.value);
}



function init() {
    getUserLocation()
        .then(data => setMap(data.coords.latitude, data.coords.longitude))
        .then(data => {
            setMarker_user(data);
        })
}

init();

// 주소로 검색 - 검색창에 값이 입력될 때마다 연관검색어, 히스토리를 보여주는 이벤트
searchInput.addEventListener('input', e => {
    if (e.target.value === '') return; //value가 공백이 되면 query에러가 발생하여 넣은 코드
    fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${e.target.value}&size=5`, {
        headers: { Authorization: `KakaoAK 621a24687f9ad83f695acc0438558af2` }
    })
        .then((response) => response.json())
        .then((data) => {
            showRelation(data);
            showHistory();
            if (data.documents.length !== 0 || historyList.length !== 0) {
                openSearchBar();
            } else {
                closeSearchBar();
            }
            openSearchBar_relation();
            openSearchBar_histroy();
        })
        .catch((error) => console.log("error:" + error));
})
// 키워드로 검색 - 검색창에 값이 입력될 때마다 연관검색어, 히스토리를 보여주는 이벤트
searchInput.addEventListener('input', e => {
    getUserLocation(findKeyword, e);
})

searchInput.addEventListener('click', e => {
    if (searchInput.value !== '') {
        fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${e.target.value}&size=5`, {
            headers: { Authorization: `KakaoAK 621a24687f9ad83f695acc0438558af2` }
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                showRelation(data);
                showHistory();
                openSearchBar();
                openSearchBar_relation();
                openSearchBar_histroy();
            })
            .catch((error) => console.log("error:" + error));
    }
    else {
        if (historyList.length !== 0) {
            showHistory();
            openSearchBar();
            openSearchBar_histroy();
        }
    }
})

searchInput.addEventListener('keydown', enterKey);

// e.target이 searchWrapper면 검색창을 유지하고, 그 외의 요소들이면 검색창 닫는 이벤트
body.addEventListener('click', e => {
    if (e.target === searchBar || e.target.parentNode === searchBar) return;
    else closeSearchBar();
});
