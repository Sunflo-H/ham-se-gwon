const HISTORY_LIST_MAX_LENGTH = 5;
const RADIUS = {
    LV1: 5000,
    LV2: 10000,
    LV3: 15000,
    LV4: 20000
}

const searchInput = document.querySelector('.search-bar input[type=text]');
const searchBar = document.querySelector('.search-bar');
const body = document.querySelector('body');
const searchIcon = document.querySelector('.fa-search');
const relationAndHistoryContainer = document.querySelector('.relationAndHistory-container');
const historyContainer = document.querySelector('.history-container');
const relationContainer = document.querySelector('.relation-container');
const categories = document.querySelectorAll('.category');
const categoryCircles = document.querySelectorAll('.category-circle');
const aroundTitle = document.querySelector('.around-title > span');

let map;
let historyList = [];
let markerList = [];
let numberMarkerList = [];
let overlay;
let searchbarIsOpen = false;
let polylineList = [];

function panTo(lat, lng) {
    // 지도 중심을 부드럽게 이동시킵니다
    // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
    map.panTo(new kakao.maps.LatLng(lat, lng));
}


// place data에 distance를 추가하여 반환하는 함수
function addDistanceData(placeList, color = 'none') {
    console.log("거리를 추가합니다.");
    placeList.forEach(place => {
        polyline = new kakao.maps.Polyline({
            map: map,
            path: [
                new kakao.maps.LatLng(place.y, place.x),
                map.getCenter()
                // 센터말고 다른기준이 필요해
            ],
            strokeWeight: 2,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeStyle: 'dashed'
        });

        polylineList.push(polyline);

        let distance = Math.round(polyline.getLength());
        console.log("거리:", distance.length);
        place.distance = distance;
    })
}

function displaySearchList(placeList) {
    console.log("검색 리스트 보여주기 실행");

    const searchListContainer = document.querySelector('.searchList-container');
    const title = document.createElement('div');
    const ul = document.createElement('ul');

    while (searchListContainer.hasChildNodes()) {
        searchListContainer.removeChild(searchListContainer.firstChild);
    }

    title.classList.add('searchList-title');
    searchListContainer.appendChild(title);
    searchListContainer.appendChild(ul);

    // 검색 리스트 데이터의 이름을 클릭하면 실행되는 이벤트함수
    let placeNameClick = (e) => {
        let place = placeList.find(place => place.place_name === e.target.innerText)

        // 장소를 맵의 중앙으로 놓는다.
        panTo(place.y, place.x);

        // 장소의 오버레이를 연다.
        createNumberOverlay(place);
    }

    placeList.forEach((place, i) => {
        let number = i + 1;
        let listElement;

        if (place.place_name === undefined) { // 장소명이 undefined면 주소 검색입니다.
            let addressName = place.address_name;

            if (addressName === undefined) addressName = place.road_address;

            title.innerHTML = `주소<span class="list-count"> ${placeList.length}</span>`

            listElement = `<li>
                            <div class="nameAndAddress">
                                <div class="name"><span class="number">${number}</span><span>${addressName}<span></div>
                            </div> 
                        </li>`
        }
        else {
            let placeName = place.place_name;
            let address = place.address_name;
            let roadAddress = place.road_address_name;
            let distance = place.distance;

            if (distance.length < 4) {
                distance = place.distance + 'm'
            }
            else {
                distance = Math.round(distance / 100) / 10 + 'km'
            }

            title.innerHTML = `장소<span class="list-count"> ${placeList.length}</span>`

            listElement = `<li>
                            <div class="nameAndAddress">
                                <div class="name"><span class="number">${number}</span><span>${placeName}<span></div>
                                <div class="roadName-address">${roadAddress}</div>
                                <div class="region-address">(지번) ${address}</div>
                            </div> 
                            <div class="distance">${distance}</div>
                            </li>`
            // <div class="pathfinder-button"> 길찾기 </div> 
        }
        ul.insertAdjacentHTML('beforeend', listElement);

    })
    const names = document.querySelectorAll('.nameAndAddress .name');

    names.forEach(name => {
        name.addEventListener('click', placeNameClick);
    })
}

function categoryIsActive() { 
    let result = {
        state: false,
        index: ''
    };

    categoryCircles.forEach((circle, i) => {
        if (circle.lastElementChild.classList.contains('category-active')) {
            result.state = true;
            result.index = i;
        }
    })

    return result;
}

function aroundSearch(e) {
    console.log("카테고리를 눌렀습니다. 해당 카테고리로 주변 탐색을 실행합니다.");
    let places = new kakao.maps.services.Places();
    let category = e.currentTarget.parentNode.getAttribute('data-category');


    // 카테고리 검색 결과를 받을 콜백 함수
    let callback = function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            console.log(result);
            createMarkerByCoords(map.getCenter().Ma, map.getCenter().La);
            createNumberMarker(result);
            displaySearchList(result);
            // polylineList.forEach(polyline => polyline.setMap(null));
            // addDistanceData(result, '#FF00FF');
        }
    };

    // 공공기관 코드 검색, 찾은 placeList는 callback으로 전달한다.
    places.categorySearch(category, callback, {
        location: map.getCenter()
    });
}

function displayMap(lat, lng) {
    console.log("현재 위치를 중심으로 맵을 띄웁니다.", lat, lng);
    const mapContainer = document.getElementById('map'); // 지도를 표시할 div 
    let mapOption = {
        center: new kakao.maps.LatLng(lat, lng), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
    };
    map = new kakao.maps.Map(mapContainer, mapOption);

    kakao.maps.event.addListener(map, 'click', () => {
        if (overlay !== undefined) removeOverlay();
    });

    kakao.maps.event.addListener(map, 'rightclick', (mouseEvent) => {
        var latlng = mouseEvent.latLng;
        console.log(latlng);
    });


}

// * 마커와 오버레이 관련 함수들
//좌표 정보만으로 마커를 한개만 생성한다. (내 좌표로 마커띄울때, 주변탐색시 중앙좌표에 마커띄울때 사용)
function createMarkerByCoords(lat, lng) {
    console.log("좌표로 마커 생성 실행");
    let position = new kakao.maps.LatLng(lat, lng);
    let marker = new kakao.maps.Marker({
        map: map,
        position: position,
    });

    // 마커에 클릭 이벤트를 적용합니다.
    kakao.maps.event.addListener(marker, 'click', () => createOverlay(marker));

    removeMarker();
    removeOverlay();

    // 생성한 마커를 마커 배열에 넣습니다.
    markerList.push(marker);
}

// 검색, 주변탐색에 사용되는 숫자 마커를 생성하는 함수
function createNumberMarker(placeList) {
    removeNumberMarker();
    console.log("숫자 마커 생성");

    placeList.forEach((place, index) => {
        let position = new kakao.maps.LatLng(place.y, place.x);
        let imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png' // 마커 이미지 url, 스프라이트 이미지
        let imageSize = new kakao.maps.Size(36, 37)  // 마커 이미지의 크기

        let imgOptions = {
            spriteSize: new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
            spriteOrigin: new kakao.maps.Point(0, (index * 46) + 10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
            offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        }

        let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions)

        let numberMarker = new kakao.maps.Marker({
            map: map,
            position: position, // 마커의 위치
            image: markerImage
        });

        numberMarkerList.push(numberMarker);
        kakao.maps.event.addListener(numberMarker, 'click', () => createNumberOverlay(place));
    })
}


// 기본 마커에 적용되는 커스텀 오버레이를 만드는 함수 입니다.
function createOverlay(marker) {
    removeOverlay();
    console.log("기본 오버레이 생성");

    //geocoder.coord2Address 에 사용될 콜백함수 정의
    let callback = (data) => {
        let title;
        let addr = data[0].address.address_name;
        let position = marker.getPosition();
        let content;


        if (data[0].road_address === null) { // 지번 데이터만 존재할 경우
            title = addr;
            content = `<div class="overlay overlay-region">
                                <div class="title">${title}</div>
                           </div>`;
            overlay = new kakao.maps.CustomOverlay({
                map: map,
                clickable: true,
                content: content,
                position: position,
                xAnchor: 0.5,
                yAnchor: 2.3, // 높을수록 위로 올라감
                zIndex: 1
            });
        }
        else { // 도로명 데이터가 존재할 경우
            title = data[0].road_address.address_name;
            content = `<div class="overlay overlay-road">
                            <div class="title">${title}</div>
                            <div class="region">(지번) ${addr}</div>
                       </div>`;
            overlay = new kakao.maps.CustomOverlay({
                map: map,
                clickable: true,
                content: content,
                position: position,
                xAnchor: 0.5,
                yAnchor: 1.8,
                zIndex: 1
            });
        }
    }
    // 주소-좌표 변환 객체를 생성합니다
    var geocoder = new kakao.maps.services.Geocoder();

    // 좌표로 법정동 상세 주소 정보를 요청합니다
    geocoder.coord2Address(marker.getPosition().La, marker.getPosition().Ma, callback);
}


//숫자 마커에 적용되는 오버레이입니다.
function createNumberOverlay(place) {
    removeOverlay();
    console.log(place);
    let { place_name, road_address_name, address_name, phone, place_url, distance } = place;
    let position = new kakao.maps.LatLng(place.y, place.x);

    content = `<div class="overlay overlay-number">
                    <div class="title">${place_name}</div>
                    <div class="roadName">${road_address_name}</div>
                    <div class="region">(지번) ${address_name}</div>
                    </div>`;
    // <div class="phoneAndDetailPage">
    //     <div class="phone">${phone}</div>
    // </div>
    // <div class="pathfinder">길찾기</div>

    //오버레이 생성
    overlay = new kakao.maps.CustomOverlay({
        map: map,
        clickable: true,
        content: content,
        position: position,
        xAnchor: 0.5,
        yAnchor: 1.32,
        zIndex: 1
    });

    //class detailPage 또는 title을 클릭하면 상세 페이지로 이동
    // kakao.maps.event.addListener(numberMarker, 'click', () => createNumberOverlay(place));
    const title = document.querySelectorAll('.overlay-number .title');
    let titleClick = (e) => {
        location.href = place_url;
    }
    title.forEach(title => {
        title.addEventListener('click', titleClick);
    })
}


function removeMarker() {
    markerList.forEach(marker => {
        marker.setMap(null);
    })
    markerList = [];
}

function removeNumberMarker() {
    numberMarkerList.forEach(numberMarker => {
        numberMarker.setMap(null);
    })
    numberMarkerList = [];
}

function removeOverlay() {
    if (overlay !== undefined) overlay.setMap(null);
}



// 앱의 초기단계에서 사용자의 위치를 받는 함수
function getUserLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject); // succes, error

    });
}

function error() {
    alert('Sorry, no position available.');
}

/**
 * & 검색 함수들 적용 설명
 * 값 입력 => getAddrList() or getRestList()로 자동완성에 사용할 데이터를 받아온다
 * {type, name} 객체를 Promise로 리턴한다.
 * 
 * 이렇게 얻은 Promise데이터를 displayRelation()함수를 실행하여 연관검색어로 보여준다. 
 * 
 * 연관검색어 클릭 => clickSearch() 실행 => 
 * 클릭한 데이터의 {type : 주소 또는 키워드}에 따라 각각 함수실행 searchByAddr(), searchByKeyword()
 * 
 * type이 키워드인 경우
 * 일단 현재 좌표 얻어와서 반경 내 검색
 * 없으면 전체 검색
 */
// ! 이 함수들 비동기함수로 변환될수 있대. 누르면 async await코드로 바뀜 공부하고 스스로 바꾸자
function getAddrList(keyword) {
    console.log("겟 어드레스 리스트");
    return fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${keyword}&size=5`, {
        headers: { Authorization: `KakaoAK 621a24687f9ad83f695acc0438558af2` }
    })
        .then(res => res.json())
        .then(data => {
            let list = [];
            //forEach 안의 data는 배열, data[0].address_name
            data.documents.forEach(data => {
                let obj = {
                    type: "address",
                    name: data.address_name
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
            const restList = data.results[0].items.filter(restaurant => restaurant.name.substring(0, keyword.length) === keyword);
            restList.forEach(data => {
                let obj = {
                    type: "restaurant",
                    name: data.name
                }
                list.push(obj);
            })
            return list;
        })
}

//* 검색창에 연관 검색어를 세팅하는 함수
function displayRelation(relationList) {
    console.log("릴레이션 세팅");
    console.log(relationList);
    const relationContainer = document.querySelector('.relation-container');
    while (relationContainer.hasChildNodes()) {
        relationContainer.removeChild(relationContainer.firstChild);
    }

    relationList.forEach(data => {
        let html = `<div class="relation" data-type=${data.type}>${data.name}</div>`
        relationContainer.insertAdjacentHTML('beforeend', html);
    });

    relationContainer.addEventListener('click', clickSearch);
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

function clickSearch(e) {
    console.log("리스트를 클릭해서 검색을 실행합니다.");
    console.log(e.target);
    const relation = e.target.innerText;
    const type = e.target.getAttribute("data-type");
    const currentLocationName = document.querySelector('.current-location');

    // ! clickSearch로 바꿈으로써 히스토리가 클릭되었을때도 생각해야되는 함수가 되었다.
    switch (type) {
        case "address":
            console.log("주소로 검색 분기");
            searchByAddr(relation)
                .then(placeList => {
                    panTo(placeList[0].y, placeList[0].x);
                    createNumberMarker(placeList);
                    displaySearchList(placeList);
                });
            break;
        case "restaurant":
            console.log("키워드로 검색 분기");
            searchByKeyword(relation)
                .then(placeList => {
                    panTo(placeList[0].y, placeList[0].x);
                    createNumberMarker(placeList);
                    displaySearchList(placeList);
                })
            break;
    }
    currentLocationName.innerText = relation;
}

//* 히스토리를 클릭하면 바로 검색결과 나타나게 하는 함수
function clickHistory(e) {
    const history = e.target.innerText;
    const currentLocation = document.querySelector('.current-location');

    searchByAddr(history);
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

// 주소를 입력하여 검색하는 함수입니다.
function searchByAddr(searchInput) {
    console.log("주소로 검색 실행");
    console.log("검색어 :", searchInput);
    // 주소-좌표 변환 객체를 생성합니다
    var geocoder = new kakao.maps.services.Geocoder();

    // 주소로 좌표를 검색합니다
    let placeList = new Promise((resolve, reject) => {
        geocoder.addressSearch(searchInput, (result, status) => {
            // 정상적으로 검색이 완료됐으면 
            if (status === kakao.maps.services.Status.OK) {
                console.log("주소로 검색 결과 : ", result);
                resolve(result);

            } else {
                console.log("검색 실패 주소가 아닙니다. reulst는 공백입니다.");
                resolve(result);
            }
        });
    })
    return placeList;
}

function searchByKeyword(searchInput) {
    console.log("키워드로 검색 실행합니다.");
    const lat = map.getCenter().Ma;
    const lng = map.getCenter().La;

    let placeList = fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?y=${lat}&x=${lng}&radius=${RADIUS.LV1}&query=${searchInput}`, {
        headers: { Authorization: `KakaoAK 621a24687f9ad83f695acc0438558af2` }
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("키워드로 검색 결과 :", data);
            if(data.documents.length === 0) alert("데이터가 없습니다.");
            return data.documents;
        })
        .catch((error) => console.log("error:" + error));
    console.log(placeList);
    return placeList;
}

//! 안쓰이는 함수인데 키워드 검색후 지도 범위 변경 때문에 남겨둔 코드
// 키워드 검색 완료 시 호출되는 콜백함수 입니다 
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        //data = 객체 배열, 객체에서 x,y or address_name을 꺼내면 될듯
        console.log("주변에 데이터가 없을때 키워드로 다시 검색한 결과 : ", data);

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        var bounds = new kakao.maps.LatLngBounds();

        for (var i = 0; i < data.length; i++) {
            createNumberMarker(data[i]);
            // 좌표들을 더해 범위를 확장함
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
    }
}

function enterKey() {
    search();
    closeSearchBar();
}

function upKey() {
    // const end = searchInput.value.length;
    // searchInput.setSelectionRange(end, end);
    // searchInput.focus();

    const relationContainer = document.querySelector('.relation-container');
    let activeChild = relationContainer.lastElementChild;
    let isActive = false;

    for (let i = 0; i < relationContainer.childElementCount; i++) {
        if (activeChild.classList.contains('active') === true) {
            activeChild.classList.remove('active');

            if (activeChild.previousElementSibling !== null) {
                console.log("액티브가 있고 다음 자식이 있어요 다음 자식에게 액티브를 줍니다.");
                activeChild = activeChild.previousElementSibling;
                activeChild.classList.add('active');
                searchInput.value = activeChild.innerText;
            }
            else if (activeChild.previousElementSibling === null) {
                console.log("히스토리로 넘어가야 하는 상태");
            }

            isActive = true;
            return;
        } else {
            console.log("액티브가 없어요 다음 자식으로 옮깁니다.");
            activeChild = activeChild.previousElementSibling;
        }
    }

    if (isActive === false) {
        console.log("액티브가 없어서 마지막 자식에게 부여");
        activeChild = relationContainer.lastElementChild;
        activeChild.classList.add('active');
        searchInput.value = activeChild.innerText;
    }
}

function downKey() {
    const relationContainer = document.querySelector('.relation-container');
    let activeChild = relationContainer.firstElementChild;
    let isActive = false;
    for (let i = 0; i < relationContainer.childElementCount; i++) {
        if (activeChild.classList.contains('active') === true) {
            activeChild.classList.remove('active');
            if (activeChild.nextElementSibling !== null) {
                console.log("액티브가 있고 다음 자식이 있어요 다음 자식에게 액티브를 줍니다.");
                activeChild = activeChild.nextElementSibling;
                activeChild.classList.add('active');
                searchInput.value = activeChild.innerText;
            }
            else if (activeChild.nextElementSibling === null) {
                console.log("히스토리로 넘어가야 하는 상태");
            }

            isActive = true;
            return;
        } else {
            console.log("액티브가 없어요 다음 자식으로 옮깁니다.");
            activeChild = activeChild.nextElementSibling;
        }
    }
    if (isActive === false) {
        console.log("액티브가 없어서 첫번째 자식에게 부여");
        activeChild = relationContainer.firstElementChild;
        activeChild.classList.add('active');
        searchInput.value = activeChild.innerText;
    }
}

function mouseOver(e) {
    e.target.classList.add('active');
}

function mouseOut(e) {
    e.target.classList.remove('active');
}

function search() {
    // * searchInput의 이벤트중 엔터키가 눌렸을때 '현재 텍스트'로 검색하는 함수
    // keyup 이벤트라서 검색어 정보를 event.target으로는 불러올수 없기때문에
    // 연관검색어를 클릭하여 검색하는 기능과 엔터키를 눌러 검색하는 기능을 나누어서 만들었다.
    console.log("엔터로 검색 시작");
    Promise.all([searchByAddr(searchInput.value), searchByKeyword(searchInput.value)])
        .then(data => {
            //data[0], data[1]들은 배열(placeList)로 나오게끔 코드를 짰다. x,y 를 얻어 함수에 적용하면 된다.
            console.log(data);
            if (data[0].length === 0) {
                panTo(data[1][0].y, data[1][0].x);
                removeMarker();
                createNumberMarker(data[1]);
                displaySearchList(data[1]);
                if(categoryIsActive().state === true) closeCategory(categoryIsActive().index);
            }
            else {
                panTo(data[0][0].y, data[0][0].x);
                removeMarker();
                createNumberMarker(data[0]);
                displaySearchList(data[0]);
                if(categoryIsActive().state === true) closeCategory(categoryIsActive().index);
            }
        })
}

function categoryClick(e, index) {
    let isActive = categoryIsActive(); // return {활성화된게 있는지 여부, 활성화된 인덱스}

    removeNumberMarker();
    removeOverlay();

    if (isActive.state === true) {
        console.log("활성화 된 카테고리가 있습니다. 비활성화 합니다.");

        // 활성화된 카테고리가 존재하고, 클릭한 카테고리는 활성화가 아니라면 연다.
        if (e.currentTarget.lastElementChild.classList.contains('category-active') === false) {
            openCateogry(e.currentTarget);
            aroundSearch(e);
        }
        // 원래 활성화 되어있던 index의 카테고리는 닫는다.
        closeCategory(isActive.index);
    }
    else if (isActive.state === false) {
        console.log("활성화된 카테고리가 없습니다. 클릭한 카테고리를 활성화 합니다.");
        e.currentTarget.lastElementChild.classList.add('category-active');
        aroundSearch(e);
        if (e.currentTarget.lastElementChild.classList.contains('category-hover') === false) {
            openCateogry(e.currentTarget);
        }
    }
}

function init() {
    getUserLocation()
        .then(data => {
            let lat = data.coords.latitude; // 위도 (남북)
            let lng = data.coords.longitude; // 경도 (동서)
            displayMap(lat, lng);
            createMarkerByCoords(lat, lng);
        })
}
//* css를 조작하는 함수들은 여기에 정리 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
function closeSearchBar() {
    searchBar.style.borderRadius = "15px";
    relationAndHistoryContainer.classList.add('hide');
    historyContainer.classList.add('hide');
    relationContainer.classList.add('hide');

    searchbarIsOpen = false;
}

function openSearchBar() {
    relationAndHistoryContainer.classList.remove('hide');
    searchBar.style.borderRadius = "15px 15px 0px 0px";

    searchbarIsOpen = true;
}

function openSearchBar_relation() {
    relationContainer.classList.remove('hide');
}

function openSearchBar_histroy() {
    historyContainer.classList.remove('hide');
}

function categoryOpenAndClose() {
    const categoryContainer = document.querySelector('.category-container');
    const aroundTitle = document.querySelector('.around-title');
    const arrow = aroundTitle.querySelector('.fa-solid');
    const ul = document.querySelector('.searchList-container ul');
    console.log(ul);
    if (categoryContainer.style.height === '0px') {
        categoryContainer.style.height = '210px';
        arrow.style.transform = 'rotate(0deg)'
        if (ul !== null) ul.style.height = "310px";
    }
    else {
        categoryContainer.style.height = '0px';
        arrow.style.transform = 'rotate(-180deg)'
        if (ul !== null) ul.style.height = "510px";
    }
}

function categoryMouseEnter(e) {
    e.target.lastElementChild.classList.add('category-hover');
    e.target.style.color = 'white';
}

function categoryMouseLeave(e) {
    if (e.target.lastElementChild.classList.contains('category-active') === false) {
        e.target.lastElementChild.classList.remove('category-hover');
        e.target.style.color = 'black';
    }

}



function openCateogry(target) {
    target.lastElementChild.classList.add('category-hover');
    target.style.color = "white";
}
function closeCategory(i) {
    categoryCircles[i].lastElementChild.classList.remove('category-active');
    categoryCircles[i].lastElementChild.classList.remove('category-hover');
    categoryCircles[i].style.color = 'black';
}

//* 이벤트 리스너들 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

categoryCircles.forEach((circle, i) => {
    // 자식에게 이벤트가 전파되지 않는 enter와 leave를 사용
    circle.addEventListener('mouseenter', categoryMouseEnter);
    circle.addEventListener('mouseleave', categoryMouseLeave);
    circle.addEventListener('click', (e) => categoryClick(e, i));
})

aroundTitle.addEventListener('click', categoryOpenAndClose);

// 검색창에 값이 입력될 때마다 연관검색어, 히스토리를 보여주는 이벤트
// ! 아직 조정할 내용이 남아있다.
searchInput.addEventListener('keyup', e => {
    console.log("키가 눌렸습니다.");
    if (e.keyCode === 13) enterKey();
    else if (e.keyCode === 38) {
        if (searchbarIsOpen === true) upKey();
    }
    else if (e.keyCode === 40) {
        if (searchbarIsOpen === true) downKey();
    }
    else if (e.isComposing === false) return;
    else {
        //value가 공백이 되면 query에러가 발생하여 넣은 코드
        if (searchInput.value === '') return;

        const promise1 = getAddrList(searchInput.value);
        const promise2 = getRestList(searchInput.value);
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
                displayRelation(relationList);
                setHtmlHistory();
            }
        });
    }
})

searchInput.addEventListener('keydown', e => {
    if (e.keyCode === 38) e.preventDefault();
    else if (e.keyCode === 40) e.preventDefault();


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
                displayRelation(relationList);
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

relationAndHistoryContainer.addEventListener('mouseover', mouseOver);
relationAndHistoryContainer.addEventListener('mouseout', mouseOut);

// e.target이 searchWrapper면 검색창을 유지하고, 그 외의 요소들이면 검색창 닫는 이벤트
body.addEventListener('click', e => {
    if (e.target === searchBar || e.target.parentNode === searchBar) return;
    else closeSearchBar();
});

searchIcon.addEventListener('click', search);



init();