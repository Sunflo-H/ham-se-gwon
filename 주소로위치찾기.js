var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
        // mapTypeId : kakao.maps.MapTypeId.SKYVIEW
};

var map = new kakao.maps.Map(mapContainer, mapOption); 

var geocoder = new kakao.maps.services.Geocoder();
let mapLocation = '아무값';
// geocoder.addressSearch('서울 광진구 구의동', addressSearchCallback);

function addressSearchCallback(result, status) {
    // 정상적으로 검색이 완료됐으면 
    if (status === kakao.maps.services.Status.OK) {

        var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

        // 결과값으로 받은 위치를 마커로 표시합니다
        var marker = new kakao.maps.Marker({
            map: map, // 추후 추가하려면 marker.setMap을 이용한다.
            position: coords
        });
        // 인포윈도우로 장소에 대한 설명을 표시합니다
        var infowindow = new kakao.maps.InfoWindow({
            content: `<div style="width:150px;text-align:center;padding:6px 0;">${result[0].address_name}</div>`
        });
        infowindow.open(map, marker);

        // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
        map.setCenter(coords);
        console.log(coords);
    }
}

// console.log(mapLocation);
// console.log(addressSearchCallback("hi","OK"));

function a() {
    // let location = '';
    return new Promise((resolve, reject) => {
        geocoder.addressSearch('서울 광진구 구의동', (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
    
                var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        
                // 결과값으로 받은 위치를 마커로 표시합니다
                var marker = new kakao.maps.Marker({
                    map: map, // 추후 추가하려면 marker.setMap을 이용한다.
                    position: coords
                });
        
                // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
                map.setCenter(coords);
                // console.log(coords);
                // location = coords;
                // console.log(location);
                resolve(result);
            }
        });
    })
}
a().then((resolve) => {
    console.log(resolve);
});

/* 사용법

map을 만들어주는거까지는 똑같아

geocoder.addressSearch()로 주소에 대한 정보를 받아와서 callback함수에 적용한다.
callback함수에서 주소 정보의 위도, 경도를 저장 var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
map.setCenter(위도,경도정보) 이렇게 지도에서 보여지는 맵의 위치를 바꾸면
기본적인것은 끝
*/
