function wait(time = 500) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ fake: 'json' });
    }, time);
  });
}

(async () => {
  console.log('Hot new ESM JavaScript');
  try {
    const fakeRes = await wait();
    console.log(fakeRes);
    const esmEl = document.createElement('div');
    esmEl.innerHTML = 'ESM JS';
    document.getElementById('root-esm').appendChild(esmEl);
  } catch (error) {
    console.error(error);
  }
})();
