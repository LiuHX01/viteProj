<script setup>
import MainMap from "./components/MainMap.vue";
import MotionRugs from "./components/MotionRugs.vue";
import Axios from "axios";
import { onMounted } from "vue";
import { csvToArray, csvToJSON } from "./components/Tools.js";
import { GPSAdaptor, MotionAdaptor } from "./components/Adaptor.js";

// fetch data from the server
const fetchData = async () => {
    // for (let i = 0; i < 5; i++) {
    //     const rawData = await Axios.get(`/vehicledata/${i + 1}.csv`, {
    //         responseType: "text",
    //     });
    //     GPSAdaptor.DataEmitter([csvToArray(rawData.data), i]);
    // }

    const motionData = await Axios.get("/newFishs/fish_1.csv", {
        responseType: "text",
    });
    MotionAdaptor.DataEmitter(csvToJSON(motionData.data));
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="container">
        <el-container class="main-container">
            <el-header height="5%"></el-header>
            <el-container>
                <el-main>
                    <!-- <MainMap></MainMap> -->
                    <MotionRugs></MotionRugs>
                </el-main>
                <el-aside width="10%"></el-aside>
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
