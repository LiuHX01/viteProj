<script setup>
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { onMounted, reactive } from "vue";
import { dataAdaptor } from "../adaptor.js";
import { generatecolor } from "../tools";
import "l.movemarker";
import { set } from "lodash";

const state = reactive({
    ith: 1,
    instance: null,
    timer: null,
});

const getLatLngList = (data) => {
    const latlngList = [];
    data.forEach((element) => {
        latlngList.push([Number(element["latitude"]), Number(element["longitude"])]);
    });
    return latlngList;
};

onMounted(() => {
    dataAdaptor.DataListener((data) => {
        const eachVehicleData = data;
        const latlngList = getLatLngList(eachVehicleData);

        const map = L.map("map", {
            // renderer: L.canvas(),
        }).setView([39.92123, 116.51172], 12);
        L.tileLayer("https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}", {
            zoom: 12,
        }).addTo(map);

        const moreLines = () => {
            if (state.ith == 1) {
                state.instance = L.moveMarker(
                    [latlngList[0], latlngList[1]],
                    { duration: 1000 },
                    { duration: 1000, removeFirstLines: true },
                    {}
                ).addTo(map);
            } else if (state.ith == latlngList.length - 1) {
                clearInterval(state.timer);
            } else {
                console.log(state.instance.getCurrentPolyline());
                state.instance.addMoreLine(latlngList[state.ith], {
                    animatePolyline: true,
                });
            }
            state.ith++;
            state.timer = setTimeout(() => {
                moreLines();
            }, 1100);
        };
        moreLines();
    });
});
</script>

<template>
    <div id="map"></div>
</template>

<style scoped>
#map {
    width: 98%;
    height: 78%;
    margin-top: 1%;
    margin-left: 1%;
    margin-right: 1%;
    margin-bottom: 1%;
    display: inline;
    float: left;
    /* border: 1px solid red; */
}
</style>
