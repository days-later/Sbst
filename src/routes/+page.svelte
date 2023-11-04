<script lang="ts">
    import CSubstrate from '$lib/Substrate.svelte';
    import type { ProgressEvent } from '$lib/Substrate.svelte';
    import { onMount, tick } from 'svelte';
    import Progress from '$lib/Progress.svelte';
    import Menu from '$lib/Menu.svelte';
    import { Looks } from '$lib/Looks';
    import { persisted } from 'svelte-persisted-store'
    import { dev } from '$app/environment';

    let show_substrate = false;

    let overlay = '';

    const cfg = persisted( 'sb-app-cfg', {
        seed: '12',
        supersample: 1,
        li: 2,
    });

    $: lo = Looks[ $cfg.li ];
    $: ui = Looks[ $cfg.li ].ui_theme;

    const initstate: ProgressEvent = {
        started: false,
        playing: false,
        done: false,

        progress: 0,
        active_cracks: 0,
        max_cracks: 0,

        runtime: 0,
    };
    let state: ProgressEvent = initstate;

    function reset() {
        show_substrate = false;
        state = initstate;
    }
    $: $cfg, reset();

    async function toggle() {
        if (show_substrate && playpause && !state.done) {
            playpause();
        }
        else {
            if (state.done) $cfg.seed = (Math.random() + '').substring( 2 );
            show_substrate = false;
            state = initstate;
            await tick();

            show_substrate = true;
        }
    }

    function pause() {
        if (playpause && state.started && state.playing && !state.done) {
            playpause();
        }
    }

    let playpause: () => Promise<void>;
    let download: (name: string) => void;
    async function file_download() {
        if (!download) return;

        overlay = 'downloading ...';
        await new Promise( r => setTimeout( r, 1000 ));

        download( lo.name );

        overlay = '';
        await new Promise( r => setTimeout( r, 1000 ));
    }

    let init = dev;
    onMount(() => {
        show_substrate = false;

        //console.log( $cfg.seed );

        if (!dev) setTimeout(() => {
            init = true;
        }, 300 );
    });
</script>

<main class:init style:--fg={ui.fg} style:--bg={ui.bg} style:--pg={ui.pg || ui.fg}>
    <div class=sbst>
        {#if show_substrate}
            <CSubstrate
                seed={$cfg.seed}
                supersample={$cfg.supersample}
                look={lo.look}

                bind:playpause
                bind:download

                on:progress={e => state = e.detail }
            />
        {/if}
    </div>

    <Progress
        {ui}
        v={state.progress}
        started={state.started}
        active={state.playing}
        done={state.done}
    />

    <Menu
        bind:li={$cfg.li}
        bind:supersample={$cfg.supersample}

        started={state.started}
        playing={state.playing}

        on:toggle={toggle}
        on:pause={pause}
        on:download={file_download}
    />
</main>

<div class="overlay" class:hidden={!overlay}>
    <span class="s1">{overlay}</span>
    <span class="s2">{overlay}</span>
</div>


<style>
    main {
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;

        display: flex;
        flex-flow: column nowrap;
        align-items: stretch;

        background: var( --bg, #000 );
        overflow: hidden;

        transition: opacity 600ms;
    }
    main:not( .init ) {
        opacity: 0;
    }

    main > div {
        flex: 1 1 auto;
        width: 100%;
        overflow: hidden;
    }

    .overlay {
        position: fixed;
        z-index: 9999;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;


        backdrop-filter: blur(12px) saturate(50%) contrast(120%);
        opacity: .97;

        display: grid;
        place-items: center;
        font-size: 5vw;
        color: #0003;

        transition: opacity 1s;
    }
    .overlay > span {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
    }
    @keyframes hang {
        from {
            transform: translate3d( 0, 0, 0 );
        }

        20% {
            transform: translate3d( 0, .3vw, 0 );
        }

        to {
            transform: translate3d( 0, 0, 0 );
        }
    }
    .overlay:not( .hidden ) .s2 {
        animation: 4s hang infinite;
    }

    .overlay.hidden {
        opacity: 0;
        pointer-events: none;
    }




</style>
