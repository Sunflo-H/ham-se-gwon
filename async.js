function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getApple() {
    await delay(3000);
    return 'apple';
}

async function getBanana() {
    await delay(3000);
    return 'banana';
}

async function pick() {
    const applePromise = getApple();
    const bananaPromise = getBanana();
    const a = await applePromise;
    const b = await bananaPromise;
    console.log(a,b);
    const apple = await getApple();
    console.log(apple);
    const banana = await getBanana();
    console.log(banana);

    return `${apple} + ${banana}`;
}

pick().then(console.log);

function pickAll() {
    return Promise.all([getApple(), getBanana()])
    .then(fruits => fruits.join(' - '));
}

pickAll().then(console.log);