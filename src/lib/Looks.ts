import type { TileRendererProp } from "./Sb/Zone"


export type CracksLook = {
    padding?: { size: number, chance: number },
    padding_straggler?: { size: number, chance: number },

    max_cracks: number,
    initial_cracks: number,
    crack_seeds: number,
    spawn_extra_crack_chances: number[], // [ chance of an extra crack, chance of an extra crack, ... ]

    angel_jitter?: [ number, number ]
    seed_angle?: [ number, number ]

    straggler_chance: number,

    placed_pixels_share: number,

    steps_per_frame?: number,

    reseed?: {
        max_attempts: number,
        seed_count: number,
    },

    density?: {
        zone_count: number,
        max_fill_lvl: number,
        max_filled_zones?: number,
    },
}


export type LineStyle = {
    style: string,
    width: number,
    opacity: number,
    chance?: number,
}
export type LinesLook = {
    bg: string,
    line: LineStyle,
    road: LineStyle,
    straggler: LineStyle,
}

type ZoneLayer = {
    color?: string,
    opacity?: number,

    render?: TileRendererProp,

    fill_chance?: number,
    clear_chance?: number,
}
export type ZoneLayers = {
    outside?: (ZoneLayer & {
        radius: [ number, number ],
    })[],
    center?: ZoneLayer,
    inside?: ZoneLayer & {
        // walk_circle with this radius, the tile counts as "inside" if all walked tiles are of lvl "center" or "inside"
        radius: number,
    },
}
export type ZoneLook = {
    zone_count: number,

    layers: ZoneLayers,

    allow_straggler?: boolean | {
        empty?: boolean,
        outside_lvls?: boolean | Set<number>,
        center?: boolean,
        inside?: boolean,
    },
}

export type SbLook = {
    cracks: CracksLook,
    lines: LinesLook,
    zone: ZoneLook,
}

export type LookOption = {
    name: string,
    ui_theme: {
        bg: string,
        fg: string,
        pg?: string,
        theme?: string,
    },
    look: SbLook
}
export const Looks: LookOption[] = [];


Looks[ 0 ] = {
    name: 'Land+Sea',

    ui_theme: {
        bg: '#fff',
        fg: '#000',
        theme: '#b5e5ff',
    },

    look: {
        lines: {
            bg: '#b5e5ff',
            line: { style: '#453206', opacity: .4, width: 1 },
            road: { style: '#453206', opacity: .2, width: 3 },
            straggler: { style: '#fff', opacity: .6, width: 1 },
        },

        zone: {
            zone_count: 100,

            layers: {
                outside: [
                    {
                        radius: [ 0, 10 ],
                        color: '#c4efff',
                        render: 'shoreline_jitter',
                    },
                    {
                        radius: [ 0, 5 ],
                        color: '#fff',
                        render: 'shoreline',
                    },
                    {
                        radius: [ 0, 2 ],
                        color: '#afb',
                        opacity: .5,
                        render: [ 'shoreline_jitter', .25 ],
                    },
                ],
                center: {
                    color: '#cfd',
                    render: 'shoreline',
                },
                inside: {
                    color: '#eff',
                    radius: 2,
                    render: 'fill_jitter',
                },

            },

            allow_straggler: { empty: true },
        },

        cracks: {
            padding: { size: 0, chance: .98 },
            //padding_straggler?: { size: number, chance: number },

            max_cracks: .002,
            initial_cracks: 8,
            crack_seeds: 4,

            spawn_extra_crack_chances: [ 1, .25 ],

            straggler_chance: 1,

            placed_pixels_share: .1,

            density: {
                zone_count: 100,
                max_fill_lvl: 0.6,
            },
        },
    }
}


Looks[ 1 ] = {
    name: 'minus',

    ui_theme: {
        bg: '#fff',
        fg: '#f52cee',
    },

    look: {
        lines: {
            bg: '#2cf5af',
            line: { style: '#fff', opacity: 1, width: 1, chance: 1 },
            road: { style: '#000', opacity: 0, width: 0, chance: 0 },
            straggler: { style: '#fff', opacity: 1, width: 1, chance: 0 },
        },

        zone: {
            zone_count: 300,

            layers: {
                outside: [
                    {
                        radius: [ 0, 3 ],
                        color: '#f52cee',
                        render: 'shoreline_jitter',
                    },
                    {
                        radius: [ 0, 2 ],
                        color: '#fff',
                        render: 'shoreline_jitter',
                    },
                ],
                center: {
                    color: '#eef',
                    render: 'shoreline_jitter',
                },
            },

            allow_straggler: false,
        },

        cracks: {
            padding: { size: 0, chance: 0 },
            //padding_straggler?: { size: number, chance: number },

            max_cracks: .002,
            initial_cracks: 8,
            crack_seeds: 4,

            spawn_extra_crack_chances: [ 1, 1 ],

            straggler_chance: 0,

            placed_pixels_share: .1,

            density: {
                zone_count: 100,
                max_fill_lvl: 0.6,
            },
        },
    }
}


Looks[ 2 ] = {
    name: 'ü',

    ui_theme: {
        bg: '#222',
        fg: '#f5f0b3',
    },

    look: {
        lines: {
            bg: '#222',
            line: { style: '#222', opacity: .75, width: 1, chance: 0.8 },
            road: { style: '#f5f0b3', opacity: 1, width: 4, chance: .6 },
            straggler: { style: '#f5f0b3', opacity: .25, width: 1 },
        },

        zone: {
            zone_count: 150,

            layers: {
                outside: [
                    { radius: [ 0, 3 ] },
                    {
                        radius: [ 0, 2 ],
                        color: '#f5f0b3',
                        render: [ 'fill_jitter', .5 ],
                    },
                ],
                center: {
                    color: '#f5f0b3',
                },
            },

            allow_straggler: { empty: true },
        },

        cracks: {
            padding: { size: 0, chance: 0 },
            //padding_straggler?: { size: number, chance: number },

            max_cracks: .002,
            initial_cracks: 8,
            crack_seeds: 4,

            spawn_extra_crack_chances: [ 1, .75 ],

            straggler_chance: 1,

            placed_pixels_share: .1,

            density: {
                zone_count: 100,
                max_fill_lvl: 0.6,
            },
        },
    }
}


Looks[ 3 ] = {
    name: 'glow',

    ui_theme: {
        bg: '#fffede',
        fg: '#777',
        pg: '#777',
        theme: '#fffede',
    },

    look: {
        lines: {
            bg: '#fffede',
            line: { style: '#daffc7', opacity: 1, width: 1, chance: 0 },
            road: { style: '#f0f', opacity: 1, width: 1, chance: 0 },
            straggler: { style: '#000', opacity: .4, width: 1, chance: .7 },
        },

        zone: {
            zone_count: 100,

            layers: {
                outside: [
                    {
                        radius: [ 0, 1 ],
                        color: '#fff',
                        opacity: .3,
                        render: 'shoreline',
                    },
                ],
                center: {
                    color: '#fff',
                },
            },

            allow_straggler: { empty: true, outside_lvls: true },
        },

        cracks: {
            padding: { size: 0, chance: 0 },
            //padding_straggler?: { size: number, chance: number },

            max_cracks: .002,
            initial_cracks: 8,
            crack_seeds: 4,

            spawn_extra_crack_chances: [ 1, .2 ],

            straggler_chance: 1,

            placed_pixels_share: .1,

            density: {
                zone_count: 100,
                max_fill_lvl: 0.6,
            },
        },
    }
}


Looks[ 4 ] = {
    name: 'PLAN',

    ui_theme: {
        bg: '#fff',
        fg: '#777',
        pg: '#ddd'
    },

    look: {
        lines: {
            bg: '#fff',
            line: { style: '#000', opacity: 1, width: 1, chance: .75 },
            road: { style: '#fff', opacity: 1, width: 5, chance: 0 },
            straggler: { style: '#aaa', opacity: 1, width: 1, chance: .75 },
        },

        zone: {
            zone_count: 10,

            layers: {
                //outside: [],
                //center: {},
            },

            allow_straggler: true,
        },

        cracks: {
            padding: { size: .15, chance: 0 },
            padding_straggler: { size: 0, chance: 1 },

            max_cracks: .002,
            initial_cracks: 4,
            crack_seeds: 8,

            spawn_extra_crack_chances: [ 1, .2 ],

            angel_jitter: [ -1, 1 ],

            straggler_chance: 1,

            placed_pixels_share: .15,

            density: {
                zone_count: 100,
                max_fill_lvl: 0.6,
            },
        },
    }
}


Looks[ 5 ] = {
    name: 'inf',

    ui_theme: {
        bg: '#fff',
        fg: '#f26',
        pg: '#f26'
    },

    look: {
        lines: {
            bg: '#fff',
            line: { style: '#fff', opacity: 1, width: .25, chance: 1 },
            road: { style: '#000', opacity: 1, width: 5, chance: 0 },
            straggler: { style: '#fff', opacity: 1, width: 5, chance: 1 },
        },

        zone: {
            zone_count: 320,

            layers: {
                outside: [
                    //{ radius: [ 0, 6 ], color: '#ccc', opacity: .05, render: [ 'fill_jitter', { v: 10, c: 20 } ], fill_chance: .25 },
                    //{ radius: [ 0, 3 ], color: '#000', opacity: 1, render: [ 'fill_jitter', { v: 2, c: 12 } ], fill_chance: 1 },

                    { radius: [ 0, 6 ], color: '#f26', opacity: .1, render: [ 'fill_jitter', 5 ], fill_chance: .25 },
                    { radius: [ 0, 6 ], color: '#f26', opacity: .1, render: [ 'fill_jitter', 5 ], fill_chance: .25 },
                    { radius: [ 0, 3 ], color: '#f26', opacity: .1, render: [ 'fill_jitter', 1 ], fill_chance: 1 },
                    { radius: [ 0, 1 ], color: '#fff', opacity: .15, render: [ 'fill_jitter', { v: 20, c: 0 } ], fill_chance: .5 },
                    //{ radius: [ 0, 4 ], color: '#f00', opacity: .05, render_type: 'fill', fill_chance: .5 },
                ],
                //center: {},
            },

            allow_straggler: true,
        },

        cracks: {
            padding: { size: .4, chance: .993 },
            //padding_straggler: { size: 0, chance: 1 },

            max_cracks: .002,
            initial_cracks: 8,
            crack_seeds: 4,

            spawn_extra_crack_chances: [ 1 ],

            straggler_chance: 0,

            placed_pixels_share: .1,
        },
    }
}


Looks[ 6 ] = {
    name: 'crx',

    ui_theme: {
        bg: '#2af',
        fg: '#fff',
        pg: '#fff',
        theme: '#2af',
    },

    look: {
        lines: {
            bg: '#2af',
            line: { style: '#f26', opacity: 1, width: 1, chance: 0 },
            road: { style: '#fff', opacity: 1, width: 5, chance: 0 },
            straggler: { style: '#fff', opacity: 1, width: 1, chance: 1 },
        },

        zone: {
            zone_count: 100,

            layers: {
                outside: [
                    { radius: [ 0, 1 ], color: '#fff', opacity: 1, render: [ 'fill_jitter', 8 ] },
                ],
                //center: {},
            },

            allow_straggler: true,
        },

        cracks: {
            padding: { size: 0, chance: 0 },
            padding_straggler: { size: 0, chance: 1 },

            max_cracks: .002,
            initial_cracks: 1,
            crack_seeds: 1,
            seed_angle: [ 60, 60 ],

            spawn_extra_crack_chances: [ 1, 1, 1, 1 ],

            angel_jitter: [ -30, 30 ],


            straggler_chance: 1,

            placed_pixels_share: .1,
        },
    }
}


Looks[ 7 ] = {
    name: 'tenna',

    ui_theme: {
        bg: '#fffeeb',
        fg: '#ff7575',
        pg: '#ff7575'
    },

    look: {
        lines: {
            bg: '#fffeeb',
            line: { style: '#e3e1a1', opacity: 1, width: 1, chance: .35 },
            road: { style: '#000', opacity: 1, width: 1, chance: 0 },
            straggler: { style: '#ff7575', opacity: 1, width: 4, chance: 1 },
        },

        zone: {
            zone_count: 160,

            layers: {
                outside: [
                    { radius: [ 11, 14 ], color: '#e3e1a1', opacity: .08, render: "shoreline_jitter" },
                    { radius: [ 0, 12 ], color: '#e3e1a1', opacity: 1, render: "shoreline_jitter" },
                    { radius: [ 1, 4 ], color: '#ff7575', opacity: .12, render: "shoreline_jitter" },
                    { radius: [ 0, 2 ], color: '#ff7575', opacity: 1, render: "shoreline" },
                ],
                center: { color: '#ff7575', render: "shoreline" },
            },

            allow_straggler: { empty: true },
        },

        cracks: {
            padding: { size: .15, chance: 0 },
            padding_straggler: { size: 0, chance: 1 },

            max_cracks: .002,
            initial_cracks: 2,
            crack_seeds: 2,
            seed_angle: [ 60, 60 ],
            reseed: { seed_count: 2, max_attempts: 12 },

            spawn_extra_crack_chances: [ 1, 1, 1, 1 ],

            angel_jitter: [ 0, 0 ],


            straggler_chance: .25,

            placed_pixels_share: .04,

            steps_per_frame: 8,


            density: {
                zone_count: 100,
                max_fill_lvl: .4,
                //max_filled_zones: .1,
            },
        },
    }
}
