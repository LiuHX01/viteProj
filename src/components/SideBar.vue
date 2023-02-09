<script setup>
import { ref } from "vue";
import { FILE_COUNT } from "./Constants.js";

const props = defineProps(["vstates"]);
const emit = defineEmits(["toggle", "displayTrajectoryChange"]);

const activeName = ref("first");
const collapseActiveName = ref(["all"]);
const switchValue = ref(new Array(FILE_COUNT).fill(false));

const toggle = (id) => {
    emit("toggle", id);
};

const displayTrajectoryChange = (id) => {
    emit("displayTrajectoryChange", id);
};
</script>

<template>
    <el-tabs type="border-card" v-model="activeName" class="demo-tabs">
        <el-tab-pane label="State" name="first">
            <el-scrollbar height="100%">
                <el-collapse v-model="collapseActiveName">
                    <el-collapse-item name="all">
                        <template #title>
                            <el-icon><Van /></el-icon>
                            &nbsp;&nbsp;|&nbsp;&nbsp; Control All
                        </template>
                        <el-button type="primary" @click="toggle('all')">
                            <el-icon><VideoPause /></el-icon>
                            &nbsp;&nbsp;/&nbsp;&nbsp;
                            <el-icon><VideoPlay /></el-icon>
                        </el-button>
                    </el-collapse-item>
                    <div v-for="(item, index) in vstates">
                        <el-collapse-item>
                            <template #title>
                                <el-icon><Van /></el-icon>
                                &nbsp;&nbsp;|&nbsp;&nbsp; Vehicle: {{ item.id }}
                            </template>
                            <div>Frame: {{ item.frame }}</div>
                            <el-button v-if="item.isRunning" type="primary" @click="toggle(item.id)">
                                <el-icon><VideoPause /></el-icon>
                            </el-button>
                            <el-button v-else type="primary" @click="toggle(item.id)">
                                <el-icon><VideoPlay /></el-icon>
                            </el-button>
                            <br />
                            <el-switch
                                v-model="switchValue[item.id]"
                                active-text="Show"
                                inactive-text="Hide"
                                @change="displayTrajectoryChange(item.id)"
                            />
                        </el-collapse-item>
                    </div>
                </el-collapse>
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
