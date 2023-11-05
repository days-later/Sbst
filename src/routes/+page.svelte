<script lang="ts">
    import CSubstrate from '$lib/Substrate.svelte';
    import type { ProgressEvent } from '$lib/Substrate.svelte';
    import { onMount, tick } from 'svelte';
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

    function update_theme_color( color: string ) {
        if (!color) return;
        const meta_el = document.getElementById( 'meta-theme-color' );
        if (meta_el) meta_el.setAttribute( 'content', color );
    }
    $: update_theme_color( lo.ui_theme.theme || lo.ui_theme.fg );

    const initstate: ProgressEvent = {
        started: false,
        playing: false,
        done: false,

        width: 0,
        height: 0,

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

    let before_start = false;
    async function toggle() {
        before_start = true;
        await tick();
        before_start = false;

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

<main
    class:init
    class:empty={!state.width && !state.height}
    class:before-start={before_start}

    style:--fg={lo.ui_theme.fg}
    style:--bg={lo.ui_theme.bg}
    style:--pg={lo.ui_theme.pg || lo.ui_theme.fg}
    style:--canvas-bg={lo.look.lines.bg}
>
    <div class=sbst>
        {#if show_substrate}
            <CSubstrate
                seed={$cfg.seed}
                supersample={$cfg.supersample}
                look={lo.look}

                bind:playpause
                bind:download

                on:progress={e => state = e.detail}
            />
        {/if}
    </div>

    <Menu
        bind:li={$cfg.li}
        bind:supersample={$cfg.supersample}

        started={state.started}
        playing={state.playing}

        on:toggle={toggle}
        on:pause={pause}
        on:download={file_download}
    />

    <div class="info">
        <div class="progress" class:done={state.done}>
            <div style="width: {Math.min( 1, Math.max( 0, state.progress ) )*100}%"></div>
        </div>

        <div class=res>{state.width}&times;{state.height}</div>
    </div>

</main>

<div class="overlay" class:hidden={!overlay}>
    <span class="s1">{overlay}</span>
    <span class="s2">{overlay}</span>
</div>


<style>
    main {
        position: fixed;
        inset: 0;

        display: flex;
        flex-flow: column nowrap;
        align-items: stretch;

        padding: 32px;
        gap: 8px;

        background: var(--bg);
        transition: opacity 600ms;
    }
    main:not( .init ) {
        opacity: 0;
    }

    .sbst {
        flex: 1 1 auto;

        border-radius: 8px;
        overflow: hidden;
    }

    .info {
        display: flex;
        flex-flow: row nowrap;
        align-items: stretch;

        gap: 8px;
    }
    .info > div {
        height: 16px;
        line-height: 16px;

        background: rgba(0,0,0,0.04);
        border-radius: 8px;
    }
    .info .res {
        flex: 0 0 auto;
        padding: 0 16px;

        color: var(--fg);
        font-size: 10px;
    }
    .info .progress {
        flex: 1 1 auto;
        overflow: hidden;
        transition: opacity 600ms;
    }
    .info .progress.done {
        background: var(--pg);
        opacity: .1;
    }
    .info .progress > div {
        max-width: 100%;
        height: 100%;
        transition: background-color 300ms;
        background: var(--pg);
        border-radius: 8px;

        box-shadow: 0 0 0 4px var(--bg);
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


    @media (max-width: 640px) {
        main {
            padding: 8px;
        }
    }



</style>
