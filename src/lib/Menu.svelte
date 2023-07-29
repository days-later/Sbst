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

    <select bind:value={li} disabled={playing}>
        {#each Looks as l, i}
            <option value={i}>{l.name}</option>
        {/each}
    </select>

    <select bind:value={supersample} disabled={playing}>
        <option value={.25}>25%</option>
        <option value={.5}>50%</option>
        <option value={1}>100%</option>
        <option value={1.5}>150%</option>
        <option value={2}>200%</option>
        <option value={5}>500%</option>
    </select>

    <button disabled={!started || playing} on:click={() => dispatch( 'download' )}>
        <svg viewBox="0 -960 960 960"><path d="M480-340 358.5-462.5l16-15 95 94V-748h22v364.5l95-94 16 15L480-340ZM212-212v-151.5h22V-234h492v-129.5h22V-212H212Z"/></svg>
    </button>
</div>



<style>
    .menu {
        flex: 0 0 auto;

        display: flex;
        flex-flow: row wrap;
        align-items: stretch;

        font-size: max( 48px, 5vmin );

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
        height: 1.5em;

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
        height: 1.5em;

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
        transform: translateY( 1px );
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


</style>
