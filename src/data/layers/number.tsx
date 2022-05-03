/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion, createPolynomialScaling } from "features/conversion";
import { jsx, Visibility } from "features/feature";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource, displayResource } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { createUpgrade } from "features/upgrades/upgrade";
import { createLayer } from "game/layers";
import { createMultiplicativeModifier, createSequentialModifier } from "game/modifiers";
import player from "game/player";
import Decimal, { DecimalSource, format } from "util/bignum";
import { render, renderRow } from "util/vue";
import { computed, unref } from "vue";
import { createLayerTreeNode, createResetButton } from "../common";
import factor from "./factor";
const id = "n";
const layer = createLayer(id, () => {
    const name = "number";
    const color = "#4BDC13";
    const points = createResource<DecimalSource>(0, "numbers");

    const conversion = createCumulativeConversion(() => ({
        scaling: createPolynomialScaling(5, 0.5),
        baseResource: main.points,
        gainResource: points,
        roundUpCost: true,
        gainModifier: createSequentialModifier(
            createMultiplicativeModifier(upgradeEffects[4], "Number Upgrade 4", up4.bought),
            createMultiplicativeModifier(upgradeEffects[7], "Number Upgrade 7", up7.bought),
            createMultiplicativeModifier(
                factor.milestoneEffects[1],
                "Factor Milestone 1",
                factor.mi1.earned
            )
        )
    }));

    const upgradeEffects = {
        2: computed(() => {
            let power = new Decimal(0.4);
            if (up5.bought.value) power = power.add(0.2);
            let cap = new Decimal(1000);
            if (up6.bought.value) cap = cap.times(40);
            return Decimal.add(1, points.value).pow(power).min(cap);
        }),
        3: computed(() => {
            let power = new Decimal(0.2);
            if (up8.bought.value) power = power.add(0.075);
            let cap = new Decimal(30);
            if (up8.bought.value) cap = cap.times(50);
            return Decimal.add(1, main.points.value).pow(power).min(cap);
        }),
        4: computed(() => {
            let power = new Decimal(0.15);
            if (up10.bought.value) power = power.sub(0.025);
            let cap = new Decimal(20);
            if (up10.bought.value) cap = cap.times(50);
            return Decimal.add(1, main.points.value).pow(0.15).min(cap);
        }),
        7: computed(() => {
            let power = new Decimal(1);
            if (up9.bought.value) power = power.times(2);
            return Decimal.add(10, points.value).log10().pow(power);
        })
    };

    const up1 = createUpgrade(() => ({
        display: {
            title: "1",
            description: "Points gain x4"
        },
        cost: 1,
        resource: points
    }));
    const up2 = createUpgrade(() => ({
        display: {
            title: "2",
            description: "Numbers boost points gain.",
            effectDisplay() {
                return format(upgradeEffects[2].value) + "x";
            }
        },
        cost: 5,
        resource: points,
        visibility: () => (up1.bought.value ? Visibility.Visible : Visibility.None)
    }));
    const up3 = createUpgrade(() => ({
        display: {
            title: "3",
            description: "Points boost themselves.",
            effectDisplay() {
                return format(upgradeEffects[3].value) + "x";
            }
        },
        cost: 30,
        resource: points,
        visibility: () => (up2.bought.value ? Visibility.Visible : Visibility.None)
    }));
    const up4 = createUpgrade(() => ({
        display: {
            title: "4",
            description: "Points boost numbers gain.",
            effectDisplay() {
                return format(upgradeEffects[4].value) + "x";
            }
        },
        cost: 100,
        resource: points,
        visibility: () => (up3.bought.value ? Visibility.Visible : Visibility.None)
    }));
    const up5 = createUpgrade(() => ({
        display: {
            title: "5",
            description: "Boost '2'."
        },
        cost: 400,
        resource: points,
        visibility: () => (up4.bought.value ? Visibility.Visible : Visibility.None)
    }));
    const up6 = createUpgrade(() => ({
        display: {
            title: "6",
            description: "'2' hardcap start later."
        },
        cost: 1e5,
        resource: points,
        visibility: () => (factor.mi1.earned.value ? Visibility.Visible : Visibility.None)
    }));
    const up7 = createUpgrade(() => ({
        display: {
            title: "7",
            description: "Numbers boost themselves.",
            effectDisplay() {
                return format(upgradeEffects[7].value) + "x";
            }
        },
        cost: 5e5,
        resource: points,
        visibility: () => (factor.mi1.earned.value ? Visibility.Visible : Visibility.None)
    }));
    const up8 = createUpgrade(() => ({
        display: {
            title: "8",
            description: "Boost '3' and its hardcap start later."
        },
        cost: 1e7,
        resource: points,
        visibility: () => (factor.mi1.earned.value ? Visibility.Visible : Visibility.None)
    }));
    const up9 = createUpgrade(() => ({
        display: {
            title: "9",
            description: "'7' also affect point gain and boost it."
        },
        cost: 1e10,
        resource: points,
        visibility: () => (factor.mi1.earned.value ? Visibility.Visible : Visibility.None)
    }));
    const up10 = createUpgrade(() => ({
        display: {
            title: "10",
            description: "'4' hardcap start later but nerf it."
        },
        cost: 1e16,
        resource: points,
        visibility: () => (factor.mi1.earned.value ? Visibility.Visible : Visibility.None)
    }));
    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        color,
        reset
    }));
    addTooltip(treeNode, {
        display: createResourceTooltip(points),
        pinnable: true
    });

    const resetButton = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode
    }));

    return {
        name,
        color,
        points,
        display: jsx(() => (
            <>
                <MainDisplay resource={points} color={color} />
                {render(resetButton)}
                <br />
                <br />

                {renderRow(up1, up2, up3, up4, up5)}
                <br />
                {renderRow(up6, up7, up8, up9, up10)}
            </>
        )),
        treeNode,
        up1,
        up2,
        up3,
        up4,
        up5,
        up6,
        up7,
        up8,
        up9,
        up10,
        upgradeEffects
    };
});
export default layer;
