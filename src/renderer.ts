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

/** Navigation Links. */
[].slice.call(document.querySelectorAll('.link-open-external')).map(function (navLink: HTMLElement) {
    navLink.addEventListener('click', (navLinkClicked));
});

/** When a navigation link is clicked. Pass to Main via IPC. */
function navLinkClicked(this: HTMLElement, ev: Event) {
    ev.preventDefault();    
    window.navigationAPI.open(this.getAttribute('href'));
}