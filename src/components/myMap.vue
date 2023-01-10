<script setup>
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { nextTick, onMounted, reactive } from "vue";
import { dataAdaptor } from "../adaptor.js";
import "l.movemarker";
import { generateColor } from "../tools";

// array of objects to store the state of each trajectory instance
const state = reactive([{}]);

// icon for the moving marker
const myIcon = L.icon({
    iconSize: [24, 24],
    iconUrl: "/vehicle.svg",
});

// convert the data to a list of latlng
const getLatLngList = (data) => {
    const latlngList = [];
    data.forEach((element) => {
        latlngList.push([Number(element["latitude"]), Number(element["longitude"])]);
    });
    return latlngList;
};

// create a new instance of trajectory
const newInstanceState = (idx, latlngList) => {
    state.push({
        ith: 1,
        instance: L.moveMarker(
            [latlngList[0], latlngList[1]],
            { duration: 1000, rotateMarker: true, color: generateColor() },
            { duration: 1000, removeFirstLines: true, icon: myIcon },
            {}
        ),
        timer: null,
        latlngList: latlngList,
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
            console.log(`trajectory ${idx}`);
        } else if (state[idx].ith == state[idx].latlngList.length - 1) {
            clearInterval(state[idx].timer);
        } else {
            state[idx].instance.addMoreLine(state[idx].latlngList[state[idx].ith], {
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
    <div id="map"></div>
</template>

<style scoped>
#map {
    width: 98%;
    height: 88%;
    margin-top: 1%;
    margin-left: 1%;
    margin-right: 1%;
    margin-bottom: 1%;
    display: inline;
    float: left;
}
</style>
