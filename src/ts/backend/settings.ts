import Store, { Schema } from 'electron-store';

/** Needed to give TS hinting. Define settings and type here. */
interface SettingStructure {
    clientDirectory: string;
}

/** Actually create the Structure and assign defaults. */
const schema: Schema<SettingStructure> = {
    clientDirectory: {
        type: 'string',
        default: '',
    },
};

/** Create Wrapper Class. */
export class Settings {
    private store: Store<SettingStructure>;

    constructor() {
        this.store = new Store<SettingStructure>({ 
            schema: schema,
        });
    }

    storage() {
        return this.store;
    }
}

/** Create an Instance of our Wrapper. */
export const SettingsManager = new Settings();