if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js', { scope: '/' }).then((reg) => {
        console.log("SW registered. Scope is "+reg.scope);
      }).catch( (err) => {
        // reg failed :(
        console.error(`SW failed: ${err}`);
      });
    });
  }