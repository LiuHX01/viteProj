<script setup>
import { reactive } from "vue";
import { LogAdaptor } from "./Adaptor";

// 自：日期、时间
// 传：编号、信息
const logs = reactive([]);
const MAX_LOG_COUNT = 1000;

LogAdaptor.DataListener((data) => {
    const { id, eventStr, date, time } = data;
    logs.push({
        date: date,
        time: time,
        id: id,
        eventStr: eventStr,
    });

    if (logs.length > MAX_LOG_COUNT) {
        logs.shift();
    }
});
</script>

<template>
    <el-auto-resizer>
        <el-table :data="logs" border :resizable="false">
            <el-table-column prop="date" label="Date" width="95" align="center"></el-table-column>
            <el-table-column prop="time" label="Time" width="95" align="center"></el-table-column>
            <!-- <el-table-column prop="id" label="Id" width="50" align="center"></el-table-column> -->
            <el-table-column prop="eventStr" label="Event" align="center"></el-table-column>
        </el-table>
    </el-auto-resizer>
</template>

<style scoped></style>
