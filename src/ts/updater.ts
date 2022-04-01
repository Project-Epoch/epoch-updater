export enum UpdateState {
    NONE,
    INITIALISING,
    RETRIEVING_MANIFEST,
    VERIFYING_FILES,
    DOWNLOADING,
    DONE,
};

export class Updater {
    private state: UpdateState = UpdateState.INITIALISING;

    constructor() {
        this.onStateChanged(UpdateState.NONE, this.getState());
    }

    private onStateChanged(old: UpdateState, latest: UpdateState) {

    }

    public setState(state: UpdateState): Updater {
        let original = this.getState();
        this.state = state;
        this.onStateChanged(original, state);

        return this;
    }

    public getState(): UpdateState {
        return this.state;
    }
}

export const UpdateManager = new Updater();