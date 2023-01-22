<script setup>
import { onMounted, reactive } from "vue";
import { MotionAdaptor } from "./Adaptor";
import { DataSet } from "./M-DataSet.js";
import { Draw } from "./M-Draw.js";

const rugs = reactive({});

onMounted(() => {
    MotionAdaptor.DataListener((data) => {
        const currFeature = "speed";

        rugs["curDataSet"] = new DataSet(data);

        let ordered = rugs["curDataSet"].getOrderedData("Hilbert");
        // console.log(ordered);
        rugs["draw"] = new Draw(
            ordered,
            rugs["curDataSet"].getFeatureMins(currFeature),
            rugs["curDataSet"].getFeatureMaxs(currFeature),
            rugs["curDataSet"].getDeciles(currFeature),
            currFeature
        );

        canvas.width = ordered.length;
        canvas.height = ordered[0].length;

        // console.log(ordered[0][0]);
        for (let i = 0; i < ordered.length; i++) {
            for (let j = 0; j < ordered[i].length; j++) {
                ctx.fillStyle = rugs["draw"].getColor(ordered[i][j]["value"][currFeature]);
                ctx.fillRect(i, j, 1, 1);
            }
        }
    });

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
});
</script>

<template>
    <div>
        <el-scrollbar>
            <canvas id="canvas"></canvas>
        </el-scrollbar>
    </div>
</template>

<style></style>
