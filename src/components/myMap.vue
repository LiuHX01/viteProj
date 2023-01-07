<script setup>
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { onMounted } from "vue";

onMounted(() => {
    const map = L.map("map").setView([34.7109992, 135.46995], 13);
    L.tileLayer("https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}", {
        maxZoom: 19,
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
