import { hide, show } from "./helpers";

export class Updating {
    private initButton: HTMLElement;
    private installButton: HTMLElement;
    private updateButton: HTMLElement;
    private playButton: HTMLElement;

    constructor() {
        document.addEventListener('DOMContentLoaded', () => { 
            /** Button References. */
            this.initButton = document.getElementById('initialising-button');
            this.installButton = document.getElementById('install-button');
            this.updateButton = document.getElementById('update-button');
            this.playButton = document.getElementById('play-button');
        });

        /** Register Callbacks. */
        window.updaterAPI.onStateChanged((state) => { this.onStateChanged(state); });
    }

    /**
     * Fires when the Updating State is adjusted by 
     * the backend.
     * @param state The new state.
     */
    onStateChanged(state: string) {
        console.log('onStateChanged');

        switch (state) {
            case 'setup':
                this.onSetupState();
                break;
        
            default:
                console.log(`Frontend - Unexpected State: ${state}`);
                break;
        }
    }

    onSetupState() {
        console.log('onSetupState');

        show(this.installButton);
        hide(this.initButton);
        hide(this.updateButton);
        hide(this.playButton);
    }
}