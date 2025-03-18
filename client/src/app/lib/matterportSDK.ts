export function connect(showcaseWindow: Window) {
  return new Promise((resolve, reject) => {
    showcaseWindow.MP_SDK.connect().then((mpSdk) => {
      resolve(mpSdk);
    }).catch((error) => {
      reject(error);
    });
})};