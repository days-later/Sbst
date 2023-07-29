<script lang="ts">
    import type { LookOption } from "./Looks";

    export let ui: LookOption["ui_theme"];

    export let v: number;
    export let started: boolean;
    export let active: boolean;
    export let done: boolean;

</script>

<div class="progress" class:started class:active class:done style:--fg={ui.pg || ui.fg} style:--bg={ui.bg}>
    <div style="width: {Math.min( 1, Math.max( 0, v ) )*100}%"></div>
</div>

<style>
    .progress {
        flex: 0 0 5px;
        height: 5px;
        background: var(--bg);
    }
    .progress > div {
        max-width: 100%;
        height: 100%;
        transition: background-color 300ms;
        background: var(--fg);
    }
    .progress.done > div {
        display: none;
    }

</style>
