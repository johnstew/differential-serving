function wait(time = 500) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ fake: 'json' });
    }, time);
  });
}

(async () => {
  const codeType = ESM_BUILD ? 'ESM' : 'ES5';
  try {
    const fakeRes = await wait();
    console.log(fakeRes);
    const el = document.createElement('div');
    el.innerHTML = `${codeType} JS`;
    document.getElementById(`root-${codeType.toLowerCase()}`).appendChild(el);
  } catch (error) {
    console.error(error);
  }
})();
