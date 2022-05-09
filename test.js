const clientId = '52MEPfyQEOsllY4hi_HX';
const clientSecret = 'aHihsv5B0Q';

fetch('https://openapi.naver.com/v1/datalab/search', {
    method: 'POST',
    // credentials:'same-origin',
    headers: {
        'Host': 'openapi.naver.com',
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        'startDate': '2017-01-01',
        'endDate': '2017-04-30',
        'timeUnit': 'date',
        'keywordGroups': [
            { 'groupName': '한글', 'keywords': ['한글', 'korean'] },
            { 'groupName': '영어', 'keywords': ['영어', 'english'] }],
        'device': 'pc', 
        'ages': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
        'gender': ['f', 'm']
    })

})
    .then((response) => response.json())
    .then((data) => console.log(data));

