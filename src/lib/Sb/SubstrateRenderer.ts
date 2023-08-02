import seedrandom from "seedrandom";
import type { Cracks, ICrack } from "./Cracks";
import type { Zone } from "./Zone";
import type { LinesLook } from "$lib/Looks";


type RendererCfg = {
    seed: string,
    w: number,
    h: number,

    zones: Zone,
    cracks: Cracks,

    look: LinesLook,
}

export class SubstrateRenderer {

    #zones: Zone;
    #cracks: Cracks;

    readonly bg_canvas: HTMLCanvasElement;
    readonly canvas: HTMLCanvasElement;
    #ctx: CanvasRenderingContext2D;

    #is_running = false;
    #next_frame: number | undefined;

    on_frame: () => void = ()=>{};
    on_done: () => void = ()=>{};

    #highlight_min_length_adjust = .1;
    #highlight_min_length: number;

    #look: LinesLook;
    #rng: (p: number) => boolean;

    constructor( cfg: RendererCfg ) {
        this.#zones = cfg.zones;
        this.#cracks = cfg.cracks;
        this.#look = cfg.look;

        this.bg_canvas = document.createElement( 'canvas' );
        this.bg_canvas.width = cfg.w;
        this.bg_canvas.height = cfg.h;
        const bgc_ctx = this.bg_canvas.getContext( '2d' )!;
        bgc_ctx.fillStyle = cfg.look.bg;
        bgc_ctx.fillRect( 0, 0, cfg.w, cfg.h );

        this.canvas = document.createElement( 'canvas' );
        this.canvas.width = cfg.w;
        this.canvas.height = cfg.h;
        this.#ctx = this.canvas.getContext( '2d' )!;

        const short_side = Math.min( cfg.w, cfg.w )
        this.#highlight_min_length = this.#highlight_min_length_adjust * short_side;

        const sr = seedrandom( cfg.seed );
        this.#rng = p => sr() < p;
    }

    get is_running() {
        return this.#is_running;
    }

    run() {
        if (this.#is_running || this.#cracks.done) return;
        this.#is_running = true;

        const ctx = this.#ctx;
        const cracks = this.#cracks;

        const styles = this.#look;

        let lines: Line[];

        const crackStep = (crack: ICrack, isDone: boolean) => {
            if (!isDone) {
                ctx.moveTo( crack.prev_pos[ 0 ], crack.prev_pos[ 1 ] );
                ctx.lineTo( crack.pos[ 0 ], crack.pos[ 1 ] );
            }
            else if (!cracks.straggle_time) {
                const p0 = crack.origin;
                const p1 = crack.prev_pos;
                const l = Math.sqrt( Math.pow( p0[0] - p1[0], 2 ) + Math.pow( p0[1] - p1[1], 2 ) );
                if (l >= this.#highlight_min_length) lines.push([ p0, p1 ]);
            }
        }

        let next_zone_render = 0;
        function set_next_zone_render() {
            if (next_zone_render < 6_000) next_zone_render += 1000;
            else if (next_zone_render < 20_000) next_zone_render += 2000;
            else if (next_zone_render < 30_000) next_zone_render += 5000;
            else if (next_zone_render < 50_000) next_zone_render += 10_000;
            else next_zone_render += 50_000;
        }

        let straggle_time = false;
        const step = () => {
            lines = [];

            ctx.beginPath();
            for (let i=0; i<8; i++) cracks.step( crackStep );

            let skip = false;

            if (straggle_time === false) {
                ctx.strokeStyle = styles.line.style;
                ctx.globalAlpha = styles.line.opacity
                ctx.lineWidth = styles.line.width;

                if (styles.line.chance === 0) skip = true;
                else if (styles.line.chance) skip = this.#rng( 1 - styles.line.chance );
            }
            else {
                ctx.strokeStyle = styles.straggler.style;
                ctx.globalAlpha = styles.straggler.opacity
                ctx.lineWidth = styles.straggler.width;

                if (styles.straggler.chance === 0) skip = true;
                else if (styles.straggler.chance) skip = this.#rng( 1 - styles.straggler.chance );
            }

            if (!skip) ctx.stroke();

            if (lines.length && styles.road.chance !== 0) {
                skip = false;
                if (styles.road.chance) skip = this.#rng( 1 - styles.road.chance );

                if (!skip) {
                    ctx.beginPath();
                    for (const l of lines) {
                        ctx.moveTo( l[ 0 ][ 0 ], l[ 0 ][ 1 ] );
                        ctx.lineTo( l[ 1 ][ 0 ], l[ 1 ][ 1 ] );
                    }
                    ctx.strokeStyle = styles.road.style;
                    ctx.globalAlpha = styles.road.opacity
                    ctx.lineWidth = styles.road.width;
                    ctx.stroke();
                }
            }

            if (0) {
                if (!this.#cracks.straggle_time) {
                    if (this.#cracks.placed_pixels > next_zone_render) {
                        this.#zones.render();
                        set_next_zone_render();
                    }
                }
                else if (!straggle_time) {
                    straggle_time = true;
                    this.#zones.render();
                }
            }
            this.#zones.render();

            this.on_frame();

            if (!straggle_time && this.#cracks.straggle_time) straggle_time = true;

            if (!cracks.done) {
                //this.nextFrame = setTimeout(() => {}, 50 );
                this.#next_frame = requestAnimationFrame( step );
            }
            else {
                this.#zones.render();
                this.#is_running = false;
                this.on_done();
            }
        }

        this.#next_frame = requestAnimationFrame( step );
    }

    pause() {
        this.#is_running = false;
        clearTimeout( this.#next_frame! );
        cancelAnimationFrame( this.#next_frame! );
    }

}
