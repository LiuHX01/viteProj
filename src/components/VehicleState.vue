<script setup>
const props = defineProps({
    // vehicle_type: {
    //     type: String,
    //     default: "null",
    // },
    vehicle_id: {
        type: Number,
        default: 0,
    },
    ith: {
        type: Number,
        default: 0,
    },
    len: {
        type: Number,
        default: 0,
    },
});
</script>

<template>
    <div class="vehicle_state" :style="{ width: (100 / props.len - 1).toString() + '%' }">
        vehicle_id: {{ props.vehicle_id }}
        <br />
        time: {{ props.ith }}
    </div>
</template>

<style scoped>
.vehicle_state {
    line-height: 1.5em;
    font-size: 1.5em;
    /* width: 15%; */
    height: 10%;
    margin-left: 1%;
    color: hotpink;
    background-color: aliceblue;
    display: inline;
    float: left;
}
</style>
