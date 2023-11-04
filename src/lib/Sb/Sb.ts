import type { SbLook } from "$lib/Looks";
import { Cracks } from "./Cracks";
import { SubstrateRenderer } from "./SubstrateRenderer";
import { Zone } from "./Zone";


export type SbCfg = {
    seed: string,
    w: number, // canvas width
    h: number, // canvas height

    on_frame: () => void,
    on_done: () => void,

    look: SbLook,
}

export class Sb {

    #zones: Zone;
    #cracks: Cracks;
    #renderer: SubstrateRenderer;

    #started = false;
    #progress = 0;
    #runtime = { acc: 0, t0: 0 };

    readonly width: number;
    readonly height: number;

    constructor( cfg: SbCfg ) {
        this.width = cfg.w;
        this.height = cfg.h;

        this.#zones = new Zone({
            seed: cfg.seed,
            w: cfg.w,
            h: cfg.h,

            look: cfg.look.zone,
        });

        this.#cracks = new Cracks({
            seed: cfg.seed,
            w: cfg.w,
            h: cfg.h,

            zones: this.#zones,

            look: cfg.look.cracks,
        });

        this.#renderer = new SubstrateRenderer({
            seed: cfg.seed,
            w: cfg.w,
            h: cfg.h,

            zones: this.#zones,
            cracks: this.#cracks,

            look: cfg.look.lines,
        });

        this.#renderer.on_frame = () => {
            this.#progress = this.#cracks.placed_pixels / this.#cracks.placed_pixels_max;
            cfg.on_frame();
        }
        this.#renderer.on_done = () => {
            this.#runtime.acc += this.#runtime.t0 ? (Date.now() - this.#runtime.t0) : 0;
            this.#runtime.t0 = 0;
            cfg.on_frame();
        }
    }

    get canvases(): HTMLCanvasElement[] {
        return [
            this.#renderer.bg_canvas,

            ... this.#zones.canvases,

            this.#renderer.canvas,
        ];
    }

    get started() {
        return this.#started;
    }
    get is_running() {
        return this.#renderer.is_running;
    }
    get progress() {
        return this.#progress;
    }
    get done() {
        return this.#cracks.done;
    }

    get active_cracks() {
        return this.#cracks.active_cracks;
    }
    get max_cracks() {
        return this.#cracks.max_cracks;
    }

    get runtime() {
        return this.#runtime.acc + (this.#runtime.t0 ? (Date.now() - this.#runtime.t0) : 0);
    }

    run() {
        if (this.#renderer.is_running) return;
        if (this.#cracks.done) return;

        this.#started = true;
        this.#runtime.t0 = Date.now();

        this.#renderer.run();
    }
    pause() {
        if (!this.#renderer.is_running) return;
        if (this.#cracks.done) return;

        this.#runtime.acc += this.#runtime.t0 ? (Date.now() - this.#runtime.t0) : 0;
        this.#runtime.t0 = 0;

        this.#renderer.pause();
    }


}
