module.exports = (TOKEN, xmlhttp) => {

  xmlhttp.Get_XMLHttpRequest = function (path, sendData) {

    // const d = new Date();

    return new Promise((resolve, reject) => {

      const xhr = new XMLHttpRequest();
      xhr.open('GET', path, true);
      xhr.timeout = 1200;
      xhr.responseType = 'json';
      const genericErrorText = "Couldn't Get data";
      // add listeners
      xhr.addEventListener('error', () => reject(genericErrorText));
      xhr.addEventListener('load', () => {
        const response = xhr.response;
        if (response && response.error) {
          console.log("response: ", response);
          reject(response && response.error ? response.error.message : genericErrorText);
        }
        // console.log(new Date() - d);
        resolve(response);
      });

      xhr.ontimeout = function (e) {
        console.log("timeout");
        // alert("timeout");
        resolve(null);
      };

      xhr.setRequestHeader("x-access-token", TOKEN.ACCESSTOKEN);
      xhr.send(sendData);

    }).catch(e => {
      console.log("Get_XMLHttpRequest error: ", e);
    });
  }

  xmlhttp.Post_XMLHttpRequest = function (path, formdata){

    return new Promise((resolve, reject) => {

      const xhr = new XMLHttpRequest();
      xhr.open('POST', path, true);
      xhr.responseType = 'json';
      xhr.timeout = 1000;
      const genericErrorText = "Couldn't upload data";
      // add listeners
      xhr.addEventListener('error', () => reject(genericErrorText));
      xhr.addEventListener('load', () => {
        const response = xhr.response;
        if (!response || response.error) {
          return reject(response && response.error ? response.error.message : genericErrorText);
        }
        resolve(response);
      });

      xhr.ontimeout = function (e) {
        console.log("timeout");
        resolve(null);
      };

      xhr.setRequestHeader("x-access-token", TOKEN.ACCESSTOKEN);
      xhr.send(formdata);
    });
  }
}
