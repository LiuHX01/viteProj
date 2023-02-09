<script setup>
import { onMounted, reactive, ref } from "vue";
import { MotionAdaptor } from "./Adaptor";
import { DataSet } from "./M-DataSet.js";
import { Draw } from "./M-Draw.js";

const emit = defineEmits(["changeRange"]);

const rugs = reactive({});
const load = reactive({
    loading: true,
});
const value1 = ref([0, 50]);

// input is a string of the form "#RRGGBB"
const hexColorToRGB = (hex) => {
    let ret = {
        r: 0,
        g: 0,
        b: 0,
    };
    if (hex.length == 7) {
        ret.r = parseInt(hex.substring(1, 3), 16);
        ret.g = parseInt(hex.substring(3, 5), 16);
        ret.b = parseInt(hex.substring(5, 7), 16);
    }
    return ret;
};

const changeRange = (range) => {
    emit("changeRange", range);
};

onMounted(() => {
    MotionAdaptor.DataListener((data) => {
        const currFeature = "speed";
        // console.log(data);
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

        const img = ctx.createImageData(canvas.width, canvas.height);
        let da = img.data;

        console.time("draw");
        for (let i = 0; i < ordered.length; i++) {
            for (let j = 0; j < ordered[i].length; j++) {
                // ctx.fillStyle = rugs["draw"].getColor(ordered[i][j]["value"][currFeature]);
                // ctx.fillRect(i, j, 1, 1);
                const clr = hexColorToRGB(rugs["draw"].getColor(ordered[i][j]["value"][currFeature]));
                const idx = 4 * (i + j * canvas.width);
                da[idx] = clr.r;
                da[idx + 1] = clr.g;
                da[idx + 2] = clr.b;
                da[idx + 3] = 255;
            }
        }
        ctx.putImageData(img, 0, 0);
        load.loading = false;
        console.timeEnd("draw");
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
        <div class="slider-demo-block">
            <el-slider v-model="value1" range :max="2000" @change="changeRange" />
        </div>
    </div>
</template>

<style scoped>
.slider-demo-block {
    display: flex;
    align-items: center;
    margin-right: 12px;
}
.slider-demo-block .el-slider {
    margin-top: 0;
    margin-left: 12px;
}
</style>
