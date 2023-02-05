<script setup>
import { ref, computed } from "vue";

const props = defineProps(["vstates"]);
const vehicleStates = computed(() => {
    let result = [];
    for (let i in props.vstates) {
        result.push({
            id: props.vstates[i].id,
            frame: props.vstates[i].frame,
        });
    }
    return result;
});
const activeName = ref("first");

const handleClick = (tab, event) => {
    console.log(tab, event);
};

// setInterval(() => {
//     console.log(props.vstates);
// }, 1000);
</script>

<template>
    <el-tabs type="border-card" v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="State" name="first">
            <el-scrollbar height="100%">
                <el-table :data="vehicleStates" style="width: 100%; height: 100%">
                    <el-table-column prop="id" label="ID" />
                    <el-table-column prop="frame" label="Frame" />
                </el-table>
            </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="TODO" name="second">Config</el-tab-pane>
        <el-tab-pane label="TODO" name="third">Role</el-tab-pane>
        <el-tab-pane label="TODO" name="fourth">Task</el-tab-pane>
    </el-tabs>
</template>

<style scoped>
/* .demo-tabs { */
/* height: 100%; */
/* } */
.demo-tabs > .el-tabs__content {
    padding: 16px;
    color: #6b778c;
    font-size: 16px;
    font-weight: 600;
}
</style>
