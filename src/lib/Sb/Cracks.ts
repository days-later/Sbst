import seedrandom from "seedrandom";
import type { Zone } from "./Zone";
import type { CracksLook } from "$lib/Looks";

function get_padded_bounds( w: number, h: number, pad: number ) {
    if (pad < .5) pad = Math.floor( pad * Math.min( w, h ) );

    const vw = Math.floor( Math.min( w*.5, pad ) );
    const vh = Math.floor( Math.min( h*.5, pad ) );

    return [ vw, w - vw - 1, vh, h - vh - 1 ];
}
function create_padding_test( w: number, h: number, pad: number, p?: () => boolean ): (x: number, y: number) => boolean {
    const in_bounds = (x: number, y: number) => (x <= 0 || x >= w || y <= 0 || y >= h) === false;
    if (pad <= 0) return in_bounds;

    const b = get_padded_bounds( w, h, pad );
    const in_padding_bounds = (x: number, y: number) => (x <= b[0] || x >= b[1] || y <= b[2] || y >= b[3]) === false;

    if (!p) return in_padding_bounds;

    return (x,y) => {
        if (in_padding_bounds( x, y )) return true;
        if (!in_bounds( x, y )) return false;
        return p();
    }
}

function density_zones( w: number, h: number, zw: number, zh: number, max: number, max_filled_zones: number ) {
    zw = Math.round( zw );
    zh = Math.round( zh );

    if (zw < 2 || zh < 2) throw "invalid density zone: zone size too small";
    if (max <= 0) throw "zone density: invalid max";

    const zcx = Math.ceil( w / zw );
    const zcy = Math.ceil( h / zh );

    const tx = (zw - (zcx * zw - w)) / zw;
    const ty = (zh - (zcy * zh - h)) / zh;

    const get_zone_coords = (x: number, y: number) => {
        const zc = [
            Math.floor( x / zw ),
            Math.floor( y / zh ),
            max,
        ];

        if (zc[0] === zcx-1) zc[2] *= tx;
        if (zc[1] === zcy-1) zc[2] *= ty;

        zc[2] = Math.round( zc[2] )

        return zc;
    }

    max = Math.round( max < 1 ? (zw * zh * max) : max );

    const data: number[][] = [];

    let filled = 0;
    const zone_count = zcx * zcy;

    if (max_filled_zones <= 1) max_filled_zones = Math.round( max_filled_zones * zone_count );
    if (max_filled_zones <= 0) throw "zone density: invalid max_filled_zones";

    return {
        add: ( x: number, y: number ) => {
            const zc = get_zone_coords( x, y );
            let r = data[ zc[1] ];
            if (r) {
                const v = r[ zc[0] ];

                if (v+1 === zc[2]) filled++;

                if (v) r[ zc[0] ] = v + 1;
                else r[ zc[0] ] = 1;
            }
            else {
                r = [];
                r[ zc[0] ] = 1;
                data[ zc[1] ] = r;
            }
        },
        allow: ( x: number, y: number ) => {
            const zc = get_zone_coords( x, y );
            const r = data[ zc[1] ];

            if (!r) {
                if (filled >= max_filled_zones) return false;
                return true;
            }

            const v = r[ zc[0] ];
            if (!v) {
                if (filled >= max_filled_zones) return false;
                return true;
            }

            return v < zc[2];
        },
        fill_ratio() {
            if (filled >= max_filled_zones) console.log({ filled, max_filled_zones, zone_count,  });
            return filled / max_filled_zones;
        },
    };
}

function normalizeDegrees( deg: number ) {
    if (deg < 0) return 360 + (deg % 360);
    return deg % 360;
}
function getPrng( seed: string ) {
    const rng = seedrandom( seed );

    return {
        int(min: number, max: number) {
            const d = max - min + 1;
            return () => min + Math.floor( rng() * d );
        },
        float( min: number, max: number ) {
            return min + rng() * (max - min);
        },
        test( p = .5 ) {
            if (!p) return false;
            return rng() < p;
        },
        test_fn( p = .5 ) {
            if (p<=0) return () => false;
            if (p>=1) return () => true;
            return () => rng() < p;
        },
    };
}
type Rng = ReturnType<typeof getPrng>





const Pi2 = Math.PI / 180;
class Crack {

    static stepDistance = .42;

    readonly origin: Point;
    readonly angle: number;

    steps = 0;

    prev_pos: Point;
    prev_int_pos: Point;

    pos: Point;
    int_pos: Point;

    constructor({ x, y, angle }: { x: number, y: number, angle: number }) {
        this.origin = [ x, y];
        this.angle = angle;

        this.pos = [ x, y ];
        this.int_pos = [
            Math.round( this.pos[0] ),
            Math.round( this.pos[1] ),
        ];

        this.prev_pos = this.pos;
        this.prev_int_pos = this.int_pos;
    }

    #step() {
        this.pos = [
            this.pos[0] + Crack.stepDistance * Math.cos( this.angle * Pi2 ),
            this.pos[1] + Crack.stepDistance * Math.sin( this.angle * Pi2 ),
        ];
        this.int_pos = [
            Math.round( this.pos[0] ),
            Math.round( this.pos[1] ),
        ];
        return this.int_pos[0] !== this.prev_int_pos[0] || this.int_pos[1] !== this.prev_int_pos[1];
    }
    step() {
        this.prev_pos = this.pos;
        this.prev_int_pos = this.int_pos;

        let moved = this.#step();
        while (!moved) moved = this.#step();

        this.steps++;
    }
}
export type ICrack = Crack;




type CracksCfg = {
    seed: string,
    w: number,
    h: number,

    zones: Zone,

    look: CracksLook,
};
export class Cracks {

    #cracks = new Set<Crack>();
    #angles: number[][];
    #placed_pixels = 0;

    #pixel_count_total: number;
    #placed_pixels_max: number;

    #max_cracks: number;
    #spawn_extra_chances: number[];
    #straggler_chance: number;

    #in_bounds: (x: number, y: number) => boolean;
    #in_padded_bounds: ((x: number, y: number) => boolean);
    #in_padded_bounds_straggler: ((x: number, y: number) => boolean);

    #zones: Zone;

    #rng: Rng;
    #random_x: () => number;
    #random_y: () => number;

    #density: undefined | { add: ( x: number, y: number ) => void, allow: ( x: number, y: number ) => boolean, fill_ratio: () => number };

    #max_find_origin_attempts = 0;

    #angle_jitter: [ number, number ];

    #crack_seed_angle: [ number, number ];
    #reseeds_remaining: number;
    #reseeds_seed_count: number;

    steps_per_frame: number;
    straggle_time = false;
    done = false;

    constructor( cfg: CracksCfg) {
        const rng = getPrng( cfg.seed );
        this.#rng = rng;

        const look = cfg.look;

        this.#pixel_count_total = cfg.w * cfg.h;
        this.#placed_pixels_max = Math.min( this.#pixel_count_total, Math.floor( this.#pixel_count_total * look.placed_pixels_share ) );
        this.#max_find_origin_attempts = Math.max( 0, this.#pixel_count_total * .5 );

        if (look.density && look.density.zone_count>0 && look.density.max_fill_lvl>0) {
            const zs = Math.max( 4, Math.ceil( Math.max( cfg.w, cfg.h ) / look.density.zone_count ) );
            this.#density = density_zones( cfg.w, cfg.h, zs, zs, look.density.max_fill_lvl, look.density.max_filled_zones || 1 );
        }

        this.steps_per_frame = look.steps_per_frame || 8;

        const mc = look.max_cracks;
        this.#max_cracks = Math.ceil( mc < 1 ? (cfg.w * cfg.h * mc) : mc );
        this.#straggler_chance = cfg.look.straggler_chance;
        this.#spawn_extra_chances = cfg.look.spawn_extra_crack_chances;

        this.#angle_jitter = look.angel_jitter ?? [ -2, 2.1 ];

        this.#reseeds_remaining = look.reseed?.max_attempts || 0;
        this.#reseeds_seed_count = look.reseed?.seed_count || look.initial_cracks;

        this.#angles = [];

        this.#in_bounds = create_padding_test( cfg.w, cfg.h, 0 );
        this.#in_padded_bounds = this.#in_bounds;
        this.#in_padded_bounds_straggler = this.#in_bounds;

        if (look.padding && look.padding.size>0 && look.padding.chance<1) {
            const pc = look.padding.chance<1 ? rng.test_fn( look.padding.chance ) : undefined;
            this.#in_padded_bounds = create_padding_test( cfg.w, cfg.h, look.padding.size, pc );
        }
        if (look.padding_straggler && look.padding_straggler.size>0 && look.padding_straggler.chance>0) {
            const pc = look.padding_straggler.chance<1 ? rng.test_fn( look.padding_straggler.chance ) : undefined;
            this.#in_padded_bounds_straggler = create_padding_test( cfg.w, cfg.h, look.padding_straggler.size, pc );
        }

        this.#zones = cfg.zones;

        const bounds = get_padded_bounds( cfg.w, cfg.h, look.padding?.size || 0 );
        this.#random_x = rng.int( bounds[ 0 ], bounds[ 1 ] );
        this.#random_y = rng.int( bounds[ 2 ], bounds[ 3 ] );

        this.#crack_seed_angle = look.seed_angle ?? [ 0, 360 ];
        this.#seed( look.crack_seeds, look.initial_cracks );
    }

    #seed( seed_count: number, crack_count: number,  ) {
        const seeds: { x: number, y: number, angle: number }[] = [];
        let n = 0;
        while (true) {
            const angle = this.#rng.float( this.#crack_seed_angle[0], this.#crack_seed_angle[1] );
            const seed = { x: this.#random_x(), y: this.#random_y(), angle };

            const exists = this.#get_angle_at( seed.x, seed.y );
            if (!exists) {
                seeds.push( seed );
                if (seeds.length >= seed_count) break;
            }

            n++;
            if (n >= this.#max_find_origin_attempts) break;
        }

        for (let i=0; i < Math.min( crack_count, seeds.length ); i++) {
            const seed = seeds[ i ];
            this.#add_crack( seed );
        }
    }

    get active_cracks() {
        return this.#cracks.size;
    }
    get max_cracks() {
        return this.#max_cracks;
    }
    get placed_pixels() {
        return this.#placed_pixels;
    }
    get placed_pixels_max() {
        return this.#placed_pixels_max;
    }

    #get_angle_at( x: number, y: number ) {
        const r = this.#angles[ y ];
        if (r) return r[ x ];
    }
    #set_angle_at( x: number, y: number, angle: number ): void {
        let r = this.#angles[ y ];
        if (!r || !r[ x ]) {
            this.#placed_pixels++;
            if (!this.straggle_time) {
                if (this.#density) this.#density.add( x, y );
                this.#zones.add_pixel( x, y );
            }
        }
        if (!r) this.#angles[ y ] = [];
        this.#angles[ y ][ x ] = angle;
    }

    #findOrigin( max_attempts: number ) {
        let x = 0;
        let y = 0;
        let angle: number | undefined = undefined;
        let attempts = 0;

        if (max_attempts <= 0) return;

        while (angle === undefined && attempts++ < max_attempts) {
            x = this.#random_x();
            y = this.#random_y();
            angle = this.#get_angle_at( x, y );

            if (angle !== undefined && this.#density) {
                if (!this.#density.allow( x, y )) continue;
            }
        }

        if (angle) return { x, y, angle };
    }

    #add_crack( origin?: { x: number, y: number, angle: number } ): boolean {
        if (this.#cracks.size >= this.#max_cracks || this.straggle_time) return false;

        origin = origin || this.#findOrigin( this.#max_find_origin_attempts );
        if (!origin) return false;

        const angle_adjust = (this.#rng.test() ? 90 : -90) + this.#rng.float( this.#angle_jitter[0], this.#angle_jitter[1] );
        origin.angle = normalizeDegrees( origin.angle + angle_adjust );

        const c = new Crack( origin );
        this.#cracks.add( c );
        return true;
    }

    #is_valid_crack_pos( crack: Crack ): true | string {
        const x = crack.int_pos[ 0 ];
        const y = crack.int_pos[ 1 ];

        if (x === crack.origin[ 0 ] && y === crack.origin[ 1 ]) return true;

        if (this.straggle_time) {
            if (!this.#in_padded_bounds_straggler( x, y )) return 'oob-straggler';
        }
        else {
            if (!this.#in_padded_bounds( x, y )) return 'oob';
        }

        if (this.#density && !this.#density.allow( x, y )) return 'density';

        return this.#get_angle_at( x, y ) === undefined ? true : 'occupied';
    }

    crack_done_reasons = new Map<string,number>();
    step( on_step: (crack: Crack, isDone: boolean) => void ) {
        if (this.straggle_time === false && this.#placed_pixels >= this.#placed_pixels_max) {
            this.straggle_time = true;
            //console.log( 'straggle-time :)' );

            if (this.#straggler_chance <= 0) {
                for (const crack of this.#cracks) {
                    this.#cracks.delete( crack );
                }
            }
            else if (this.#straggler_chance < 1) {
                for (const crack of this.#cracks) {
                    if (!this.#rng.test( this.#straggler_chance )) {
                        this.#cracks.delete( crack );
                    }
                }
            }
        }

        this.#max_find_origin_attempts = this.straggle_time ? 0 : Math.max( 0, this.#pixel_count_total * .5 * (1 - (this.#placed_pixels / this.#placed_pixels_max)) );

        let done = true;
        for (const crack of this.#cracks) {
            crack.step();

            const ivc = this.#is_valid_crack_pos( crack );
            if (ivc === true) {
                done = false;
                this.#set_angle_at( crack.int_pos[0], crack.int_pos[1], crack.angle );

                if (!this.straggle_time || this.#zones.allow_straggler( crack.pos[ 0 ], crack.pos[ 1 ] )) {
                    on_step( crack, false );
                }
            }
            else {
                this.crack_done_reasons.set( ivc, (this.crack_done_reasons.get( ivc ) || 0) + 1 );
                this.#cracks.delete( crack );
                if (crack.steps > 1) {
                    on_step( crack, true );

                    this.#add_crack();
                    for (const p of this.#spawn_extra_chances) {
                        if (this.#rng.test( p )) this.#add_crack();
                    }
                }
            }
        }

        let done_reason = done ? 'cracks-done' : '';

        const zones_filled = this.#density?.fill_ratio() ?? 0;
        if (zones_filled >= 1) {
            if (!done) done_reason = 'zones-filled';
            done = true;
        }

        if (zones_filled<1 && this.#cracks.size===0 && this.#placed_pixels < this.#placed_pixels_max && this.#reseeds_remaining) {
            this.#reseeds_remaining--;
            this.#seed( this.#reseeds_seed_count, this.#reseeds_seed_count );

            done = this.#cracks.size === 0;
            if (done) done_reason = 'reseed-failed';
        }

        this.done = done;
        if (done) {
            console.log({
                placed_pixels_ratio: this.#placed_pixels / this.#placed_pixels_max,
                zones_filled,
                done_reason,
            });
            console.log( this.crack_done_reasons );
        }
    }

}
