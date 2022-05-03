import Spacer from "components/layout/Spacer.vue";
import { jsx, Visibility } from "features/feature";
import { createResource, trackBest, trackOOMPS, trackTotal } from "features/resources/resource";
import { branchedResetPropagation, createTree, GenericTree } from "features/trees/tree";
import { globalBus } from "game/events";
import { createLayer, GenericLayer } from "game/layers";
import player, { PlayerData } from "game/player";
import Decimal, { DecimalSource, format, formatTime } from "util/bignum";
import { render } from "util/vue";
import { computed, toRaw } from "vue";
import factor from "./layers/factor";
import number from "./layers/number";
/**
 * @hidden
 */
export const main = createLayer("main", () => {
    const points = createResource<DecimalSource>(0, "points", 2);
    const best = trackBest(points);
    const total = trackTotal(points);

    const pointGain = computed(() => {
        // eslint-disable-next-line prefer-const
        let gain = new Decimal(1);
        if (number.up1.bought.value) gain = gain.times(4);
        if (number.up2.bought.value) gain = gain.times(number.upgradeEffects[2].value);
        if (number.up3.bought.value) gain = gain.times(number.upgradeEffects[3].value);
        if (number.up9.bought.value) gain = gain.times(number.upgradeEffects[7].value);
        if (factor.mi1.earned.value) gain = gain.times(factor.milestoneEffects[1].value);

        if (factor.cha1.active.value) gain = gain.pow(0.5);
        if (factor.cha2.active.value) gain = Decimal.pow(4, factor.points.value);
        return gain;
    });
    globalBus.on("update", diff => {
        points.value = Decimal.add(points.value, Decimal.times(pointGain.value, diff));
    });
    const oomps = trackOOMPS(points, pointGain);

    const tree = createTree(() => ({
        nodes: [[number.treeNode], [factor.treeNode]],
        branches: () => {
            const b = [];

            if (factor.treeNode.visibility.value == Visibility.Visible) {
                b.push({
                    startNode: factor.treeNode,
                    endNode: number.treeNode
                });
            }

            return b;
        },

        onReset() {
            points.value = toRaw(this.resettingNode.value) === toRaw(number.treeNode) ? 0 : 10;
            best.value = points.value;
            total.value = points.value;
        },
        resetPropagation: branchedResetPropagation
    })) as GenericTree;

    return {
        name: "Tree",
        links: tree.links,
        display: jsx(() => (
            <>
                {player.devSpeed === 0 ? <div>Game Paused</div> : null}
                {player.devSpeed && player.devSpeed !== 1 ? (
                    <div>Dev Speed: {format(player.devSpeed || 0)}x</div>
                ) : null}
                {player.offlineTime != undefined ? (
                    <div>Offline Time: {formatTime(player.offlineTime || 0)}</div>
                ) : null}
                <div>
                    {Decimal.lt(points.value, "1e1000") ? <span>You have </span> : null}
                    <h2>{format(points.value)}</h2>
                    {Decimal.lt(points.value, "1e1e6") ? <span> points</span> : null}
                </div>
                {Decimal.gt(pointGain.value, 0) ? <div>({oomps.value})</div> : null}
                <Spacer />
                {render(tree)}
            </>
        )),
        points,
        best,
        total,
        oomps,
        tree
    };
});

export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<PlayerData>
): Array<GenericLayer> => [main, number, factor];

export const hasWon = computed(() => {
    return Decimal.gte(factor.points.value, 13);
});

/* eslint-disable @typescript-eslint/no-unused-vars */
export function fixOldSave(
    oldVersion: string | undefined,
    player: Partial<PlayerData>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */
