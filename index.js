let p = 1000;
let q = 2;
let total = p * q;
price = 2000;
console.log(`총 가격 ${total}원`);
const inputButton = document.querySelector('input[type=button]');

let addressPopup = ''; // 주소검색팝업창에서 얻은 주소 정보
let mapLocation = ''; // 주소로 검색한 지도상 위치
var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
        // mapTypeId : kakao.maps.MapTypeId.SKYVIEW
    };

// 지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption);
// 주소 검색 객체를 생성합니다.
var geocoder = new kakao.maps.services.Geocoder();
// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places();
// 장소 검색 옵션 객체
let coords = new kakao.maps.LatLng(37.566826, 126.9786567);

function a(address) {
    return new Promise((resolve, reject) => {
        geocoder.addressSearch(`${address}`, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
                let coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                map.setCenter(coords);

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

                resolve(result[0]);
            } else {
                const error = new Error();
                error.name = "stateIsNotOk";
                reject(error);
            }
        });
    })
}





function setMapType(maptype) {
    map.setMapTypeId(kakao.maps.MapTypeId[maptype]);
}

function addressSearchPopUp() {
    new daum.Postcode({
        oncomplete: function (data) {
            // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

            // 각 주소의 노출 규칙에 따라 주소를 조합한다.
            // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
            var addr = ''; // 주소 변수
            //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
            if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
                addr = data.roadAddress;
            } else { // 사용자가 지번 주소를 선택했을 경우(J)
                addr = data.jibunAddress;
            }
            addressPopup = addr;
            console.log(addressPopup);
        }
    }).open();
}

inputButton.addEventListener('click', () => {
    a('서울시 광진구 구의동')
        .then(console.log)
        .catch(console.log);
})
