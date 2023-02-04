<script setup>
import MainMap from "./components/MainMap.vue";
import MotionRugs from "./components/MotionRugs.vue";
import { onMounted, watch, ref } from "vue";
import { GPSAdaptor, MotionAdaptor } from "./components/Adaptor.js";
import csv from "csvtojson";
import { myWorker } from "./components/MyWorker.js";

const FILE_COUNT = 90;
let dataGroupByTime = [];
let finished = ref(0);

watch(finished, (val) => {
    if (val == FILE_COUNT) {
        const sendData = dataGroupByTime.filter((item) => item.length == FILE_COUNT);
        GPSAdaptor.DataEmitter(sendData);
        MotionAdaptor.DataEmitter(sendData);
    }
});

onMounted(() => {
    myWorker.sendMsg([], "load", FILE_COUNT);
    myWorker.onMsg((msg) => {
        if (msg.type == "load") {
            const data = msg.data;
            const info = msg.info;
            csv()
                .fromString(msg.data)
                .then((jsonObj) => {
                    for (let i in jsonObj) {
                        jsonObj[i].id = info;
                        jsonObj[i].time = i;
                        if (!dataGroupByTime[i]) {
                            dataGroupByTime[i] = [];
                        }
                        dataGroupByTime[i].push(jsonObj[i]);
                    }
                    finished.value++;
                    // console.log(`load ${info} done, finish ${finished.value} of 90`);
                });
        }
    });
});
</script>

<template>
    <div class="container">
        <el-container class="main-container">
            <el-header></el-header>
            <el-container>
                <el-main>
                    <MainMap></MainMap>
                </el-main>
                <el-aside width="200px"></el-aside>
            </el-container>
            <el-footer>
                <MotionRugs></MotionRugs>
            </el-footer>
        </el-container>
    </div>
</template>

<style scoped>
.container {
    width: 100%;
    height: 100%;
}
.main-container {
    width: 100%;
    height: 100%;
    flex-shrink: 0;
}
/* .el-main { */
/* padding: 0 0; */
/* } */
</style>
