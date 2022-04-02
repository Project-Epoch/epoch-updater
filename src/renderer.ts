const bootstrap = require('bootstrap')
import './scss/app.scss';
import "@fortawesome/fontawesome-free/js/all";

/** Enable Tooltips */
let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
tooltipTriggerList.map(function (tooltipTriggerEl: any) {
    console.log(tooltipTriggerEl);

    return new bootstrap.Tooltip(tooltipTriggerEl);
});

