// 생성자 함수 정의
function Geocoder(name) {
    this.name = name;
    this.print = function() {
        console.log("a출력");
    }
    this.hardfunc = function(text, callback) {
        console.log(text);
        console.log(callback);
        callback("하이");
        a();
    }

    console.log("hi");
}

let test = new Geocoder("이름");

console.log(test);
console.log(Geocoder);

function callback (result) {
    console.log(result);
}

// test.hardfunc("이건 텍스트", callback);