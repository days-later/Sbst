import type { SbLook } from "./Sb/Sb";

export type LookOption = {
    name: string,
    ui_theme: {
        bg: string,
        fg: string,
        pg?: string
    },
    look: SbLook
};
export const Looks: LookOption[] = [];


Looks[ 0 ] = {
    name: 'Land+Sea',

    ui_theme: {
        bg: '#fff',
        fg: '#000',
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
                        render_type: 'shoreline_jitter',
                    },
                    {
                        radius: [ 0, 5 ],
                        color: '#fff',
                        render_type: 'shoreline',
                    },
                    {
                        radius: [ 0, 2 ],
                        color: '#afb',
                        opacity: .5,
                        render_type: 'shoreline_jitter',
                        render_var: .25,
                    },
                ],
                center: {
                    color: '#cfd',
                    render_type: 'shoreline',
                },
                inside: {
                    color: '#eff',
                    radius: 2,
                    render_type: 'fill_jitter',
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
                        render_type: 'shoreline_jitter',
                    },
                    {
                        radius: [ 0, 2 ],
                        color: '#fff',
                        render_type: 'shoreline_jitter',
                    },
                ],
                center: {
                    color: '#eef',
                    render_type: 'shoreline_jitter',
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
            straggler: { style: '#f5f0b3', opacity: .1, width: 1 },
        },

        zone: {
            zone_count: 150,

            layers: {
                outside: [
                    { radius: [ 0, 3 ] },
                    {
                        radius: [ 0, 2 ],
                        color: '#f5f0b3',
                        render_type: 'fill_jitter',
                        render_var: 0.5,
                    },
                ],
                center: {
                    color: '#f5f0b3',
                    render_var: 0,
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
        pg: '#fff',
    },

    look: {
        lines: {
            bg: '#fffede',
            line: { style: '#daffc7', opacity: 1, width: 1, chance: 0 },
            road: { style: '#f0f', opacity: 1, width: 1, chance: 0 },
            straggler: { style: '#000', opacity: .1, width: 1, chance: .7 },
        },

        zone: {
            zone_count: 100,

            layers: {
                outside: [
                    {
                        radius: [ 0, 1 ],
                        color: '#fff',
                        opacity: .3,
                        render_type: 'shoreline',
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
        pg: '#000'
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
            initial_cracks: 8,
            crack_seeds: 4,

            spawn_extra_crack_chances: [ 1, .2 ],

            straggler_chance: 1,

            placed_pixels_share: .15,

            density: {
                zone_count: 100,
                max_fill_lvl: 0.6,
            },
        },
    }
}
