define([
  './utils.js'
], function(utils) {

  function getToken() {
		const executeCallbackObject = (callback) => ({
		  iopub: {
		    output: (data) => {
		      data.content.text ? callback(data.content.text) : null
		    }
		  }
		});
		return new Promise((resolve, reject) => {
		  Jupyter.notebook.kernel.execute(
		    '!curl "http://metadata.google.internal/computeMetadata/v1/instance/attributes/keep_alive_token" -H "Metadata-Flavor: Google"',
		    executeCallbackObject(output => resolve(output))
		  );
		});
	}

  function getUdacityUser(token) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "https://nebula.udacity.com/api/v1/remote/me");
      xhr.setRequestHeader("Authorization", "Star " + token);
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(JSON.parse(xhr.response));
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  }
        
  // Stub function, in Udacity usage we use a Udacity id instead.
  const udacityUser = {
    getUser: () => {
      return getToken().then(token => getUdacityUser(token));
    },
    setCocoEnvironment: () => {
      udacityUser.getUser()
      .then(user => {
        user.coco && $('#graffiti-setup-button').css('display', 'inline-block');
      })
      .catch(err => console.error(err));
    }
  }

  return udacityUser;
});
