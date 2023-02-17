<script setup>
import { onMounted, reactive, ref } from "vue";
import { MotionAdaptor } from "./Adaptor";
import { FRAME_LENGTH } from "./Constants.js";
import { myWorker } from "./MyWorker.js";

const emit = defineEmits(["changeRange", "fullScreenChange"]);

const load = reactive({
    loading: true,
});
const value1 = ref([0, 50]);

const canvasItem = {
    canvas: null,
    ctx: null,
    highlight: false,
};

const pixelHighlightValue = ref(false);

const pixelHighlightChange = (value) => {
    if (value) {
        drawMask(value1.value[0], value1.value[1]);
    } else {
        if (canvasItem.ctx) {
            canvasItem.ctx.clearRect(0, 0, canvasItem.canvas.width, canvasItem.canvas.height);
            canvasItem.ctx.putImageData(strategyImgs[strategyValue.value], 0, 0);
            canvasItem.highlight = false;
        }
    }
};

const changeRange = (range) => {
    emit("changeRange", range);
    if (pixelHighlightValue.value) {
        drawMask(range[0], range[1]);
    }
};

const drawMask = (start, end) => {
    if (canvasItem.ctx) {
        if (canvasItem.highlight) {
            canvasItem.ctx.clearRect(0, 0, canvasItem.canvas.width, canvasItem.canvas.height);
            canvasItem.ctx.putImageData(strategyImgs[strategyValue.value], 0, 0);
            canvasItem.highlight = false;
        }
        const frontX = 0;
        const frontY = 0;
        const frontWidth = start;
        const frontHeight = canvasItem.canvas.height;
        canvasItem.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        canvasItem.ctx.fillRect(frontX, frontY, frontWidth, frontHeight);

        const backX = end;
        const backY = 0;
        const backWidth = canvasItem.canvas.width - end;
        const backHeight = canvasItem.canvas.height;
        canvasItem.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        canvasItem.ctx.fillRect(backX, backY, backWidth, backHeight);

        canvasItem.highlight = true;
    }
};

const strategyValue = ref("Hilbert");

const strategyOptions = reactive([]);

const strategyImgs = {};

const changeStrategy = (strategyName) => {
    console.log(`change strategy to ${strategyName}`);
    if (canvasItem.ctx) {
        if (strategyImgs[strategyName]) {
            canvasItem.ctx.clearRect(0, 0, canvasItem.canvas.width, canvasItem.canvas.height);
            canvasItem.ctx.putImageData(strategyImgs[strategyName], 0, 0);
        } else {
            console.log("no such strategy");
        }
    }
};

const fullScreenValue = ref(false);

const fullScreenChange = (value) => {
    emit("fullScreenChange", value);
};

onMounted(() => {
    canvasItem.canvas = document.getElementById("canvas");
    canvasItem.ctx = canvas.getContext("2d");

    MotionAdaptor.DataListener((data) => {
        const currFeature = "speed";

        myWorker.sendMsg(data, "setPixel", currFeature);
        myWorker.onMsg((msg) => {
            if (msg.type === "setPixel") {
                strategyImgs[msg.info] = msg.data.img;
                strategyOptions.push({
                    value: msg.info,
                    label: msg.info,
                });
                if (Object.keys(strategyImgs).length == 1) {
                    canvasItem.canvas.width = msg.data.width;
                    canvasItem.canvas.height = msg.data.height;
                    canvasItem.ctx.putImageData(strategyImgs[msg.info], 0, 0);
                    load.loading = false;
                }
            }
        });
    });
});
</script>

<template>
    <div id="motionrug-container">
        <el-scrollbar v-loading="load.loading" element-loading-background="rgba(235,235,235,1)">
            <canvas id="canvas"></canvas>
        </el-scrollbar>
        <div class="slider-demo-block">
            <el-select v-model="strategyValue" class="m-2" placeholder="Select" @change="changeStrategy">
                <el-option v-for="item in strategyOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            &nbsp;&nbsp;
            <el-switch
                v-model="pixelHighlightValue"
                @change="pixelHighlightChange"
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                inline-prompt
                active-text="mask开"
                inactive-text="mask关"
            />
            <el-slider
                style="padding-left: 10px; padding-right: 10px"
                v-model="value1"
                range
                :max="FRAME_LENGTH"
                @change="changeRange"
            />
            <el-switch
                v-model="fullScreenValue"
                @change="fullScreenChange"
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                inline-prompt
                active-text="全屏开"
                inactive-text="全屏关"
            />
        </div>
    </div>
</template>

<style scoped>
#motionrug-container {
    background-color: #fff;
}
.slider-demo-block {
    display: flex;
    align-items: center;
    margin-left: 12px;
    margin-right: 12px;
}
.slider-demo-block .el-slider {
    margin-top: 0;
    margin-left: 12px;
}
</style>
