


(function () {
    window.addEventListener('keypress', (e) => {
        if(e.shiftKey && e.key === 'P'){
            document.getElementById('preload-all')?.click() ;
        }
    })
}());
  

