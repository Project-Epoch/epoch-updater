import { WindowManager } from "./window";

export enum UpdateState {
    NONE = 'none',
    SETUP = 'setup',
    GET_MANIFEST = 'get-manifest',
    VERIFYING_INTEGRITY = 'verifying-integrity',
    DOWNLOADING = 'downloading',
    DONE = 'done',
}

export class Updater {
    private currentState: UpdateState;

    constructor() {
        this.currentState = UpdateState.NONE;
    }

    setState(state: UpdateState) {
        this.currentState = state;

        console.log('Backend - Updating State: ' + state);

        WindowManager.get().webContents.send('update-state-changed', state);
    }

    getState(): UpdateState {
        return this.currentState;
    }
}

export const UpdateManager = new Updater();