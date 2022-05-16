const HISTORY_LIST_MAX_LENGTH = 5;
const ADMINISTRATIVE_DISTRICT = ['서울특별시', '대구광역시', '광주광역시', '울산광역시', '경기도', '충청북도', '전라북도', '경상북도', '제주특별자치도', '부산광역시', '인천광역시', '대전광역시', '세종특별자치시', '강원도', '충청남도', '전라남도', '경상남도'];

const searchInput = document.querySelector('.search-bar input[type=text]');
const searchBar = document.querySelector('.search-bar');
const body = document.querySelector('body');

let historyList = [];



/**
 * setMap(lat, lng) : 좌표를 받아 지도를 만듬 , 좌표는 지도의 center
 * setMarker({map, lat, lng}) : 좌표를 받아 마커를 지도에 띄움
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

function setMarker(data) {
    const { map, lat, lng } = data;
    var coords = new kakao.maps.LatLng(lat, lng);
    var marker = new kakao.maps.Marker({
        position: coords
    });

    marker.setMap(null);
    marker.setMap(map);
}

function setMarker_addr() {

}

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
            // setHtmlRelation(data);
            // setHtmlHistory();
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

/**
 ** 검색 함수들 적용 순서
 * 값 입력 => getAddrList() or getRestList()로 데이터를 받아와 type와 name의 객체를 Promise로 리턴
 * 이렇게 얻은 Promise데이터를 연관검색어로 보여준다. setHtmlRelation()
 * 
 * 연관검색어 클릭 => clickRelation() 실행 => 클릭한 데이터의 type에 따라 각각 함수실행 findCoordsByAddr(), findCoordsByKeyword()
 */
// ! 이 함수들 비동기함수로 변환될수 있대. 누르면 async await코드로 바뀜 공부하고 스스로 바꾸자
function getAddrList(keyword) {
    return fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${keyword}&size=5`, {
        headers: { Authorization: `KakaoAK 621a24687f9ad83f695acc0438558af2` }
    })
        .then(res => res.json())
        .then(data => {
            let list = [];
            //forEach 안의 data는 배열, data[0].address_name
            data.documents.forEach(data => {
                let obj = { 
                    type : "address" ,
                    name : data.address_name
                }
                list.push(obj);
            })
            return list;
        });
}
function getRestList(keyword) {
    return fetch('/data/restaurant.json')
        .then(res => res.json())
        .then(data => {
            let list = [];
            // let restList = data.result[0].items; // restList[index].name
            const restList = data.results[0].items.filter(restaurant => restaurant.name.substring(0, keyword.length) === keyword);
            restList.forEach(data => {
                let obj = {
                    type : "restaurant",
                    name : data.name
                }
                list.push(obj);
            })
            return list;
        })
}

//* 검색창에 연관 검색어를 세팅하는 함수
function setHtmlRelation(relationList) {
    const relationContainer = document.querySelector('.relation-container');
    console.log(relationList);
    while (relationContainer.hasChildNodes()) {
        relationContainer.removeChild(relationContainer.firstChild);
    }

    relationList.forEach(data => {
        let html = `<div class="relation" data-type=${data.type}>${data.name}</div>`
        relationContainer.insertAdjacentHTML('beforeend', html);
    });

    relationContainer.addEventListener('click', clickRelation);
}


//* 검색창에 히스토리를 세팅하는 함수
function setHtmlHistory() {
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

//* 연관 단어를 클릭하면 바로 검색결과 나타나게 하는 함수
function clickRelation(e) {
    console.log("실행");
    console.log(e.target);
    const relation = e.target.innerText;
    const type = e.target.getAttribute("data-type");
    const currentLocation = document.querySelector('.current-location');

    switch (type) {
        case "address" : findCoordsByAddr(relation); break;
        case "restaurant" : findCoordsByKeyword(relation); break;
    }
    currentLocation.innerText = relation;
}

//* 히스토리를 클릭하면 바로 검색결과 나타나게 하는 함수
function clickHistory(e) {
    const history = e.target.innerText;
    const currentLocation = document.querySelector('.current-location');

    findCoordsByAddr(history);
    closeSearchBar();
    currentLocation.innerText = history;
}



function setHtmlHistoryList(history) {
    // 값이 중복이 아닐 경우 push , 배열이 이미 최대크기면 shift
    if (historyList.find(_history => history === _history) === undefined) {
        if (historyList.length === HISTORY_LIST_MAX_LENGTH) {
            historyList.shift();
        }

        historyList.push(history);
    }
}

function findCoordsByAddr(addr) {
    // 주소-좌표 변환 객체를 생성합니다
    var geocoder = new kakao.maps.services.Geocoder();

    // 주소로 좌표를 검색합니다
    let result = new Promise((resolve, reject) => {
        geocoder.addressSearch(addr, (result, status) => {
            // 정상적으로 검색이 완료됐으면 
            if (status === kakao.maps.services.Status.OK) {
                resolve(result);
            }
        });
    })

    result
        .then(data => {
            setHtmlHistoryList(addr);
            return setMap(data[0].y, data[0].x);
        })
        .then(data => setMarker(data));
}

function findCoordsByKeyword(keyword) {
    // 
    // 
    // 
    /**
     * 여러 데이터를 찾게 될텐데
     * 첫번째 데이터로 map.setCenter()를 정하고
     * 좌측에 모달만들어서 ~로 검색한 결과 글씨와 그 리스트를 띄워줘
     * 
     */

    // 장소 검색 객체를 생성합니다
    var ps = new kakao.maps.services.Places();

    // 키워드로 장소를 검색합니다
    ps.keywordSearch(keyword, placesSearchCB);
}

// 키워드 검색 완료 시 호출되는 콜백함수 입니다
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        console.log(data);
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        var bounds = new kakao.maps.LatLngBounds();

        for (var i = 0; i < data.length; i++) {
            // displayMarker(data[i]);
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        // map.setBounds(bounds);
    }
}

//* 지도에 마커를 표시하는 함수입니다
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
            setMarker(data);
        })
}


//* css를 조작하는 함수들 
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



// 주소로 검색 - 검색창에 값이 입력될 때마다 연관검색어, 히스토리를 보여주는 이벤트
searchInput.addEventListener('input', e => {
    if (e.target.value === '') return; //value가 공백이 되면 query에러가 발생하여 넣은 코드
    // if (e.target.value ===)
    const promise1 = getAddrList(e.target.value);
    const promise2 = getRestList(e.target.value);
    Promise.all([promise1, promise2]).then(data => {
        //! 이후 검색 데이터가 더 추가되면 그때 relationList에 배열을 합치는 코드를 바꿔주자
        //! 일단 이렇게 두개의 데이터만 두고 짜
        let relationList = data[0].concat(data[1]).slice(0, 10);
        if (relationList.length === 0) {
            closeSearchBar();
        } else {
            openSearchBar();
            openSearchBar_relation();
            openSearchBar_histroy();
            setHtmlRelation(relationList);
            setHtmlHistory();
        }

    });
    // fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${e.target.value}&size=5`, {
    //     headers: { Authorization: `KakaoAK 621a24687f9ad83f695acc0438558af2` }
    // })
    //     .then((response) => response.json())
    //     .then((data) => {
    //         if (data.documents.length !== 0 || historyList.length !== 0) {
    //             openSearchBar();
    //         } else {
    //             closeSearchBar();
    //         }
    //         openSearchBar_relation();
    //         openSearchBar_histroy();
    //         setHtmlRelation(data);
    //         setHtmlHistory();
    //     })
    //     .catch((error) => console.log("error:" + error));
})
// 키워드로 검색 - 검색창에 값이 입력될 때마다 연관검색어, 히스토리를 보여주는 이벤트
searchInput.addEventListener('input', e => {
    getUserLocation(findKeyword, e);
})

searchInput.addEventListener('click', e => {
    if (searchInput.value !== '') {
        const promise1 = getAddrList(e.target.value);
        const promise2 = getRestList(e.target.value);
        Promise.all([promise1, promise2]).then(data => {
            let relationList = data[0].concat(data[1]).slice(0, 10);
            if (relationList.length === 0) {
                closeSearchBar();
            } else {
                openSearchBar();
                openSearchBar_relation();
                openSearchBar_histroy();
                setHtmlRelation(relationList);
                setHtmlHistory();
            }
        })
    }
    else {
        if (historyList.length !== 0) {
            setHtmlHistory();
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

init();