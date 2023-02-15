<script setup>
import { ref } from "vue";
import { FILE_COUNT } from "./Constants.js";

const props = defineProps(["vstates"]);
const emit = defineEmits(["toggle", "displayTrajectoryChange"]);

const collapseActiveName = ref([""]);
const switchValue = ref(new Array(FILE_COUNT).fill(false));

const toggle = (id) => {
    emit("toggle", id);
};

const displayTrajectoryChange = (id) => {
    emit("displayTrajectoryChange", id);
};
</script>

<template>
    <el-scrollbar height="100%">
        <el-collapse v-model="collapseActiveName">
            <div v-for="item in vstates">
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
</template>

<style scoped></style>
