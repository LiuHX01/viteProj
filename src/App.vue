<script setup>
import MainMap from "./components/MainMap.vue";
import MotionRugs from "./components/MotionRugs.vue";
import Axios from "axios";
import { onMounted } from "vue";
import { csvToArray, csvToJSON } from "./components/Tools.js";
import { GPSAdaptor, MotionAdaptor } from "./components/Adaptor.js";
import csv from "csvtojson";
import { myWorker } from "./components/MyWorker.js";

// fetch data from the server
const fetchData = async () => {
    for (let i = 1; i <= 30; i++) {
        const rawData = await Axios.get(`/real/r${i}.csv`, {
            responseType: "text",
        });
        csv()
            .fromString(rawData.data)
            .then((jsonObj) => {
                // do something with jsonObj
            });
        // GPSAdaptor.DataEmitter([csvToArray(rawData.data), i]);
    }

    // const motionData = await Axios.get("/newFishs/fishdatashort.csv", {
    //     responseType: "text",
    // });
    // MotionAdaptor.DataEmitter(csvToJSON(motionData.data));
};

const worker = new Worker("/Worker.js");

onMounted(() => {
    // worker.postMessage("load");
    // worker.onmessage = (e) => {
    //     MotionAdaptor.DataEmitter(csvToJSON(e.data));
    // };
    fetchData();
});
</script>

<template>
    <div class="container">
        <el-container class="main-container">
            <el-header height="5%"></el-header>
            <el-container>
                <el-main>
                    <MainMap></MainMap>
                    <MotionRugs></MotionRugs>
                </el-main>
            </el-container>
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
</style>
