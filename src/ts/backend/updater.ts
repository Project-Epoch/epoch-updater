import { app, net } from "electron";
import { WindowManager } from "./window";
import fs from 'fs';
import { ClientManager } from "./client";

/**
 * The various States of the Updater Process.
 */
export enum UpdateState {
    NONE = 'none',
    SETUP = 'setup',
    GET_MANIFEST = 'get-manifest',
    VERIFYING_INTEGRITY = 'verifying-integrity',
    UPDATE_AVAILABLE = 'update-available',
    DOWNLOADING = 'downloading',
    DONE = 'done',
}

interface PatchFiles {
    Path: string;
    Hash: string;
    Size: number;
    URL: string;
}

interface Manifest {
    Version: string;
    Files: Array<PatchFiles>;
}

/**
 * Centralised class to handle the Updating Process.
 */
export class Updater {
    private currentState: UpdateState;
    private manifestHost: string = 'updater.project-epoch.net';
    private version: string = '';
    private updatableFiles: Array<PatchFiles> = [];

    constructor() {
        this.currentState = UpdateState.NONE;

        /** Dev Mode - Use Local. */
        if (! app.isPackaged) {
            this.manifestHost = '127.0.0.1';
        }
    }

    getManifest() {
        const request = net.request({
            method: 'GET',
            protocol: app.isPackaged ? 'https:' : 'http:',
            hostname: this.manifestHost,
            path: '/api/manifest',
            redirect: 'error'
        });

        request.on('response', (response) => {
            response.on('data', (chunk) => {
                this.onManifestReceived(JSON.parse(chunk.toString()));
            });
        });

        request.on('finish', () => {
            console.log('Request is Finished')
        });

        request.on('abort', () => {
            console.log('Request is Aborted')
        });

        request.on('error', (error) => {
            this.onManifestFailure(error);
        });

        request.setHeader('Content-Type', 'application/json');
        request.end();
    }

    onManifestReceived(manifest: Manifest) {
        this.version = manifest.Version;
        this.checkIntegrity(manifest);
    }

    /**
     * Fired when getting the Manifest Fails.
     */
    onManifestFailure(error: Error) {

    }

    checkIntegrity(manifest: Manifest) {
        this.setState(UpdateState.VERIFYING_INTEGRITY);

        manifest.Files.forEach((value) => {
            let localPath = `${ClientManager.getClientDirectory()}\\${value.Path}`;

            /** Doesn't Exist. Just Download. */
            if (! fs.existsSync(localPath)) {
                this.updatableFiles.push(value);
                return;
            }
        });

        /** Need to download every file. Must be new. */
        if (this.updatableFiles.length === manifest.Files.length) {
            this.downloadUpdates();
            return;
        }

        /** Only some files. Must be an update. */
        this.setState(UpdateState.UPDATE_AVAILABLE);
    }

    downloadUpdates() {
        this.setState(UpdateState.DOWNLOADING);

        console.log(`Downloading ${this.updatableFiles.length} Files...`);

        this.updatableFiles.forEach((value) => {
            console.log(`Updating File: ${value.Path} - ${value.Hash}`);
        });
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