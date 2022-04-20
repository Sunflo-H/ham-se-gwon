function increaseAndPrint(n) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const value = n + 1;
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
  
  increaseAndPrint(4).then((n) => {
    console.log('result: ', n);
  })