const inputButton = document.querySelector('input[type=button]');

let address = '';
let data = '';
var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
        // mapTypeId : kakao.maps.MapTypeId.SKYVIEW
};

// 지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption); 

var geocoder = new kakao.maps.services.Geocoder();
console.log(geocoder);

async function slow() {
    return new Promise((resolve,reject) => {
        geocoder.addressSearch('서울 광진구 구의동', callback); // 함수 실행    
    })
}

function callback(result, status) {
    if(status === kakao.maps.services.Status.OK) {
        console.log(result);
        data = result;
        console.log(data);
    }
}

function setMapType(maptype) {
     map.setMapTypeId(kakao.maps.MapTypeId[maptype]);
}
slow().then(() => {
    
});
console.log(data);


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
            address = addr;
            console.log(address);
        }
    }).open();
}

inputButton.addEventListener('click', () => {
    
})