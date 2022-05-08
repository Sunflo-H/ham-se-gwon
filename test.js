const ul = document.querySelector(".pop_rel_keywords");
const searchInput = document.querySelector(".search_input");
const relContainer = document.querySelector(".rel_search");

const checkInput = () => {
    const beforeInput = searchInput.value;
    timer(beforeInput);
}

const timer = (beforeInput) => {
    setTimeout(() => {

        if (searchInput.value === beforeInput) {
            console.log("입력멈춤");
            loadData(searchInput.value);		// 0.5초 내에 입력창이 변했다면 데이터 로드
            checkInput();

        } else {
            console.log("입력변함");
            checkInput();
        }

        if (searchInput.value === "") {		// 입력창이 비었다면 추천 검색어 리스트 숨김
            relContainer.classList.add("hide");
        } else {
            relContainer.classList.remove("hide");
        }
    }, 500);
}

const loadData = (input) => {
    const url = `https://completion.amazon.com/... 중략...prefix=${input}&event=onFocusWithSearchT`;
    // 매개변수 input 값에 따라 서버에서 해당 검색어와 연관된 추천검색어가 담긴 데이터가 불러와진다.

    if (cache === url) return;	// 이전에 부른 데이터랑 다를 때만 fetch로 데이터를 새로 불러온다.
    else {
        cache = url;
        fetch(url)
            .then((res) => res.json())
            .then(res => fillSearch(res.suggestions))
    }
}

const fillSearch = (suggestArr) => {
    ul.innerHTML = "";
    suggestArr.forEach((el, idx) => {
      const li = document.createElement("li");
      li.innerHTML = el.value;
      ul.appendChild(li);
    }) 
  }