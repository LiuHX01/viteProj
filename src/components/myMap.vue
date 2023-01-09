<script setup>
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { onMounted } from "vue";
import { dataAdaptor } from "../adaptor.js";
import { generatecolor } from "../tools";

const getLatLngList = (data) => {
    const latlngList = [];
    data.forEach((element) => {
        latlngList.push([element["latitude"], element["longitude"]]);
    });
    return latlngList;
};

onMounted(() => {
    dataAdaptor.DataListener((data) => {
        const eachVehicleData = data;
        const latlngList = getLatLngList(eachVehicleData);
        const polyline = L.polyline(latlngList, {
            color: generatecolor(),
            weight: 1,
            opacity: 1,
            smoothFactor: 1,
            stroke: true,
            lineJoin: "round",
            // lineCap: "round",
            // noClip: true,
        }).addTo(map);
        map.fitBounds(polyline.getBounds());
    });

    const map = L.map("map", {
        renderer: L.canvas(),
    }).setView([39.92123, 116.51172], 12);
    L.tileLayer("https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}", {
        zoom: 12,
    }).addTo(map);
});
</script>

<template>
    <div id="map"></div>
</template>

<style scoped>
#map {
    width: 78%;
    height: 78%;
    background-color: rgb(171, 118, 48);
    margin-top: 1%;
    margin-left: 1%;
    margin-right: 1%;
    margin-bottom: 1%;
    display: inline;
    float: left;
    /* border: 1px solid red; */
}
</style>
