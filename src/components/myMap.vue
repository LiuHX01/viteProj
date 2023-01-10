<script setup>
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { nextTick, onMounted, reactive } from "vue";
import { dataAdaptor } from "../adaptor.js";
import { generatecolor } from "../tools";
import "l.movemarker";

const state = reactive([{}]);

const getLatLngList = (data) => {
    const latlngList = [];
    data.forEach((element) => {
        latlngList.push([Number(element["latitude"]), Number(element["longitude"])]);
    });
    return latlngList;
};

const newInstanceState = (idx, latlngList) => {
    state.push({
        ith: 1,
        instance: L.moveMarker(
            [latlngList[0], latlngList[1]],
            { duration: 1000 },
            { duration: 1000, removeFirstLines: true },
            {}
        ),
        timer: null,
        latlngList: latlngList,
    });
};

onMounted(() => {
    const map = L.map("map", {
        renderer: L.canvas(),
    }).setView([39.92123, 116.51172], 12);
    L.tileLayer("https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}", {
        zoom: 12,
    }).addTo(map);

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
    /* border: 1px solid red; */
}
</style>
