export class MyUploadAdapter {
  constructor( loader, TOKEN) {
    // The file loader instance to use during the upload.
    console.log("your file has loaded");
    this.loader = loader;
    this.TOKEN = TOKEN;
  }

  // Starts the upload process.
  upload() {
    console.log("you have posted a file");
    return this.loader.file
    .then( file => new Promise( ( resolve, reject ) => {
      this._initRequest();
      this._initListeners( resolve, reject, file );
      this._sendRequest( file );
    } ) );
  }

  // Aborts the upload process.
  abort() {
    if ( this.xhr ) {
      this.xhr.abort();
    }
  }

  // Initializes the XMLHttpRequest object using the URL passed to the constructor.
  _initRequest() {
    const xhr = this.xhr = new XMLHttpRequest();
    // Note that your request may look different. It is up to you and your editor
    // integration to choose the right communication channel. This example uses
    // a POST request with JSON as a data structure but your configuration
    // could be different.
    xhr.open( 'POST', '/Susertranferfile?conversationid='+this.loader.conversationid+"&fileid="+this.loader.fileid, true );
    xhr.setRequestHeader("x-access-token", this.TOKEN.ACCESSTOKEN);
    xhr.timeout = 1000;
    xhr.responseType = 'json';
  }

  // Initializes XMLHttpRequest listeners.
  _initListeners( resolve, reject, file ) {
    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = `Couldn't upload file: ${ file.name }.`;

    xhr.addEventListener( 'error', () => reject( genericErrorText ) );
    xhr.addEventListener( 'abort', () => reject() );
    xhr.addEventListener( 'load', () => {
      const response = xhr.response;

      if ( !response || response.error ) {
        return reject( response && response.error ? response.error.message : genericErrorText );
      }
      console.log("response:", response);
      resolve(response);
    } );
    xhr.ontimeout = function (e) {
      // XMLHttpRequest timed out. Do something here.
      console.log("timeout...");
      resolve({message: "timeout"});
    };

    if ( xhr.upload ) {
      xhr.upload.addEventListener( 'progress', evt => {
        if ( evt.lengthComputable ) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      } );
    }
  }

  // Prepares the data and sends the request.
  _sendRequest( file ) {
    // Prepare the form data.
    const data = new FormData();
    data.append( 'filetoupload', file);

    // Send the request.
    this.xhr.send( data );
  }
}
