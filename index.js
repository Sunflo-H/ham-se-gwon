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
geocoder.addressSearch('서울 광진구 구의동', addressSearchCallback);

/*
    geocoder.addressSearch('주소', callback함수);
    주소를 입력하면 주소에 맞는 위치 정보를 찾는다.
    찾은 위치 정보를 result로 callback함수의 인자로 전달한다.
    그럼 나는 callback으로 데이터를 다루면 되는거네

*/

function addressSearchCallback(result, status) {
    if(status === kakao.maps.services.Status.OK) {
        console.log(result[0].y, result[0].x);
    }
}


// locationSearch().then(result => {
    //     console.log("작업이 끝났어요");
    //     console.log(mapLocation);
    // });
    

    




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
    
})