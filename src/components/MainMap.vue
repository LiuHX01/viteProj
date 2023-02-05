<script setup>
import MotionRugs from "./MotionRugs.vue";
import SideBar from "./SideBar.vue";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { nextTick, onMounted, reactive } from "vue";
import { GPSAdaptor } from "./Adaptor.js";
import "l.movemarker";
import { generateColor } from "./Tools";
import "leaflet.chinatmsproviders";
import "tilelayer-canvas";

// array of objects to store the state of each trajectory instance
const state = reactive([]);

// icon for the moving marker
const myIcon = L.icon({
    iconSize: [16, 16],
    iconUrl: "/vehicle.svg",
});

// create a new instance of trajectory
const newInstanceState = (id, latLngList) => {
    state.push({
        id: id,
        prev_i: 0,
        ith: 1,
        instance: L.moveMarker(
            [latLngList[0]],
            { duration: 900, color: generateColor() },
            { duration: 900, removeFirstLines: true, maxLengthLines: 1, icon: myIcon },
            {}
        ),
        timer: null,
        latLngList: latLngList,
    });
};

onMounted(() => {
    const map = L.map("map", {
        renderer: L.canvas(),
    }).setView([39.92641, 116.38876], 12);

    L.tileLayer.chinaProvider("Tencent.Normal.Map", { zoom: 12, maxZoom: 18, minZoom: 5 }).addTo(map);

    // add more lines to the trajectory instance
    const moreLines = (idx) => {
        if (state[idx].ith == 0) {
            state[idx].ith++;
        } else if (state[idx].ith == state[idx].latLngList.length - 1) {
        } else {
            if (state[idx].prev_i != state[idx].ith) {
                state[idx].instance.addMoreLine(state[idx].latLngList[state[idx].ith], {
                    animatePolyline: true,
                });
                state[idx].prev_i = state[idx].ith;
            }
            state[idx].ith++;
        }

        state[idx].timer = setTimeout(() => {
            moreLines(idx);
        }, 1000);
    };

    // listen to the data from the adaptor
    GPSAdaptor.DataListener((dataGroupByTime) => {
        for (let i in dataGroupByTime) {
            for (let j in dataGroupByTime[i]) {
                const lat = parseFloat(dataGroupByTime[i][j]["latitude"]);
                const lng = parseFloat(dataGroupByTime[i][j]["longitude"]);
                const id = dataGroupByTime[i][j]["id"];
                if (!state[id]) {
                    newInstanceState(id, [[lat, lng]]);
                    nextTick(() => {
                        state[id].instance.addTo(map);
                        moreLines(id);
                    });
                } else {
                    state[id].latLngList.push([lat, lng]);
                }
            }
        }
    });
});
</script>

<template>
    <el-container class="main-container">
        <el-container>
            <el-main>
                <div class="map_container">
                    <div id="map"></div>
                </div>
            </el-main>
            <el-aside width="300px">
                <!-- <SideBar :vehicles="state"></SideBar> -->
                <SideBar></SideBar>
            </el-aside>
        </el-container>
        <el-footer>
            <MotionRugs></MotionRugs>
        </el-footer>
    </el-container>
</template>

<style scoped>
.map_container {
    width: 100%;
    height: 100%;
}
#map {
    width: 100%;
    height: 100%;
    /* margin-bottom: 10px; */
}
.main-container {
    width: 100%;
    height: 100%;
    flex-shrink: 0;
}
.el-container {
    height: 95%;
}
.el-main {
    padding: 0 0;
}
.el-footer {
    padding: 0 0;
}
</style>
