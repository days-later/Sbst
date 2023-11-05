import type { ZoneLook } from "$lib/Looks";
import seedrandom from "seedrandom";

function zone_util( w: number, h: number, zw: number, zh: number ) {
    const cols = Math.ceil( w / zw );
    const rows = Math.ceil( h / zh );

    const offset_x = Math.floor( (w - zw * cols) / 2 );
    const offset_y = Math.floor( (h - zh * rows) / 2 );

    const bounds_x0 = offset_x;
    const bounds_x1 = offset_x + cols * zw;
    const bounds_y0 = offset_y;
    const bounds_y1 = offset_y + rows * zh;

    const zu = {
        get_zone_id( x: number, y: number ) {
            if (x < bounds_x0 || x >= bounds_x1) return -1;
            if (y < bounds_y0 || y >= bounds_y1) return -1;

            x = Math.floor( (x - offset_x) / zw );
            y = Math.floor( (y - offset_y) / zh );
            return y * cols + x;
        },

        get_zone_coords( id: number ): [ number, number ] {
            let y = Math.floor( id / cols );
            return [ id - (y * cols), y ];
        },

        each_zone( cb: ( x: number, y: number, id: number, zx: number, zy: number ) => void ) {
            let x: number, y: number;
            for (x = bounds_x0; x < bounds_x1; x += zw) {
                for (y = bounds_y0; y < bounds_y1; y += zh) {
                    const zx = (x-bounds_x0) / zw;
                    const zy = (y-bounds_y0) / zh;
                    cb( x, y, zy * cols + zx, zx, zy );

                    const id = zu.get_zone_id( x, y );
                    if (id !== zy * cols + zx) throw { x, y, zx, zy, id, _id: zy * cols + zx };
                }
            }
        },

        walk_circle( cx: number, cy: number, r: [ number, number ], cb: (zx: number, zy: number, r: number) => unknown ) {
            if (r[1] <= 0 || r[1]-r[0] <= 0) return;

            let x: number, y: number, cr: number;
            for (x=cx-r[1]; x<=cx+r[1]; x++) {
                for (y=cy-r[1]; y<=cy+r[1]; y++) {
                    if (x<0 || x>=cols || y<0 || y>=rows) continue;

                    cr = Math.abs( cx - x ) + Math.abs( cy - y );
                    if (cr < r[0] || cr > r[1]) continue;

                    const v = cb( x, y, cr );
                    if (v !== undefined) return v;
                }
            }
            return true;
        },
    };

    return zu;
}

type Compass = [ n: 0|1, e: 0|1, s: 0|1, w: 0|1 ];
export type RenderType = "fill_jitter" | "fill" | "shoreline" | "shoreline_jitter" | "angle";

type ZoneRenderer = {
    add( lvls: number[], x: number, y: number, compass: (lvl: number) => Compass ): void,
    clear( lvls: number[], x: number, y: number ): void,
    flush(): void,
};

type Path = number[];

type TileRenderer = (paths: Path[], x: number, y: number, compass: () => Compass ) => void;
type GetTileRenderer<T> = (zw: number, zh: number, rng: () => number, props?: T) => TileRenderer;

const fill_renderer: GetTileRenderer<never> = (zw, zh) => {
    return (paths, x, y) => {
        paths.push([
            x, y,
            x + zw, y,
            x + zw, y + zh,
            x, y + zh,
        ]);
    };
}
const fill_jitter_renderer: GetTileRenderer<number|{ v: number, c: number }|{ vx: number, cx?: number, vy: number, cy?: number }> = (zw, zh, rng, props) => {
    props = props ?? 1;
    if (typeof props === 'number') props = { vx: props, vy: props };
    if ('v' in props) props = {
        vx: props.v,
        vy: props.v,
        cx: props.c,
        cy: props.c,
    }

    const vx = props.vx;
    const cx = props.cx ?? props.vx;
    const vy = props.vy;
    const cy = props.cy ?? props.vy;

    return (paths, x, y, compass) => {
        const zw2 = zw * .4;
        const zh2 = zh * .4;

        const p: Path = [];
        paths.push( p );
        const jittery = (x: number, y: number) => {
            p.push(
                x + (cx - 2 * rng()*vx) * zw2,
                y + (cy - 2 * rng()*vy) * zh2,
            );
        }

        const [ n, e, s, w ] = compass();

        if (n && w) p.push( x, y );
        else jittery( x, y );

        if (n && e) p.push( x + zw, y );
        else jittery( x + zw, y );

        if (e && s) p.push( x + zw, y + zh );
        else jittery( x + zw, y + zh );

        if (s && w) p.push( x, y + zh );
        else jittery( x, y + zh );
    };
}
const shoreline_renderer: GetTileRenderer<never> = (zw, zh) => {
    return (paths, x, y, compass) => {
        const [ n, e, s, w ] = compass();
        const sum = n + e + s + w;

        const zw2 = zw / 2;
        const zh2 = zh / 2;

        const p: Path = [];
        paths.push( p );

        if (sum === 0) {
            p.push( x + zw2, y );
            p.push( x + zw, y + zh2 );
            p.push( x + zw2, y + zh );
            p.push( x, y + zh2 );
        }
        else if (sum === 1) {
            if (n) {
                p.push( x + zw2, y + zh * .3 );
                p.push( x + zw, y );
                p.push( x, y );
            }
            else if (e) {
                p.push( x + zw * .7, y + zh2 );
                p.push( x + zw, y );
                p.push( x + zw, y + zh );
            }
            else if (s) {
                p.push( x + zw2, y + zh * .7 );
                p.push( x + zw, y + zh );
                p.push( x, y + zh );
            }
            else if (w) {
                p.push( x + zw * .3, y + zh2 );
                p.push( x, y );
                p.push( x, y + zh );
            }
        }
        else if (sum === 2) {
            if (n && s || e && w) {
                p.push( x, y );
                if (e) p.push( x + zw2, y + zh2/3 );
                p.push( x + zw, y );
                if (n) p.push( x + zw - zw2/3, y + zh2 );
                p.push( x + zw, y + zh );
                if (e) p.push( x + zw2, y + zh - zh2/3 );
                p.push( x, y + zh );
                if (n) p.push( x + zw2/3, y + zh2 );
            }
            else if (n && e) {
                p.push( x, y );
                p.push( x + zw, y );
                p.push( x + zw, y + zh );
                p.push( x + zw * .3, y + zh * .7 );
            }
            else if (e && s) {
                p.push( x + zw, y );
                p.push( x + zw, y + zh );
                p.push( x, y + zh );
                p.push( x + zw * .3, y + zh * .3 );
            }
            else if (s && w) {
                p.push( x + zw, y + zh );
                p.push( x, y + zh );
                p.push( x, y );
                p.push( x + zw * .7, y + zh * .3 );
            }
            else if (w && n) {
                p.push( x, y + zh );
                p.push( x, y );
                p.push( x + zw, y );
                p.push( x + zw * .7, y + zh * .7 );
            }
        }
        else if (sum === 3) {
            p.push( x, y );
            if (!n) p.push( x + zw2, y + zh2/3 );
            p.push( x + zw, y );
            if (!e) p.push( x + zw - zw2/3, y + zh2 );
            p.push( x + zw, y + zh );
            if (!s) p.push( x + zw2, y + zh - zh2/3 );
            p.push( x, y + zh );
            if (!w) p.push( x + zw2/3, y + zh2 );
        }
        else {
            p.push(
                x, y,
                x + zw, y,
                x + zw, y + zh,
                x, y + zh,
            );
        }
    };
}
const shoreline_jitter_renderer: GetTileRenderer<number|{ v: number, c: number }|{ vx: number, cx?: number, vy: number, cy?: number }> = (zw, zh, rng, props) => {
    props = props ?? 1;
    if (typeof props === 'number') props = { vx: props, vy: props };
    if ('v' in props) props = {
        vx: props.v,
        vy: props.v,
        cx: props.c,
        cy: props.c,
    }

    const vx = props.vx;
    const cx = props.cx || props.vx;
    const vy = props.vy;
    const cy = props.cy || props.vy;

    return (paths, x, y, compass) => {
        const [ n, e, s, w ] = compass();
        const sum = n + e + s + w;

        const zw2 = zw / 2;
        const zh2 = zh / 2;

        const p: Path = [];
        paths.push( p );
        const jittery = (x: number, y: number, v = 1 ) => {
            p.push(
                x + (cx - 2 * rng()*vx) * zw2 * v,
                y + (cy - 2 * rng()*vy) * zh2 * v,
            );
        }

        if (sum === 0) {
            jittery( x + zw2, y );
            jittery( x + zw, y + zh2 );
            jittery( x + zw2, y + zh );
            jittery( x, y + zh2 );
        }
        else if (sum === 1) {
            if (n) {
                jittery( x + zw2, y + zh * .7 );
                p.push( x + zw, y );
                p.push( x, y );
            }
            else if (e) {
                jittery( x + zw * .3, y + zh2 );
                p.push( x + zw, y );
                p.push( x + zw, y + zh );
            }
            else if (s) {
                jittery( x + zw2, y + zh * .5 );
                p.push( x + zw, y + zh );
                p.push( x, y + zh );
            }
            else if (w) {
                jittery( x + zw * .7, y + zh2 );
                p.push( x, y );
                p.push( x, y + zh );
            }
        }
        else if (sum === 2) {
            if (n && s) {
                p.push( x, y );
                p.push( x + zw, y );
                jittery( x + zw*.75, y + zh2, .49 );
                p.push( x + zw, y + zh );
                p.push( x, y + zh );
                jittery( x + zw*.25, y + zh2, .49 );
            }
            else if (e && w) {
                p.push( x, y );
                jittery( x + zw2, y + zh*.25, .49 );
                p.push( x + zw, y );
                p.push( x + zw, y + zh );
                jittery( x + zw2, y + zh*.75, .49 );
                p.push( x, y + zh );
            }
            else if (n && e) {
                p.push( x, y );
                p.push( x + zw, y );
                p.push( x + zw, y + zh );
                jittery( x + zw2, y + zh2, .9 );
            }
            else if (e && s) {
                p.push( x + zw, y );
                p.push( x + zw, y + zh );
                p.push( x, y + zh );
                jittery( x + zw2, y + zh2, .9 );
            }
            else if (s && w) {
                p.push( x + zw, y + zh );
                p.push( x, y + zh );
                p.push( x, y );
                jittery( x + zw2, y + zh2, .9 );
            }
            else if (w && n) {
                p.push( x, y + zh );
                p.push( x, y );
                p.push( x + zw, y );
                jittery( x + zw2, y + zh2, .9 );
            }
        }
        else if (sum === 3) {
            p.push( x, y );
            if (!n) jittery( x + zw2, y + zh * .05, .9 );
            p.push( x + zw, y );
            if (!e) jittery( x + zw * .95, y + zh2, .9 );
            p.push( x + zw, y + zh );
            if (!s) jittery( x + zw2, y + zh * .95, .9 );
            p.push( x, y + zh );
            if (!w) jittery( x + zw * .05, y + zh2, .9 );
        }
        else {
            p.push(
                x, y,
                x + zw, y,
                x + zw, y + zh,
                x, y + zh,
            );
        }
    };
}
const angle_renderer: GetTileRenderer<never> = (zw, zh) => {
    return (paths, x, y, compass) => {
        const [ n, e, s, w ] = compass();
        const sum = n + e + s + w;

        const zw2 = zw / 2;
        const zh2 = zh / 2;

        const p: Path = [];
        paths.push( p );

        if (sum === 0) {
            p.push( x + zw2, y );
            p.push( x + zw, y + zh2 );
            p.push( x + zw2, y + zh );
            p.push( x, y + zh2 );
        }
        else if (sum === 1) {
            if (n) {
                p.push( x + zw * .25, y + zh * .25 );
                p.push( x + zw * .75, y + zh * .25 );
                p.push( x + zw, y );
                p.push( x, y );
            }
            else if (e) {
                p.push( x + zw * .75, y + zh * .25 );
                p.push( x + zw * .75, y + zh * .75 );
                p.push( x + zw, y + zh );
                p.push( x + zw, y );
            }
            else if (s) {
                p.push( x + zw * .25, y + zh * .75 );
                p.push( x + zw * .75, y + zh * .75 );
                p.push( x + zw, y + zh );
                p.push( x, y + zh );
            }
            else if (w) {
                p.push( x + zw * .25, y + zh * .25 );
                p.push( x + zw * .25, y + zh * .75 );
                p.push( x, y + zh );
                p.push( x, y );
            }
        }
        else if (sum === 2) {
            if (n && s) {
                p.push( x + zw, y );
                p.push( x + zw * .75, y + zh * .25 );
                p.push( x + zw * .75, y + zh * .75 );
                p.push( x + zw, y + zh );
                p.push( x, y + zh );
                p.push( x + zw * .25, y + zh * .75 );
                p.push( x + zw * .25, y + zh * .25 );
                p.push( x, y );
            }
            else if (e && w) {
                p.push( x, y );
                p.push( x + zw * .25, y + zh * .25 );
                p.push( x + zw * .75, y + zh * .25 );
                p.push( x + zw, y );
                p.push( x + zw, y + zh );
                p.push( x + zw * .75, y + zh * .75 );
                p.push( x + zw * .25, y + zh * .75 );
                p.push( x, y + zh );
            }
            else if (n && e) {
                p.push( x + zw * .75, y );
                p.push( x + zw, y );
                p.push( x + zw, y + zh * .25 );
            }
            else if (n && w) {
                p.push( x, y );
                p.push( x + zw * .25, y );
                p.push( x, y + zh * .25 );
            }
            else if (s && e) {
                p.push( x + zw, y + zh * .75 );
                p.push( x + zw, y + zh );
                p.push( x + zw * .75, y + zh );
            }
            else if (s && w) {
                p.push( x, y + zh * .75 );
                p.push( x + zw * .25, y + zh );
                p.push( x, y + zh );
            }
        }
        else if (sum === 3) {
            if (!n) {
                p.push(
                    x, y + zh * .75,
                    x + zw, y + zh * .75,
                    x + zw, y + zh,
                    x, y + zh,
                );
            }
            else if (!e) {
                p.push(
                    x, y,
                    x + zw * .25, y,
                    x + zw * .25, y + zh,
                    x, y + zh,
                );
            }
            else if (!s) {
                p.push(
                    x, y,
                    x + zw, y,
                    x + zw, y + zh * .25,
                    x, y + zh * .25,
                );
            }
            else if (!w) {
                p.push(
                    x + zw * .75, y,
                    x + zw, y,
                    x + zw, y + zh,
                    x + zw * .75, y + zh,
                );
            }
        }
        else {
            p.push(
                x, y,
                x + zw, y,
                x + zw, y + zh,
                x, y + zh,
            );
        }
    };
}
const tile_renderers = {
    fill: fill_renderer,
    fill_jitter: fill_jitter_renderer,

    shoreline: shoreline_renderer,
    shoreline_jitter: shoreline_jitter_renderer,

    angle: angle_renderer,
} as const;

type TR_Key = keyof typeof tile_renderers;
type TR_Props<T extends TR_Key> = ((typeof tile_renderers)[ T ]) extends GetTileRenderer<infer Props> ? Props : never;

export type TileRendererProp = { [K in TR_Key]: K | ([TR_Props<K>] extends [never] ? never : [ K, TR_Props<K> ]) }[ TR_Key ];

function get_tile_renderer( r: TileRendererProp, zw: number, zh: number, rng: () => number ): TileRenderer {
    if (typeof r === 'string') return tile_renderers[ r ]( zw, zh, rng );

    if (r[0] === 'fill_jitter') return tile_renderers[ r[0] ]( zw, zh, rng, r[1] || undefined );

    return tile_renderers[ r[0] ]( zw, zh, rng, r[1] || undefined );
}

type RenderLayer = {
    ctx: CanvasRenderingContext2D,
    fill: string,
    opacity: number,

    fill_chance: number,
    clear_chance: number,

    render: TileRenderer,
}
function zone_renderer( layers: RenderLayer[], zw: number, zh: number, rng: () => number ): ZoneRenderer {

    const lvl_paths = new Map<number,Path[]>();

    return {
        add( lvls, x, y, compass ) {
            for (const lvl of lvls) {
                const layer = layers[ lvl ];
                if (!layer) continue;

                if (layer.fill_chance < 1) {
                    if (rng() > layer.fill_chance) continue;
                }

                let paths = lvl_paths.get( lvl );
                if (!paths) {
                    paths = [];
                    lvl_paths.set( lvl, paths );
                }

                layer.render( paths, x, y, () => compass( lvl ) );
            }
        },
        clear( lvls, x, y ) {
            for (const lvl of lvls) {
                const layer = layers[ lvl ];
                if (layer) {
                    if (layer.clear_chance < 1) {
                        if (rng() > layer.clear_chance) continue;
                    }
                    layer.ctx.clearRect( x, y, zw, zh );
                }
            }
        },
        flush() {
            let lvl: number, paths: Path[], layer: RenderLayer, path: Path, point: Point, i: number;

            for ([ lvl, paths ] of lvl_paths) {
                layer = layers[ lvl ];

                layer.ctx.fillStyle = layer.fill;
                layer.ctx.globalAlpha = layer.opacity;
                layer.ctx.beginPath();

                for (path of paths) {
                    layer.ctx.moveTo( path[0], path[1] );
                    for (i=2; i<path.length; i+=2) layer.ctx.lineTo( path[i], path[i+1] );
                    layer.ctx.lineTo( path[0], path[1] );
                }

                layer.ctx.fill();
            }

            lvl_paths.clear();
        },
    };
}


type ZoneItem = {
    x: number,
    y: number,
    id: number,

    lvls: Set<number>,
    center: boolean,
    inside: boolean,

    compass: {
        n: Set<number>,
        e: Set<number>,
        s: Set<number>,
        w: Set<number>,
    };
}

type ZoneCfg = {
    seed: string,
    w: number,
    h: number,

    look: ZoneLook,
}

export class Zone {

    #rng: () => number;

    #w: number;
    #h: number;

    readonly canvases: HTMLCanvasElement[] = [];

    #updated_zones = new Set<number>();
    #zone_data: ZoneItem[][] = [];

    #get_zone_id: (x: number, y: number) => number;
    #get_zone_coords: (id: number) => [ number, number ];
    #walk_circle: ( cx: number, cy: number, r: [ number, number ], cb: (zx: number, zy: number, r: number) => unknown ) => unknown;

    #outside_lvls: Set<number>[];
    #clear_outside_lvls: Set<number>[];
    #outside_radius_max:number;
    #center_lvl_index: number;
    #inside_lvl_index: number;
    #inside_lvl_radius: number;
    #renderer: ZoneRenderer;

    #allow_straggler: boolean | {
        empty?: boolean,
        outside_lvls?: boolean | Set<number>,
        center?: boolean,
        inside?: boolean,
    }

    constructor( cfg: ZoneCfg ) {
        this.#w = cfg.w;
        this.#h = cfg.h;

        this.#rng = seedrandom( cfg.seed );


        const zs = Math.max( 2, Math.ceil( Math.max( cfg.w, cfg.h ) / cfg.look.zone_count ) );

        const zu = zone_util( cfg.w, cfg.h, zs, zs );
        this.#get_zone_id = zu.get_zone_id;
        this.#get_zone_coords = zu.get_zone_coords;
        this.#walk_circle = zu.walk_circle;


        const zd: ZoneItem[][] = [];
        zu.each_zone(( x, y, id, zx, zy ) => {
            let r = zd[ zy ];
            if (!r) {
                r = [];
                zd[ zy ] = r;
            }
            const compass = {
                n: new Set<number>,
                e: new Set<number>,
                s: new Set<number>,
                w: new Set<number>,
            };
            r[ zx ] = { x, y, id, lvls: new Set, center: false, inside: false, compass };
        });
        this.#zone_data = zd;


        const outside_lvl_radius = cfg.look.layers.outside?.map( l => l.radius ) || [];
        let outside_radius_max = 0;
        outside_lvl_radius.forEach( ([ r1, r2 ]) => {
            if (r1 > outside_radius_max) outside_radius_max = r1;
            if (r2 > outside_radius_max) outside_radius_max = r2;
        });
        this.#outside_radius_max = outside_radius_max;

        const outside_lvls: Set<number>[] = [];
        const clear_outside_lvls: Set<number>[] = [];
        let lvl = 1;
        for (const [ r1, r2 ] of outside_lvl_radius) {
            const min = Math.min( r1, r2 );
            const max = Math.max( r1, r2 );
            for (let r=0; r<=max; r++) {
                if (r < min) {
                    let s = clear_outside_lvls[ r ];
                    if (!s) {
                        s = new Set;
                        clear_outside_lvls[ r ] = s;
                    }
                    s.add( lvl );
                }
                else {
                    let s = outside_lvls[ r ];
                    if (!s) {
                        s = new Set;
                        outside_lvls[ r ] = s;
                    }
                    s.add( lvl );
                }
            }
            lvl++;
        }
        this.#outside_lvls = outside_lvls;
        this.#clear_outside_lvls = clear_outside_lvls;

        this.#center_lvl_index = outside_lvl_radius.length + 1;
        this.#inside_lvl_index = outside_lvl_radius.length + 2;
        this.#inside_lvl_radius = cfg.look.layers.inside?.radius || 0;

        this.#allow_straggler = cfg.look.allow_straggler ?? { empty: true };

        const render_layers: RenderLayer[] = [];
        type RenderLayerProps = {
            i: number,
            fill: string,
            opacity: number,

            render?: TileRendererProp,

            fill_chance: number|undefined,
            clear_chance: number|undefined,
        }
        const add_render_layer = (props: RenderLayerProps) => {
            const canvas = document.createElement( 'canvas' );
            canvas.width = this.#w;
            canvas.height = this.#h;

            this.canvases.push( canvas );

            render_layers[ props.i ] = {
                ctx: canvas.getContext( '2d' )!,
                fill: props.fill,
                opacity: props.opacity,

                fill_chance: Math.max( 0, Math.min( props.fill_chance ?? 1, 1 ) ),
                clear_chance: Math.max( 0, Math.min( props.clear_chance ?? 1, 1 ) ),

                render: get_tile_renderer( props.render || 'fill', zs, zs, this.#rng ),
            };
        }

        if (cfg.look.layers.outside) for (let i=0; i<cfg.look.layers.outside.length; i++) {
            const l = cfg.look.layers.outside[ i ];
            if (l.color) add_render_layer({
                i: i+1,

                render: l.render,

                fill: l.color,
                opacity: l.opacity || 1,

                fill_chance: l.fill_chance,
                clear_chance: l.clear_chance,
            });
        }
        if (cfg.look.layers.center && cfg.look.layers.center.color) {
            const l = cfg.look.layers.center;
            add_render_layer({
                i: this.#center_lvl_index,

                render: l.render,

                fill: l.color!,
                opacity: l.opacity || 1,

                fill_chance: l.fill_chance,
                clear_chance: l.clear_chance,
            });
        }
        if (cfg.look.layers.inside && cfg.look.layers.inside.color && cfg.look.layers.inside.radius) {
            const l = cfg.look.layers.inside;
            add_render_layer({
                i: this.#inside_lvl_index,

                render: l.render,

                fill: l.color!,
                opacity: l.opacity || 1,

                fill_chance: l.fill_chance,
                clear_chance: l.clear_chance,
            });
        }

        this.#renderer = zone_renderer( render_layers, zs, zs, this.#rng );
    }

    add_pixel( x: number, y: number ) {
        const id = this.#get_zone_id( x, y );
        if (id < 0) return;

        const zc = this.#get_zone_coords( id );
        const z = this.#zone_data[ zc[1] ][ zc[0] ];
        if (!z.center) {
            z.center = true;
            z.lvls.add( this.#center_lvl_index );
            this.#updateAdjacentZones( z, this.#center_lvl_index, 'add' );
            this.#updated_zones.add( id );
        }
    }

    allow_straggler( x: number, y: number ): boolean {
        const as = this.#allow_straggler;
        if (as === true) return true;
        if (as === false) return false;

        const id = this.#get_zone_id( x, y );
        const zc = this.#get_zone_coords( id );

        const row = this.#zone_data[ zc[1] ];
        if (!row) return false;

        const z = row[ zc[0] ];

        if (as.center && z.center) return true;
        if (as.inside && z.inside) return true;

        if (as.empty && z.lvls.size === 0) return true;

        if (as.outside_lvls === false) {
            if (z.lvls.size && !z.center) return false;
        }
        if (as.outside_lvls === true) {
            if (z.lvls.size && !z.center) return true;
        }

        if (as.outside_lvls instanceof Set && z.lvls.size) {
            for (const lvl of as.outside_lvls) if (z.lvls.has( lvl )) return true;
        }

        return false;
    }

    #updateAdjacentZones( z: ZoneItem, lvl: number, op: 'add' | 'delete' ) {
        const [ zx, zy ] = this.#get_zone_coords( z.id );

        z = this.#zone_data[ zy-1 ]?.[ zx ];
        if (z) z.compass.s[ op ]( lvl );

        z = this.#zone_data[ zy ][ zx+1 ];
        if (z) z.compass.w[ op ]( lvl );

        z = this.#zone_data[ zy+1 ]?.[ zx ];
        if (z) z.compass.n[ op ]( lvl );

        z = this.#zone_data[ zy ][ zx-1 ];
        if (z) z.compass.e[ op ]( lvl );
    }

    render() {
        const zd = this.#zone_data;
        const center_lvl_index = this.#center_lvl_index;

        const outside_lvls = this.#outside_lvls;
        const clear_outside_lvls = this.#clear_outside_lvls;
        const outside_radius_max = this.#outside_radius_max;

        const to_render = new Map<ZoneItem,number[]>();
        const add_to_render = (z: ZoneItem, lvl: number) => {
            const s = to_render.get( z );
            if (s) s.push( lvl );
            else to_render.set( z, [ lvl ] );
        }

        const to_clear = new Map<ZoneItem,number[]>();
        const add_to_clear = (z: ZoneItem, lvl: number) => {
            const s = to_clear.get( z );
            if (s) s.push( lvl );
            else to_clear.set( z, [ lvl ] );
        }

        for (const id of this.#updated_zones) {
            const [ x, y ] = this.#get_zone_coords( id );
            const z = zd[ y ][ x ];

            add_to_render( z, center_lvl_index );

            this.#walk_circle( x, y, [ 0, outside_radius_max ], (x, y, r) => {
                const lvls = outside_lvls[ r ];
                const clvls = clear_outside_lvls[ r ];
                if (!lvls && !clvls) return

                const z = zd[ y ][ x ];
                if (lvls) for (const lvl of lvls) {
                    if (!z.lvls.has( lvl )) {
                        z.lvls.add( lvl );
                        this.#updateAdjacentZones( z, lvl, 'add' );
                        add_to_render( z, lvl );
                    }
                }
                if (clvls) for (const clvl of clvls) {
                    if (z.lvls.has( clvl )) {
                        z.lvls.delete( clvl );
                        this.#updateAdjacentZones( z, clvl, 'delete' );
                        add_to_clear( z, clvl );
                    }
                }
            });
        }

        const inside_lvl_radius = this.#inside_lvl_radius;
        if (inside_lvl_radius > 0) {
            const inside_lvl_index = this.#inside_lvl_index;

            const is_inside = (x: number, y: number) => {
                return this.#walk_circle( x, y, [ 1, inside_lvl_radius ], (x, y) => zd[ y ][ x ].center ? undefined : false );
            }

            for (const id of this.#updated_zones) {
                const [ x, y ] = this.#get_zone_coords( id );

                if (is_inside( x, y )) {
                    const z = zd[ y ][ x ];
                    z.lvls.add( inside_lvl_index );
                    this.#updateAdjacentZones( z, inside_lvl_index, 'add' );
                    z.inside = true;
                    add_to_render( z, inside_lvl_index );
                }

                this.#walk_circle( x, y, [ 1, inside_lvl_radius ], (x, y) => {
                    const z = zd[ y ][ x ];
                    if (z.center && !z.inside && is_inside( x, y )) {
                        z.lvls.add( inside_lvl_index );
                        this.#updateAdjacentZones( z, inside_lvl_index, 'add' );
                        z.inside = true;
                        add_to_render( z, inside_lvl_index );
                    }
                });
            }
        }

        const add_to_render_adjacent = (z: ZoneItem|undefined, lvls: number[]) => {
            if (!z) return;

            let zlvls = to_render.get( z );
            if (zlvls) {
                for (const lvl of lvls) {
                    if (z.lvls.has( lvl ) && !zlvls.includes( lvl )) zlvls.push( lvl );
                }
            }
            else {
                zlvls = [];
                for (const lvl of lvls) {
                    if (z.lvls.has( lvl )) zlvls.push( lvl );
                }
                to_render.set( z, zlvls );
            }
        }
        for (let [ z, lvls ] of to_render) {
            const [ zx, zy ] = this.#get_zone_coords( z.id );

            if (zy) {
                z = zd[ zy-1 ]?.[ zx ];
                add_to_render_adjacent( z, lvls );
            }

            if (zx) {
                z = zd[ zy ][ zx-1 ];
                add_to_render_adjacent( z, lvls );
            }

            z = zd[ zy ][ zx+1 ];
            add_to_render_adjacent( z, lvls );

            z = zd[ zy+1 ]?.[ zx ];
            add_to_render_adjacent( z, lvls );
        }

        for (let [ z, lvls ] of to_render) {
            const get_compass = (lvl: number): Compass => [
                z.compass.n.has( lvl ) ? 1 : 0,
                z.compass.e.has( lvl ) ? 1 : 0,
                z.compass.s.has( lvl ) ? 1 : 0,
                z.compass.w.has( lvl ) ? 1 : 0,
            ];
            this.#renderer.add( lvls, z.x, z.y, get_compass );
        }

        this.#renderer.flush();
        for (let [ z, lvls ] of to_clear) this.#renderer.clear( lvls, z.x, z.y );

        this.#updated_zones.clear();
    }
}
