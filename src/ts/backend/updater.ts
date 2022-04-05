import { WindowManager } from "./window";

/**
 * The various States of the Updater Process.
 */
export enum UpdateState {
    NONE = 'none',
    SETUP = 'setup',
    GET_MANIFEST = 'get-manifest',
    VERIFYING_INTEGRITY = 'verifying-integrity',
    DOWNLOADING = 'downloading',
    DONE = 'done',
}

/**
 * Centralised class to handle the Updating Process.
 */
export class Updater {
    private currentState: UpdateState;

    constructor() {
        this.currentState = UpdateState.NONE;
    }

    /**
     * Sets the latest Updater State and fires it to the Frontend.
     * @param state The new state.
     */
    setState(state: UpdateState) {
        this.currentState = state;

        this.refresh();
    }

    /**
     * Forces a Frontend "Refresh" of the Update State by just sending it.
     */
    refresh() {
        WindowManager.get().webContents.send('update-state-changed', this.getState());
    }

    /**
     * Gets our current Update State.
     */
    getState(): UpdateState {
        return this.currentState;
    }
}

/**
 * Constant instance of the Updater Class.
 */
export const UpdateManager = new Updater();