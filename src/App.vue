<script setup>
// import HelloWorld from "./components/HelloWorld.vue";
import myMap from "./components/myMap.vue";
import myState from "./components/myState.vue";
import Axios from "axios";
import { onMounted, watch, reactive } from "vue";
import { csvToArray } from "./tools.js";
import { dataAdaptor } from "./adaptor.js";

const fetchData = async () => {
    for (let i = 2; i <= 2; i++) {
        const rawData = await Axios.get(`/vehicledata/${i}.csv`, {
            responseType: "text",
        });
        dataAdaptor.DataEmitter(csvToArray(rawData.data));
    }
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="container-header"></div>
    <myMap></myMap>
    <!-- <myState></myState> -->
</template>

<style scoped>
.container-header {
    width: 100%;
    height: 50px;
    background-color: aqua;
}
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
}
.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}
/* .logo.vue:{
    filter: drop-shadow(0 0 2em #42b883aa);
    /* filter: drop-shadow(0 0 2em #ff7700aa); 
} */

#mymap {
    width: 1000px;
    height: 500px;
    background-color: slategray;
}
</style>
