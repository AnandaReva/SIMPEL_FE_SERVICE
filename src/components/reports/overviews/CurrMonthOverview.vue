<template>
    <v-select v-model="intervalOption" label="Interval" :items="['daily', 'detail']"></v-select>
    <CanvasJSChart :options="options" />
</template>

<script setup>
import { ref, computed, onMounted, watch, defineProps } from 'vue';

const props = defineProps([
    'currMonthData']
);

const intervalOption = ref('daily');
const availableDateCurrMonth = ref([]);
const dailyCurrMonthData = ref([]);
const detailedData = ref([]);

function getDateFromTimestamp(timestamp) {
    return new Date(timestamp);
}

function calculateDaysInCurrMonth() {
    const daysSet = new Set();
    props.currMonthData.forEach(item => {
        const date = getDateFromTimestamp(item.timestamp);
        daysSet.add(date.getDate());
    });
    availableDateCurrMonth.value = Array.from(daysSet).sort((a, b) => a - b);
}

function groupDataByDay() {
    const groupedData = {};

    props.currMonthData.forEach(item => {
        const date = getDateFromTimestamp(item.timestamp);
        const day = date.getDate();

        if (!groupedData[day]) {
            groupedData[day] = 0;
        }

        groupedData[day] += parseFloat(item.value);
    });

    dailyCurrMonthData.value = Object.keys(groupedData).map(day => ({
        label: `Hari ${day}`,
        y: groupedData[day],
    }));
}

function detailedFormat() {
    detailedData.value = props.currMonthData.map(item => {
        const date = getDateFromTimestamp(item.timestamp);
        const formattedLabel = `${date.getDate()}-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
        return {
            label: formattedLabel,
            y: parseFloat(item.value),
        };
    });
}

const options = computed(() => ({
    animationEnabled: true,
    exportEnabled: true,
    title: {
        text: `Laporan Pemakaian - ${intervalOption.value === 'daily' ? 'Harian' : 'Detail'}`,
    },
    axisX: {
        title: intervalOption.value === 'daily' ? "Tanggal" : "Detail Waktu",
    },
    axisY: {
        title: "Pemakaian (kWh)",
        suffix: " kWh",
    },
    data: [
        {
            type: "column",
            yValueFormatString: "#,### kWh",
            dataPoints: intervalOption.value === 'daily' ? dailyCurrMonthData.value : detailedData.value,
        },
    ],
}));

watch(intervalOption, () => {
    if (intervalOption.value === 'daily') {
        groupDataByDay();
    } else {
        detailedFormat();
    }
});

onMounted(() => {
    calculateDaysInCurrMonth();
    groupDataByDay();
    detailedFormat();
});
</script>
