const bootstrap = require('bootstrap')
import './scss/app.scss';
import "@fortawesome/fontawesome-free/js/all";

/** Enable Tooltips */
let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
tooltipTriggerList.map(function (tooltipTriggerEl: any) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

/** Close Button. */
const closeButton = document.getElementById('window-close');
closeButton.addEventListener('click', () => {
    window.windowAPI.close();
});

/** Minimize Button. */
const minimizeButton = document.getElementById('window-minimize');
minimizeButton.addEventListener('click', () => {
    window.windowAPI.minimize();
});