<script lang="ts">
    import CSubstrate from '$lib/Substrate.svelte';
    import type { ProgressEvent } from '$lib/Substrate.svelte';
    import { onMount, tick } from 'svelte';
    import Menu from '$lib/Menu.svelte';
    import { browser, dev } from '$app/environment';
    import { cfg } from '$lib/cfg-store.svelte';

    let show_substrate = $state( false );
    let overlay = $state( '' );

    function update_theme_color( color: string ) {
        if (!color || !browser) return;
        const meta_el = document.getElementById( 'meta-theme-color' );
        if (meta_el) meta_el.setAttribute( 'content', color );
    }
    $effect(() => update_theme_color( cfg.look.ui_theme.bg ));

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
    let progress: ProgressEvent = $state( initstate );

    function reset() {
        show_substrate = false;
        progress = initstate;
    }
    $effect(() => (cfg.seed, cfg.look_index, cfg.supersample, reset()));

    let before_start = false;
    async function toggle() {
        before_start = true;
        await tick();
        before_start = false;

        if (show_substrate && playpause && !progress.done) {
            playpause();
        }
        else {
            if (progress.done) cfg.seed = (Math.random() + '').substring( 2 );
            show_substrate = false;
            progress = initstate;
            await tick();

            show_substrate = true;
        }
    }

    let playpause: () => Promise<void>;
    let download: (name: string) => void;
    async function file_download() {
        if (!download) return;

        overlay = 'downloading ...';
        await new Promise( r => setTimeout( r, 1000 ));

        download( cfg.look.name );

        overlay = '';
        await new Promise( r => setTimeout( r, 1000 ));
    }

    let init = $state( dev );
    onMount(() => {
        show_substrate = false;
        if (!init) setTimeout(() => init = true, 0 );
    });
</script>

<main
    class:init
    class:empty={!progress.width && !progress.height}
    class:before-start={before_start}

    style:--ui--bg={cfg.look.ui_theme.bg}
    style:--ui--btn-bg={cfg.look.ui_theme.btn_bg}
    style:--ui--btn-fg={cfg.look.ui_theme.btn_fg}
    style:--canvas-bg={cfg.look.look.lines.bg}
>
    <div class=sbst>
        {#if show_substrate}
            <CSubstrate
                onprogress={s => progress = s}
                bind:playpause
                bind:download
            />
        {/if}
    </div>

    <Menu
        started={progress.started}
        playing={progress.playing}

        ontoggle={toggle}
        ondownload={file_download}
    />

    <div class="info">
        <div class="progress" class:started={progress.started} class:done={progress.done}>
            <div style="width: {Math.min( 1, Math.max( 0, progress.progress ) )*100}%"></div>
        </div>

        <div class=res>{progress.width&&progress.height ? `${progress.width}x${progress.height}` : ''}</div>
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

        background: var(--ui--bg);
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

        gap: 16px;
    }
    .info > div {
        height: 16px;
        line-height: 16px;

        background: var(--ui--btn-bg);
        border-radius: 8px;
    }
    .info .res {
        flex: 0 0 auto;
        margin-right: 16px;

        color: var(--ui--btn-fg);
        background: transparent;

        font-size: 10px;
        opacity: .5;
    }
    .info .progress {
        flex: 1 1 auto;
        overflow: hidden;
        transition: opacity 600ms;
    }
    .info .progress.done {
        background: var(--ui--btn-fg);
        opacity: .1;
    }
    .info .progress > div {
        max-width: 100%;
        height: 100%;
        transition: background-color 300ms;
        background: var(--ui--btn-fg);
        border-radius: 8px;

        box-shadow: 0 0 0 4px var(--ui--bg);
    }
    .info .progress:not( .started ) > div {
        opacity: 0;
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
