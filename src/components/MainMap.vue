<script setup>
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { nextTick, onMounted, reactive } from "vue";
import { dataAdaptor } from "./Adaptor.js";
import "l.movemarker";
import { generateColor } from "./Tools";
import myState from "./VehicleState.vue";

// array of objects to store the state of each trajectory instance
const state = reactive([{}]);

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
const newInstanceState = (latLngList) => {
    state.push({
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
    L.tileLayer("https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}", {
        zoom: 12,
    }).addTo(map);

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
        newInstanceState(getLatLngList(data[0]));
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
        <myState :len="state.length"></myState>
    </div>
</template>

<style scoped>
.map_container {
    width: 100%;
    height: 95%;
    display: inline;
    float: left;
    position: relative;
}
#map {
    width: 98%;
    height: 78%;
    margin-top: 1%;
    margin-left: 1%;
    margin-right: 1%;
    margin-bottom: 1%;
}
</style>
