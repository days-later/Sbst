<script lang="ts">
    import '../app.css';
    import CSubstrate from '$lib/Substrate.svelte';
    import type { ProgressEvent } from '$lib/Substrate.svelte';
    import Controls from '$lib/Controls.svelte';
    import { onMount, tick } from 'svelte';
    import { Looks } from '$lib/Looks';

    let show_substrate = false;
    let inactive = false;

    let seed = '12';
    let supersample = 1;

    let li = 4;
    $: look = Looks[ li ];

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
    async function shuffle() {
        show_substrate = false;
        seed = (Math.random() + '').substring( 2 );
        state = initstate;
        inactive = true;

        await tick();
        show_substrate = true;
    }

    async function toggle() {
        if (show_substrate && playpause && !state.done) {
            playpause();
        }
        else {
            inactive = true;
            show_substrate = false;
            state = initstate;
            await tick();

            show_substrate = true;
        }
    }

    let playpause: () => Promise<void>;
    let download: (name: string) => void;

    onMount(() => {
        // #6491474348767827
        if (window.location.hash) seed = window.location.hash.substring( 1 );
        show_substrate = false;
    });
</script>

<main class:started={state.started} class:paused={!state.playing} class:done={state.done} class:inactive>
    <div class="progress"><div style="width: {state.progress*100}%"></div></div>

    <div class="info">
        <select bind:value={li}>
            {#each Looks as l, i}
                <option value={i}>{l.name}</option>
            {/each}
        </select>
        <span class="seed">#{seed}</span>
        <span class="size">{state.width} × {state.height} (x{supersample})</span>
        <span class="progress-pc">{(state.progress*100).toFixed( 1 )}%</span>
        <span class="cracks">{state.active_cracks} / {state.max_cracks}</span>
        <span class="runtime">{(state.runtime/1000).toFixed( 1 )}s</span>
    </div>

    <div class="wrapper">
        <div>
            {#if show_substrate}
                <CSubstrate
                    {seed}
                    {supersample}
                    look={Looks[li].look}

                    bind:playpause
                    bind:download

                    on:init={() => inactive = false }
                    on:progress={e => state = e.detail }
                />
            {/if}
        </div>
    </div>

    <Controls
        canShuffle={!state.started || state.done}
        started={state.started}
        playing={state.playing}

        on:shuffle={shuffle}
        on:reset={reset}
        on:toggle={toggle}
        on:download={() => download( look.name )}
    />
</main>

<style>
    .wrapper {
        position: relative;
        flex: 1 1 auto;
        min-height: 0;
        margin: 0 2rem 0;

        display: grid;
        place-items: center;
    }
    .wrapper > div {
        width: 100%;
        height: 100%;

        --width: 400px;
        --height: 400px;

        max-width: 100%;
        max-height: 100%;

        background: rgba(0,0,0,0.025);
    }

    main {
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;

        display: flex;
        flex-flow: column nowrap;
        align-items: stretch;

        background: #eee;
        overflow: hidden;
    }
    main.inactive {
        opacity: .2;
        pointer-events: none;
    }

    .progress {
        flex: 0 0 auto;

        display: flex;
        flex-flow: column nowrap;
        align-items: flex-start;

        --progress-bar-height: .5rem;
        height: var( --progress-bar-height );
        background: rgba(0,0,0,0.05);
    }
    .progress > div {
        display: none;
        max-width: 100%;
        height: var( --progress-bar-height );
        background: #000;
        transition: background-color 300ms;
    }
    .started .progress > div {
        display: block;
    }
    .paused .progress > div {
        background: #aaa;
    }
    .done .progress > div {
        background: #ddd;
    }

    .info {
        display: flex;
        flex-flow: row wrap;
        justify-content: flex-end;
        align-items: center;

        margin: 0 0 2rem;
    }
    .info span {
        min-width: 50px;
        margin: .5rem 1rem 0 0;
        text-align: right;
        font-size: .75rem;
        color: #777;
    }

    .info select {
        appearance: none;
        margin: .5rem 1rem 0 0;
        padding: 0;
        background: transparent;
        border: 0;
        font-family: inherit;
        font-size: .75rem;
    }

</style>
