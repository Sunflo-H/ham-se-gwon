var promise1 = function () {

    return new Promise(function (resolve, reject) {

        // 여기에서는 무엇인가 수행 

        // 50프로 확률로 resolve 
        if (+new Date() % 2 === 0) {
            resolve("Stuff worked!");
        }
        else {
            reject(Error("It broke"));
        }
    });
};

var _promise = new Promise(function (resolve, reject) {

    // 여기에서는 무엇인가 수행 

    // 50프로 확률로 resolve 
    if (+new Date() % 2 === 0) {
        resolve("Stuff worked!");
    }
    else {
        reject(Error("It broke"));
    }
});
_promise.then(console.log).catch(console.log);
promise1().then(console.log).catch(console.log);