import './scss/app.scss';
import "@fortawesome/fontawesome-free/js/all";
import { Navigation } from './ts/frontend/navigation';
import { Window } from './ts/frontend/window';
import { Settings } from './ts/frontend/settings';
import { Updating } from './ts/frontend/updating';
import { Slides } from './ts/frontend/slides';

/**
 * Initialise our frontend elements.
 */
new Navigation;
new Window;
new Settings;
new Updating;
new Slides;