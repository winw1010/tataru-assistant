'use strict';
/* eslint-disable */

// get API
function getAPI(name) {
    return window?.myAPI?.[name];
}

// on document ready
function onDocumentReady(callback = () => {}) {
    document.addEventListener('readystatechange', () => {
        if (document.readyState === 'complete') {
            callback();
        }
    });
}
