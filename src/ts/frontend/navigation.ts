const bootstrap = require('bootstrap');

/**
 * A centralised place to handle the Frontend aspect of the Navigation Menu.
 */
export class Navigation {
    constructor() {
        /** Enable Tooltips */
        let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        tooltipTriggerList.map(function (tooltipTriggerEl: any) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        /** Navigation Links - Register Click Event. */
        [].slice.call(document.querySelectorAll('.link-open-external')).map(function (navLink: HTMLElement) {
            navLink.addEventListener('click', (onNavLinkClicked));
        });

        /** When a navigation link is clicked. Pass to Main via IPC. */
        function onNavLinkClicked(this: HTMLElement, ev: Event) {
            ev.preventDefault();    
            window.navigationAPI.open(this.getAttribute('href'));
        }
    }
}