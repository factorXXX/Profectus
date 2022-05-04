<template>
    <Modal v-model="isOpen">
        <template v-slot:header>
            <h2>Changelog</h2>
        </template>
        <template v-slot:body>
            <details open>
                <summary>v0.0.3 New Features! - <time>2022-05-04</time></summary>
                <ul>
                    <li class="balancing">Balanced up to 28 factors.</li>
                    <li class="feature">Added Factor Calculator, a new feature!</li>
                    <li class="feature">Added more upgrade, milestone and challenge.</li>
                </ul>
            </details>
            <details open>
                <summary>v0.0.2 More things! - <time>2022-05-02</time></summary>
                <ul>
                    <li class="balancing">Balanced up to 13 factors.</li>
                    <li class="feature">
                        Added Factor Challenge as well as more upgrades and milestones.
                    </li>
                    <li class="fix">Make point gain format better.</li>
                </ul>
            </details>
            <details open>
                <summary>v0.0.1.1 - <time>2022-05-02</time></summary>
                <ul>
                    <li class="fix">Fixed some grammar problem.</li>
                </ul>
            </details>
            <details open>
                <summary>v0.0.1 Rewrite Start! - <time>2022-05-02</time></summary>
                <ul>
                    <li class="feature">
                        Added Number and Factor layer, including upgrades and milestones!
                    </li>
                </ul>
            </details>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Modal from "components/Modal.vue";
import { ref } from "vue";

const isOpen = ref(false);

defineExpose({
    open() {
        isOpen.value = true;
    }
});
</script>

<style scoped>
details {
    margin: 10px 0;
    padding-left: 18px;
}

summary {
    cursor: pointer;
    margin-bottom: 10px;
    margin-left: -18px;
}

ul {
    margin: var(--feature-margin) 0;
    background: var(--raised-background);
    border: 2px solid rgba(0, 0, 0, 0.125);
    padding: 5px 5px 5px 15px;
    list-style: inside;
}

li {
    margin: 8px 0;
}

li::before {
    padding: 2px 8px;
    margin-right: 8px;
    border-radius: var(--border-radius);
}

.feature::before {
    content: "Feature";
    background: var(--accent1);
}

.fix::before {
    content: "Fix";
    background: var(--accent2);
}

.balancing::before {
    content: "Balancing";
    background: var(--accent3);
}

.breaking::before {
    content: "Breaking";
    background: var(--danger);
}
</style>
