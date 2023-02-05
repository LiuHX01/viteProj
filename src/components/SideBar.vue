<script setup>
import { ref } from "vue";

const activeName = ref("first");

const handleClick = (tab, event) => {
    console.log(tab, event);
};
</script>

<template>
    <el-tabs type="border-card" v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="User" name="first">
            <el-scrollbar height="100%">
                <p v-for="item in 20" :key="item" class="scrollbar-demo-item">{{ item }}</p>
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
