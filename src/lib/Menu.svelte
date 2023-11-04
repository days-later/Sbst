<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Looks, type LookOption } from './Looks';

    const dispatch = createEventDispatcher<{ toggle: null, pause: null, download: null }>();

    export let ui: LookOption["ui_theme"];

    export let li: number;
    export let supersample: number;

    export let started: boolean;
    export let playing: boolean;

</script>

<div class="menu" style:--fg={ui.fg} style:--bg={ui.bg}>
    <button on:click={() => dispatch( 'toggle' )}>
        {#if playing}
            <svg viewBox="0 -960 960 960"><path d="M559.5-252v-456h138v456h-138Zm-296 0v-456h139v456h-139Z"/></svg>
        {:else}
            <svg viewBox="0 -960 960 960"><path d="M372-295v-372l292 186-292 186Z"/></svg>
        {/if}
    </button>

    <select class="look" bind:value={li} disabled={playing}>
        {#each Looks as l, i}
            <option value={i}>{l.name}</option>
        {/each}
    </select>

    <select bind:value={supersample} disabled={playing}>
        <option value={.25}>x.25</option>
        <option value={.5}>x.5</option>
        <option value={1}>x1</option>
        <option value={2}>x2</option>
        <option value={4}>x4</option>
    </select>

    <button disabled={!started || playing} on:click={() => dispatch( 'download' )}>
        <svg viewBox="0 0 20 16" style="transform: scale(.4)">
            <path d="M0 0 L20 0 L10 12 Z" />
            <rect x=0 y=14 width=100% height=4 />
        </svg>
    </button>
</div>



<style>
    .menu {
        flex: 0 0 auto;

        display: flex;
        flex-flow: row wrap;
        align-items: stretch;
        gap: 8px;

        padding: 8px;

        --a: max( 48px, 5vmin );
        font-size: var(--a);

        color: var(--fg);
        background: var(--bg);

        overflow: hidden;
    }

    button {
        flex: 1 1 auto;

        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        align-items: center;

        min-width: 0;
        height: calc( var(--a) * 1.5 );

        margin: 0;
        padding: 0 1em;

        color: inherit;
        background: inherit;
        border: 0;
        font-family: inherit;
        font-size: inherit;
        line-height: 1.5;
        text-align: center;

        overflow: hidden;
    }
    svg {
        height: 1em;
        width: 1em;
        fill: currentColor;
    }

    select {
        flex: 1 1 auto;
        min-width: 0;
        max-width: 60%;
        height: calc( var(--a) * 1.5 );

        appearance: none;
        margin: 0;
        padding: 0;

        color: inherit;
        background: inherit;

        border: 0;
        font-family: inherit;
        font-size: inherit;
        line-height: 1.5;
        text-align: center;

        overflow: hidden;
    }

    button:not( :disabled ):hover,
    select:not( :disabled ):hover {
        cursor: pointer;
        z-index: 1;
        box-shadow: inset 0 0 0 4px var(--fg), 4px 4px 0 0 rgba(0,0,0,.8);
    }

    button:disabled,
    select:disabled {
        opacity: .3;
    }

    button:focus-visible,
    select:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 4px var(--fg);
    }

    @media (max-width: 600px) {
        button, select {
            flex: 0 0 calc( 50% - 4px );
            width: calc( 50% - 4px );
            height: calc( var(--a) * 1.2 );
            line-height: 1;
            font-size: 40px;
        }
        .look {
            font-size: 32px;
        }
    }


</style>
