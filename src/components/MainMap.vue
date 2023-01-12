<script setup>
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { nextTick, onMounted, reactive } from "vue";
import { dataAdaptor } from "./Adaptor.js";
import "l.movemarker";
import { generateColor } from "./Tools";
import VehicleState from "./VehicleState.vue";

// array of objects to store the state of each trajectory instance
const state = reactive([]);

// icon for the moving marker
const myIcon = L.icon({
    iconSize: [24, 24],
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
const newInstanceState = (vehicle_id, latLngList) => {
    state.push({
        vehicle_id: vehicle_id,
        ith: 1,
        instance: L.moveMarker(
            [latLngList[0], latLngList[1]],
            { duration: 1000, rotateMarker: true, color: generateColor() },
            { duration: 1000, removeFirstLines: true, icon: myIcon },
            {}
        ),
        timer: null,
        latLngList: latLngList,
    });
};

onMounted(() => {
    // initialize the map
    const map = L.map("map", {
        renderer: L.canvas(),
    }).setView([39.92123, 116.51172], 12);

    L.tileLayer("https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}", {
        zoom: 12,
    }).addTo(map);
    /*
     * 谷歌源 https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}
     */

    // add more lines to the trajectory instance
    const moreLines = (idx) => {
        if (state[idx].ith == 1) {
            console.log(`trajectory ${idx}, length is ${state[idx].latLngList.length}`);
        } else if (state[idx].ith == state[idx].latLngList.length - 1) {
            clearInterval(state[idx].timer);
        } else {
            state[idx].instance.addMoreLine(state[idx].latLngList[state[idx].ith], {
                animatePolyline: true,
            });
        }
        state[idx].ith++;
        state[idx].timer = setTimeout(() => {
            moreLines(idx);
        }, 1100);
    };

    // listen to the data from the adaptor
    dataAdaptor.DataListener((data) => {
        newInstanceState(data[1], getLatLngList(data[0]));
        nextTick(() => {
            state[data[1]].instance.addTo(map);
            moreLines(data[1]);
        });
    });
});
</script>

<template>
    <div class="map_container">
        <div id="map"></div>
        <div v-for="item of state">
            <VehicleState
                :class="{ vehicle_state_last: item['vehicle_id'] == 4, vehicle_state: item['vehicle_id'] != 4 }"
                :vehicle_id="item['vehicle_id']"
                :ith="item['ith']"
                :len="state.length"
            ></VehicleState>
        </div>
    </div>
</template>

<style>
.map_container {
    width: 100%;
    height: 100%;
}
#map {
    width: 100%;
    height: 95%;
    margin-bottom: 10px;
}
.vehicle_state {
    margin-right: 1%;
    line-height: 1.5em;
    font-size: 1.5em;
    height: 4%;
    color: black;
    background-color: aliceblue;
    display: inline;
    float: left;
}
.vehicle_state_last {
    margin-right: 0;
    line-height: 1.5em;
    font-size: 1.5em;
    height: 4%;
    color: black;
    background-color: aliceblue;
    display: inline;
    /* float: left; */
}
</style>