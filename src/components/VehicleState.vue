<script setup>
const props = defineProps({
    // vehicle_type: {
    //     type: String,
    //     default: "null",
    // },
    len: {
        type: Number,
        default: 0,
    },
});
</script>

<template>
    <div class="vehicle_state">{{ props.len }}</div>
</template>

<style scoped>
.vehicle_state {
    line-height: 1.5em;
    font-size: 1.5em;
    position: absolute;
    width: 20%;
    height: 5%;
    margin-left: 1%;
    color: hotpink;
    background-color: aliceblue;
    /* display: inline; */
    /* float: left; */
}
</style>
