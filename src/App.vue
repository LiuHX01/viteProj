<script setup>
// import HelloWorld from "./components/HelloWorld.vue";
import myMap from "./components/myMap.vue";
import myState from "./components/myState.vue";
import Axios from "axios";
import { onMounted, watch } from "vue";
import { csvToArray, divideByKey, getAllKeyByIdinObjectArraynoRepeat } from "./tools.js";

let traceData = {};
let dataReady = 1;

const fetchData = async () => {
    traceData = await Axios.get("/mydata.csv", {
        responseType: "text",
    });

    traceData = csvToArray(traceData.data);
    dataReady = 0;
    console.log(getAllKeyByIdinObjectArraynoRepeat(traceData, "vehicle_id"));
    console.log(divideByKey(traceData, "vehicle_id"));
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="container-header"></div>
    <myMap></myMap>
    <myState></myState>
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
.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
    /* filter: drop-shadow(0 0 2em #ff7700aa); */
}

#mymap {
    width: 1000px;
    height: 500px;
    background-color: slategray;
}
</style>
