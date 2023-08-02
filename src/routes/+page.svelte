<script lang="ts">
    import CSubstrate from '$lib/Substrate.svelte';
    import type { ProgressEvent } from '$lib/Substrate.svelte';
    import { onMount, tick } from 'svelte';
    import Progress from '$lib/Progress.svelte';
    import Menu from '$lib/Menu.svelte';
    import { Looks } from '$lib/Looks';
    import { persisted } from 'svelte-local-storage-store'
    import { dev } from '$app/environment';

    let show_substrate = false;

    // hi :)

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

        width: 0,
        height: 0,

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

    let init = dev;
    onMount(() => {
        show_substrate = false;

        const dpr = window.devicePixelRatio;
        if (dpr >= 1.8) $cfg.supersample = 2;
        else if (dpr >= 1.3) $cfg.supersample = 1.5;
        else $cfg.supersample = 1;

        //console.log( $cfg.seed );

        if (!dev) setTimeout(() => {
            init = true;
        }, 300 );
    });
</script>

<main class:init style:--bg={ui.bg}>
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
        {ui}

        bind:li={$cfg.li}
        bind:supersample={$cfg.supersample}

        started={state.started}
        playing={state.playing}

        on:toggle={toggle}
        on:pause={pause}
        on:download={() => download && download( lo.name )}
    />
</main>

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


</style>
