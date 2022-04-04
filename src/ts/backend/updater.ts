import { WindowManager } from "./window";

export enum UpdateState {
    NONE,
    SETUP,
    GET_MANIFEST,
    VERIFYING_INTEGRITY,
    DOWNLOADING,
    DONE,
}

export class Updater {
    private currentState: UpdateState;

    constructor() {
        this.currentState = UpdateState.NONE;
    }

    setState(state: UpdateState) {
        this.currentState = state;

        WindowManager.get().webContents.send('update-state-changed', state);
    }
}

export const UpdateManager = new Updater();