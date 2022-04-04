export class Updating {
    constructor() {
        window.updaterAPI.onStateChanged(this.onStateChanged);
    }

    /**
     * Fires when the Updating State is adjusted by 
     * the backend.
     * @param state The new state.
     */
    private onStateChanged(state: string) {
        console.log('Frontend - State Changed: ' + state);
    }
}