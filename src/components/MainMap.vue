<script setup>
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { nextTick, onMounted, reactive } from "vue";
import { GPSAdaptor } from "./Adaptor.js";
import "l.movemarker";
import { generateColor } from "./Tools";
import VehicleState from "./VehicleState.vue";
import "leaflet.chinatmsproviders";
import "tilelayer-canvas";

// array of objects to store the state of each trajectory instance
const state = reactive([]);

// icon for the moving marker
const myIcon = L.icon({
    iconSize: [16, 16],
    iconUrl: "/vehicle.svg",
});

// convert the data to a list of latlng
const getLatLngList = (data) => {
    const latLngList = [];
    data.forEach((element) => {
        latLngList.push([Number(element["latitude"]), Number(element["longitude"])]);
    });
    return latLngList;
};

// create a new instance of trajectory
const newInstanceState = (id, latLngList) => {
    state.push({
        id: id,
        prev_i: 0,
        ith: 1,
        instance: L.moveMarker(
            [latLngList[0]],
            { duration: 500, color: generateColor() },
            { duration: 500, removeFirstLines: true, maxLengthLines: 1, icon: myIcon },
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

    // 方案一：使用leaflet.chinatmsproviders插件
    L.tileLayer.chinaProvider("Tencent.Normal.Map", { zoom: 12, maxZoom: 18, minZoom: 5 }).addTo(map);

    // 方案二：使用tilelayer-canvas插件
    // L.tileLayer
    //     .canvas("http://rt0.map.gtimg.com/realtimerender?z={z}&x={x}&y={-y}&type=vector&style=0", {
    //         zoom: 12,
    //     })
    //     .addTo(map);

    // add more lines to the trajectory instance
    const moreLines = (idx) => {
        if (state[idx].ith == 0) {
            console.log(`trajectory ${idx}, length is ${state[idx].latLngList.length}`);
            state[idx].ith++;
        } else if (state[idx].ith == state[idx].latLngList.length - 1) {
            // clearInterval(state[idx].timer);
            console.log(`trajectory ${idx} finished`);
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
                    // console.log(`trajectory ${id} is already in the map`);
                    state[id].latLngList.push([lat, lng]);
                }
            }
        }

        // nextTick(() => {
        // state[data[1]].instance.addTo(map);
        // moreLines(data[1]);
        // });
    });
});
</script>

<template>
    <div class="map_container">
        <div id="map"></div>
        <!-- <el-scrollbar>
            <div v-for="item of state">
                <VehicleState :vehicle_id="item['id']" :ith="item['ith']" :len="state.length"></VehicleState>
            </div>
        </el-scrollbar> -->
    </div>
</template>

<style>
.map_container {
    width: 100%;
    height: 100%;
}
#map {
    width: 100%;
    height: 100%;
    /* margin-bottom: 10px; */
}
</style>
