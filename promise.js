function increaseAndPrint(num) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const value = num + 1;
      if (value === 5) {
        const error = new Error();
        error.name = 'ValueIsFiveError';
        reject(error);
        return;
      }
      console.log(value);
      resolve(value);
    }, 1000);
  });
}

function increaseAndPrint2(num) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const value = num + 1;
      if (value === 5) {
        const error = new Error();
        error.name = 'ValueIsFiveError';
        reject(error);
        return;
      }
      console.log(value);
      resolve(value);
    }, 100);
  });
}

increaseAndPrint(1).then((result) => {
  console.log('result: ', result);
  return increaseAndPrint(3);
}).then((result) => {
  console.log('result', result);
})

increaseAndPrint2(0)
  .then(increaseAndPrint2)
  .then(increaseAndPrint2)
  .then(increaseAndPrint2)
  .then(increaseAndPrint2)
  .then(increaseAndPrint2)
  .catch(e => {
    console.log(e);
  })
