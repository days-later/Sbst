import { browser } from "$app/environment";
import { Looks } from "./Looks";


class Cfg {

    _seed = $state( '12' );
    _supersample = $state( 1 );
    _look_index = $state( 0 );
    look = $derived( Looks[ this._look_index ] );

    supersample_options: ReadonlyArray<{ value: number, label: string }> = [
        { value: .25, label: 'x.25' },
        { value: .5, label: 'x.5' },
        { value: 1, label: 'x1' },
        { value: 2, label: 'x2' },
        { value: 4, label: 'x4' },
    ];

    constructor() {
        this.#load();

        if (browser) window.addEventListener( 'storage', e => {
            if (e.key===null || e.key===this.#ls_key) this.#load();
        });
    }

    get seed() { return this._seed; }
    get supersample() { return this._supersample; }
    get look_index() { return this._look_index; }

    set seed( seed: string ) {
        if (this._seed === seed) return;
        this._seed = seed;
        this.#save();
    }
    set supersample( supersample: number ) {
        if (this._supersample === supersample) return;
        this._supersample = supersample;
        this.#save();
    }
    set look_index( look_index: number ) {
        if (this._look_index === look_index) return;
        this._look_index = look_index;
        this.#save();
    }

    #ls_key = 'sb-app-cfg';
    #save() {
        if (!browser) return;

        const current = localStorage.getItem( this.#ls_key );
        const json = JSON.stringify({
            seed: this._seed,
            supersample: this._supersample,
            look_index: this._look_index,
        });
        if (current !== json) {
            localStorage.setItem( this.#ls_key, json );
        }
    }
    #load() {
        if (!browser) return;

        const json = localStorage.getItem( this.#ls_key );
        if (!json) return;

        try {
            const data = JSON.parse( json );
            if (!data) return;

            if (data.seed && typeof data.seed === 'string') {
                if (data.seed !== this._seed) this._seed = data.seed;
            }

            if (data.supersample && typeof data.supersample === 'number' && this.supersample_options.find( o => o.value === data.supersample )) {
                if (this._supersample !== data.supersample) this._supersample = data.supersample;
            }

            if (typeof data.look_index === 'number' && Looks[ data.look_index ]) {
                if (this._look_index !== data.look_index) this._look_index = data.look_index;
            }
        }
        catch {
            localStorage.removeItem( this.#ls_key );
            return;
        }
    }
}

export const cfg = new Cfg();
