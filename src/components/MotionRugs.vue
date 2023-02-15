<script setup>
import { onMounted, reactive, ref } from "vue";
import { MotionAdaptor } from "./Adaptor";
import { FRAME_LENGTH } from "./Constants.js";
import { myWorker } from "./MyWorker.js";

const emit = defineEmits(["changeRange"]);

const rugs = {
    dataSet: null,
    draw: null,
};
const load = reactive({
    loading: true,
});
const value1 = ref([0, 50]);

const changeRange = (range) => {
    emit("changeRange", range);
};

onMounted(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    MotionAdaptor.DataListener((data) => {
        const currFeature = "speed";

        myWorker.sendMsg(data, "setPixel", currFeature);
        myWorker.onMsg((msg) => {
            if (msg.type === "setPixel") {
                canvas.width = msg.data.width;
                canvas.height = msg.data.height;
                ctx.putImageData(msg.data.img, 0, 0);
                load.loading = false;
            }
        });
    });
});
</script>

<template>
    <div>
        <el-scrollbar v-loading="load.loading" element-loading-background="rgba(235,235,235,1)">
            <canvas id="canvas"></canvas>
        </el-scrollbar>
        <div class="slider-demo-block">
            <el-slider v-model="value1" range :max="FRAME_LENGTH" @change="changeRange" />
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
