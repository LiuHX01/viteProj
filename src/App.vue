<script setup>
import MainMap from "./components/MainMap.vue";
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
                        jsonObj[i].time = parseInt(i);
                        jsonObj[i].latitude = parseFloat(jsonObj[i].latitude);
                        jsonObj[i].longitude = parseFloat(jsonObj[i].longitude);
                        jsonObj[i].speed = parseFloat(jsonObj[i].speed);
                        if (!dataGroupByTime[i]) {
                            dataGroupByTime[i] = [];
                        }
                        dataGroupByTime[i].push(jsonObj[i]);
                    }
                    finished.value++;
                });
        }
    });
});
</script>

<template>
    <div class="container">
        <MainMap></MainMap>
    </div>
</template>

<style scoped>
.container {
    width: 100%;
    height: 100%;
}
</style>
