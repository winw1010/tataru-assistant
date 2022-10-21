'use strict';

// get API
function getAPI(name) {
    return window?.myAPI?.[name];
}

// on document ready
function onDocumentReady(callback = () => {}) {
    document.onreadystatechange = () => {
        if (document.readyState === 'complete') {
            callback();
        }
    };
}
