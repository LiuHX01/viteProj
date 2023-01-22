<script setup>
import { onMounted, reactive } from "vue";
import { MotionAdaptor } from "./Adaptor";
import { DataSet } from "./M-DataSet.js";
import { Draw } from "./M-Draw.js";

const rugs = reactive({});
const load = reactive({
    loading: true,
});

onMounted(() => {
    MotionAdaptor.DataListener((data) => {
        const currFeature = "speed";

        rugs["curDataSet"] = new DataSet(data);

        let ordered = rugs["curDataSet"].getOrderedData("Hilbert");

        rugs["draw"] = new Draw(
            ordered,
            rugs["curDataSet"].getFeatureMins(currFeature),
            rugs["curDataSet"].getFeatureMaxs(currFeature),
            rugs["curDataSet"].getDeciles(currFeature),
            currFeature
        );

        canvas.width = ordered.length;
        canvas.height = ordered[0].length;

        // const myImageData = ctx.createImageData(canvas.width, canvas.height);
        console.log("before draw");
        for (let i = 0; i < ordered.length; i++) {
            for (let j = 0; j < ordered[i].length; j++) {
                ctx.fillStyle = rugs["draw"].getColor(ordered[i][j]["value"][currFeature]);
                ctx.fillRect(i, j, 1, 1);
                //         ctx.pushImageData(rugs["draw"].getColor(ordered[i][j]["value"][currFeature]), i, j);
            }
        }
        // console.log("after draw");
        load.loading = false;
        console.log(`after loading ${load.loading}`);
    });

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
});
</script>

<template>
    <div>
        <el-scrollbar v-loading="load.loading" element-loading-background="rgba(36,36,36,1)">
            <canvas id="canvas"></canvas>
        </el-scrollbar>
    </div>
</template>

<style></style>
