<script setup>
import { ref } from "vue";

const props = defineProps({
    vehicles: [Object],
});

const activeName = ref("first");

const handleClick = (tab, event) => {
    console.log(tab, event);
};

const tableData = [
    {
        date: "2016-05-03",
        name: "Tom",
        address: "No. 189, Grove St, Los Angeles",
    },
    {
        date: "2016-05-02",
        name: "Tom",
        address: "No. 189, Grove St, Los Angeles",
    },
    {
        date: "2016-05-04",
        name: "Tom",
        address: "No. 189, Grove St, Los Angeles",
    },
    {
        date: "2016-05-01",
        name: "Tom",
        address: "No. 189, Grove St, Los Angeles",
    },
    {
        date: "2016-05-08",
        name: "Tom",
        address: "No. 189, Grove St, Los Angeles",
    },
    {
        date: "2016-05-06",
        name: "Tom",
        address: "No. 189, Grove St, Los Angeles",
    },
    {
        date: "2016-05-07",
        name: "Tom",
        address: "No. 189, Grove St, Los Angeles",
    },
];
</script>

<template>
    <el-tabs type="border-card" v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="State" name="first">
            <el-scrollbar height="100%">
                <el-table :data="tableData" style="width: 100%; height: 100%">
                    <el-table-column prop="date" label="Date" />
                    <el-table-column prop="name" label="Name" />
                    <el-table-column prop="address" label="Address" />
                </el-table>
            </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="Config" name="second">Config</el-tab-pane>
        <el-tab-pane label="Role" name="third">Role</el-tab-pane>
        <el-tab-pane label="Task" name="fourth">Task</el-tab-pane>
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
