<script setup>
import { reactive } from "vue";
import { LogAdaptor } from "./Adaptor";

// 自：日期、时间
// 传：编号、信息
const colomns = reactive([]);
const MAX_LOG_COUNT = 1000;

LogAdaptor.DataListener((data) => {
    const currDate = new Date();
    const currDateStr = `${currDate.getFullYear()}-${currDate.getMonth()}-${currDate.getDate()}`;
    const currTimeStr = `${currDate.getHours()}:${currDate.getMinutes()}:${currDate.getSeconds()}`;
    const { id, event } = data;
    colomns.push({
        date: currDateStr,
        time: currTimeStr,
        id: id,
        event: event,
    });

    if (colomns.length > MAX_LOG_COUNT) {
        colomns.shift();
    }
});
</script>

<template>
    <el-auto-resizer>
        <el-table :data="colomns" border :resizable="false">
            <el-table-column prop="date" label="Date" width="95" align="center"></el-table-column>
            <el-table-column prop="time" label="Time" width="95" align="center"></el-table-column>
            <!-- <el-table-column prop="id" label="Id" width="50" align="center"></el-table-column> -->
            <el-table-column prop="event" label="Event" align="center"></el-table-column>
        </el-table>
    </el-auto-resizer>
</template>

<style scoped></style>
