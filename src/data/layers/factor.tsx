/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createChallenge } from "features/challenges/challenge";
import {
    createCumulativeConversion,
    createExponentialScaling,
    createIndependentConversion,
    createPolynomialScaling
} from "features/conversion";
import { jsx, Visibility } from "features/feature";
import { createMilestone } from "features/milestones/milestone";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource, displayResource } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { createUpgrade } from "features/upgrades/upgrade";
import { createLayer } from "game/layers";
import { createMultiplicativeModifier, createSequentialModifier } from "game/modifiers";
import player from "game/player";
import Decimal, { DecimalSource, format, formatWhole } from "util/bignum";
import { render, renderRow } from "util/vue";
import { computed, unref } from "vue";
import { createLayerTreeNode, createResetButton } from "../common";
import number from "./number";

const id = "f";
const layer = createLayer(id, () => {
    const name = "factor";
    const color = "#FFCD00";
    const points = createResource<DecimalSource>(0, "factors");

    const conversion = createIndependentConversion(() => ({
        scaling: createExponentialScaling(1000, 5, 1.2),
        baseResource: number.points,
        gainResource: points,
        roundUpCost: true
    }));
    const costnext = Decimal.mul(
        2000,
        Decimal.pow(5, Decimal.pow(Decimal.add(points.value, 2), 1.2))
    );
    const milestoneEffects = {
        1: computed(() => {
            let power = new Decimal(1);
            if (cha1.completions.value) power = power.times(2);
            let amt = points.value;
            if (cha2.completions.value) amt = Decimal.add(amt, unref(challengeEffects[2]));
            return Decimal.add(1, amt).pow(power);
        })
    };
    const challengeEffects = {
        2: computed(() => {
            let power = new Decimal(1.5);
            if (cha2.completions.value) power = power.times(1);
            return Decimal.add(number.points.value, 1).log10().pow(power).floor();
        })
    };
    const mi1 = createMilestone(() => ({
        visibility: () => (Decimal.gte(points.value, 0) ? Visibility.Visible : Visibility.None),
        shouldEarn() {
            return Decimal.gte(points.value, 1);
        },
        display: {
            requirement: jsx(() => (
                <>
                    <h3>1 Factors</h3>
                    <br />
                    Factors boost points and numbers gain.
                </>
            ))
        }
    }));
    const mi2 = createMilestone(() => ({
        visibility: () => (Decimal.gte(points.value, 0) ? Visibility.Visible : Visibility.None),
        shouldEarn() {
            return Decimal.gte(points.value, 3);
        },
        display: {
            requirement: jsx(() => (
                <>
                    <h3>3 Factors</h3>
                    <br />
                    Unlock new number upgrades.
                </>
            ))
        }
    }));
    const mi3 = createMilestone(() => ({
        visibility: () => (Decimal.gte(points.value, 1) ? Visibility.Visible : Visibility.None),
        shouldEarn() {
            return Decimal.gte(points.value, 6);
        },
        display: {
            requirement: jsx(() => (
                <>
                    <h3>6 Factors</h3>
                    <br />
                    Unlock factor challenge.
                </>
            ))
        }
    }));
    const mi4 = createMilestone(() => ({
        visibility: () => (Decimal.gte(points.value, 3) ? Visibility.Visible : Visibility.None),
        shouldEarn() {
            return Decimal.gte(points.value, 13);
        },
        display: {
            requirement: jsx(() => (
                <>
                    <h3>13 Factors</h3>
                    <br />
                    Unlock factor calculator (wip).
                </>
            ))
        }
    }));
    const cha1 = createChallenge(() => ({
        visibility: () => (Decimal.gte(points.value, 6) ? Visibility.Visible : Visibility.None),
        resource: number.points,
        reset: challengeReset,
        goal: () => {
            return new Decimal(5000);
        },
        display: () => ({
            title: "Square Root Factor",
            description: "Point gain is square root.",
            goal: "5,000 numbers",
            reward: "The first factor milestone effect is squared."
        })
    }));
    const cha2 = createChallenge(() => ({
        visibility: () => (cha1.completions.value ? Visibility.Visible : Visibility.None),
        resource: number.points,
        reset: challengeReset,
        goal: () => {
            return new Decimal(2.5e8);
        },
        display: () => ({
            title: "Factor Overpowered Factor",
            description:
                "Factor hyper boost point gain. However, Other upgrades that affect point gain are useless.",
            goal: "250,000,000 numbers",
            reward: "Get extra factor count on factor milestone 1 based on number.",
            effectDisplay: "+" + formatWhole(unref(challengeEffects[2]))
        })
    }));
    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => []
    }));

    const treeNode = createLayerTreeNode(() => ({
        visibility: () =>
            mi1.earned.value || number.up5.bought.value ? Visibility.Visible : Visibility.Hidden,
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
    const challengeReset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [number],
        onReset() {
            main.points.value = 0;
        }
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
                {render(mi1)}
                {render(mi2)}
                {render(mi3)}
                {render(mi4)}
                <br />
                <br />
                {renderRow(cha1, cha2)}
            </>
        )),
        treeNode,
        mi1,
        mi2,
        mi3,
        mi4,
        milestoneEffects,
        cha1,
        cha2,
        challengeEffects
    };
});

export default layer;
