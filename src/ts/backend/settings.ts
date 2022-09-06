import Store, { Schema } from 'electron-store';

/**
 * Create our Settings Structure with explicit types for TS.
 */
interface SettingStructure {
    clientDirectory: string;
    environment: string;
    key: string;
}

/**
 * Actually create the Settings Store Structure and assign defaults.
 */
const schema: Schema<SettingStructure> = {
    clientDirectory: {
        type: 'string',
        default: '',
    },
    environment: {
        type: 'string',
        default: 'production',
    },
    key: {
        type: 'string',
        default: '',
    },
};

/**
 * Create Wrapper Class.
 */
export class Settings {
    private store: Store<SettingStructure>;

    constructor() {
        this.store = new Store<SettingStructure>({ 
            schema: schema,
        });
    }

    /**
     * Reference to electron-store.
     * @returns The electron-store instance.
     */
    storage(): Store<SettingStructure> {
        return this.store;
    }
}

/**
 * Create an Instance of our Wrapper.
 */
export const SettingsManager = new Settings();