import './scss/app.scss';
import "@fortawesome/fontawesome-free/js/all";
import { Navigation } from './ts/frontend/navigation';
import { Window } from './ts/frontend/window';
import { Updating } from './ts/frontend/updating';

/**
 * Initialise our frontend elements.
 */
new Navigation;
new Window;
new Updating;