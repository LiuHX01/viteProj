<script setup>
import { onMounted, reactive, ref, computed } from "vue";
import { MotionAdaptor } from "./Adaptor";
import { FRAME_LENGTH, FILE_COUNT } from "./Constants.js";
import { myWorker } from "./MyWorker.js";
import { sendLog } from "./Methods.js";

const emit = defineEmits(["fullScreenChange", "changeRangeX", "changeRangeY", "pixelHighlightChange"]);

const load = ref(true);
const valueX = ref([0, 40]);
const valueY = ref([1, FILE_COUNT - 30]);
let valueDraw = false;
let valueTimer = setInterval(() => {
    valueDraw = true;
}, 100);

const canvasItem = {
    canvas: null,
    ctx: null,
    highlight: false,
};

const maskValue = ref(false);

const maskValueChange = (isOpen) => {
    if (isOpen) {
        drawMask(valueX.value[0], valueX.value[1], valueY.value[0], valueY.value[1]);
    } else {
        if (canvasItem.ctx) {
            reDrawPixel();
            canvasItem.highlight = false;
        }
    }
};

const pixelHighlightValue = ref(false);

/**
 * @function open时，当maskValue为true时，显示轨迹，否则不显示
 * @param {Boolean} isOpen
 */
const pixelHighlightChange = (isOpen) => {
    emit("pixelHighlightChange", isOpen);

    // if (isOpen) {
    //     drawMask(valueX.value[0], valueX.value[1], valueY.value[0], valueY.value[1]);
    // } else {
    //     if (canvasItem.ctx) {
    //         reDrawPixel();
    //         canvasItem.highlight = false;
    //     }
    // }
};

const changeRangeX = (range) => {
    emit("changeRangeX", range, pixelHighlightValue.value);

    if (canvasItem.highlight && valueDraw) {
        drawMask(valueX.value[0], valueX.value[1], valueY.value[0], valueY.value[1]);
        valueDraw = false;
    }
};

const changeRangeY = (range) => {
    emit("changeRangeY", range, pixelHighlightValue.value);
    if (canvasItem.highlight && valueDraw) {
        drawMask(valueX.value[0], valueX.value[1], valueY.value[0], valueY.value[1]);
        valueDraw = false;
    }
};

const drawMask = (start, end, startY, endY) => {
    if (canvasItem.ctx) {
        if (canvasItem.highlight) {
            reDrawPixel();
            canvasItem.highlight = false;
        }
        const frontX = 0;
        const frontY = 0;
        const frontWidth = start;
        const frontHeight = canvasItem.canvas.height;

        const backX = end;
        const backY = 0;
        const backWidth = canvasItem.canvas.width - end;
        const backHeight = canvasItem.canvas.height;

        const topX = start;
        const topY = 0;
        const topWidth = end - start;
        const topHeight = canvasItem.canvas.height - endY;

        const bottomX = start;
        const bottomY = canvasItem.canvas.height - startY;
        const bottomWidth = end - start;
        const bottomHeight = startY;

        canvasItem.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        canvasItem.ctx.fillRect(bottomX, bottomY, bottomWidth, bottomHeight);
        canvasItem.ctx.fillRect(frontX, frontY, frontWidth, frontHeight);
        canvasItem.ctx.fillRect(backX, backY, backWidth, backHeight);
        canvasItem.ctx.fillRect(topX, topY, topWidth, topHeight);

        canvasItem.highlight = true;

        sendLog("motionrug", `draw mask: ${start}, ${end}, ${startY}, ${endY}`);
    }
};

const strategyFeature = ref("speed");

const strategyValue = ref("Hilbert");

const strategyOptions = reactive([]);

const strategyImgs = {};

const changeStrategy = (strategyName) => {
    if (canvasItem.ctx) {
        if (strategyImgs[strategyName]) {
            reDrawPixel();
            if (maskValue.value) {
                drawMask(valueX.value[0], valueX.value[1], valueY.value[0], valueY.value[1]);
            }
            sendLog("motionrug", `change strategy to ${strategyName}`);
        } else {
            sendLog("motionrug", `no such strategy ${strategyName}`);
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
        myWorker.sendMsg(data, "setPixel", strategyFeature.value);
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
                    load.value = false;
                    sendLog("motionrug", `set pixel: ${msg.info}`);
                }
            }
        });
    });
});

const dragSelect = ref(false);
let drawControl = false;
let drawed = false;
const dragSelectRange = ref([0, 0, 0, 0]);
const tempSelectRange = ref([0, 0, 0, 0]);
let dragTimer = null;
const dragSelectChange = (isOpen) => {
    if (isOpen) {
        maskValue.value = true;
        maskValueChange(isOpen);
    }
};

const getStartPosition = (e) => {
    dragSelectRange.value[0] = e.offsetX;
    dragSelectRange.value[1] = canvasItem.canvas.height - e.offsetY;
    drawControl = true;
    dragTimer = setInterval(() => {
        drawed = false;
    }, 1000 / 30);
};

const getTempPosition = (e) => {
    if (dragSelect.value && drawControl && !drawed) {
        tempSelectRange.value[0] = dragSelectRange.value[0];
        tempSelectRange.value[1] = dragSelectRange.value[1];
        tempSelectRange.value[2] = e.offsetX;
        tempSelectRange.value[3] = canvasItem.canvas.height - e.offsetY;
        if (tempSelectRange.value[0] > tempSelectRange.value[2]) {
            [tempSelectRange.value[0], tempSelectRange.value[2]] = [tempSelectRange.value[2], tempSelectRange.value[0]];
        }
        if (tempSelectRange.value[1] > tempSelectRange.value[3]) {
            [tempSelectRange.value[1], tempSelectRange.value[3]] = [tempSelectRange.value[3], tempSelectRange.value[1]];
        }

        if (dragSelect.value) {
            valueX.value = [tempSelectRange.value[0], tempSelectRange.value[2]];
            valueY.value = [tempSelectRange.value[1], tempSelectRange.value[3]];
        }
        if (maskValue.value) {
            changeRangeY(tempSelectRange.value[1], tempSelectRange.value[3]);
        }
        drawed = true;
    }
};

const getEndPosition = (e) => {
    drawControl = false;
    clearInterval(dragTimer);
    dragSelectRange.value[2] = e.offsetX;
    dragSelectRange.value[3] = canvasItem.canvas.height - e.offsetY;
    if (dragSelectRange.value[0] > dragSelectRange.value[2]) {
        [dragSelectRange.value[0], dragSelectRange.value[2]] = [dragSelectRange.value[2], dragSelectRange.value[0]];
    }
    if (dragSelectRange.value[1] > dragSelectRange.value[3]) {
        [dragSelectRange.value[1], dragSelectRange.value[3]] = [dragSelectRange.value[3], dragSelectRange.value[1]];
    }

    if (dragSelect.value) {
        valueX.value = [dragSelectRange.value[0], dragSelectRange.value[2]];
        valueY.value = [dragSelectRange.value[1], dragSelectRange.value[3]];
    }
    if (maskValue.value) {
        changeRangeY([dragSelectRange.value[1], dragSelectRange.value[3]]);
    }
};

/**
 * @function 清除画布所有内容，重新绘制当前策略下的像素
 */
const reDrawPixel = () => {
    canvasItem.ctx.clearRect(0, 0, canvasItem.canvas.width, canvasItem.canvas.height);
    canvasItem.ctx.putImageData(strategyImgs[strategyValue.value], 0, 0);
};

const sliderYHeight = computed(() => {
    if (FILE_COUNT <= 40) {
        return "40px";
    } else {
        return `${FILE_COUNT - 15}px`;
    }
});
</script>

<template>
    <div id="motionrug-container" v-loading="load">
        <el-container>
            <el-aside width="200px">
                <el-container>
                    <el-main class="controler">
                        <div>
                            <el-select
                                :teleported="false"
                                v-model="strategyValue"
                                :style="{ width: '130px' }"
                                class="m-2"
                                placeholder="Null"
                                @change="changeStrategy"
                            >
                                <el-option
                                    v-for="item in strategyOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                        </div>
                        <div class="switchs" style="margin-top: 5px">
                            <el-switch
                                v-model="pixelHighlightValue"
                                @change="pixelHighlightChange"
                                inline-prompt
                                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                                active-text="轨迹开"
                                inactive-text="轨迹关"
                            />
                            &nbsp;
                            <el-switch
                                v-model="maskValue"
                                @change="maskValueChange"
                                inline-prompt
                                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                                active-text="遮照开"
                                inactive-text="遮照关"
                            />
                        </div>
                        <div class="switchs">
                            <el-switch
                                v-model="fullScreenValue"
                                @change="fullScreenChange"
                                inline-prompt
                                style="--el-switch-on-color: #e6a23c; --el-switch-off-color: #409eff"
                                active-text="全屏开"
                                inactive-text="全屏关"
                            />
                            &nbsp;
                            <el-switch
                                v-model="dragSelect"
                                @change="dragSelectChange"
                                inline-prompt
                                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                                active-text="拖选开"
                                inactive-text="拖选关"
                            />
                        </div>
                    </el-main>
                    <el-aside width="40px">
                        <el-main style="height: 126px; text-align: center">
                            <el-slider
                                :style="{ top: '-5px' }"
                                v-model="valueY"
                                range
                                :max="FILE_COUNT"
                                :min="1"
                                vertical
                                :height="sliderYHeight"
                                @input="changeRangeY"
                            />
                        </el-main>
                        <el-footer></el-footer>
                    </el-aside>
                </el-container>
            </el-aside>
            <el-main>
                <el-container>
                    <el-main>
                        <!-- <div style="margin-right: 20px"> -->
                        <el-scrollbar element-loading-background="rgba(235,235,235,1)">
                            <canvas
                                id="canvas"
                                @mousedown="getStartPosition"
                                @mouseup="getEndPosition"
                                @mousemove="getTempPosition"
                            ></canvas>
                        </el-scrollbar>
                        <!-- </div> -->
                    </el-main>
                    <el-footer style="height=10px; margin-right: 30px;">
                        <el-slider
                            style="margin-left: 10px; height: 12px"
                            v-model="valueX"
                            range
                            :max="FRAME_LENGTH"
                            @input="changeRangeX"
                        />
                    </el-footer>
                </el-container>
            </el-main>
        </el-container>
    </div>
</template>

<style scoped>
.el-scrollbar {
    display: inline;
    width: 99%;
}
#motionrug-container {
    background-color: #fff;
}
#canvas {
    margin-top: 12px;
}

.el-container,
.el-aside,
.el-main,
.el-footer {
    padding: 0;
    margin: 0;
    border: 0;
}

.el-footer {
    height: 15px;
}
.controler {
    margin-top: 10px;
    margin-left: 10px;
}
</style>
