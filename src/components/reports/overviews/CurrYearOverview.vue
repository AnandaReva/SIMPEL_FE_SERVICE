<template>
    <v-select v-model="intervalOption" label="Interval" :items="['monthly', 'detail']"></v-select>
    <CanvasJSChart :options="options" />
</template>

<script setup>
import { ref, computed, onMounted, watch, defineProps } from 'vue';

const props = defineProps([
    'currYearData'
]);

const intervalOption = ref('monthly');
const availableMonthCurrYear = ref([]);
const monthlyCurrYearData = ref([]);
const detailedData = ref([]);

function getDateFromTimestamp(timestamp) {
    return new Date(timestamp);
}

function calculateMonthsInCurrYear() {
    const monthsSet = new Set();
    props.currYearData.forEach(item => {
        const date = getDateFromTimestamp(item.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Format YYYY-MM
        monthsSet.add(monthKey);
    });
    availableMonthCurrYear.value = Array.from(monthsSet).sort();
}

function groupDataByMonth() {
    const groupedData = {};

    props.currYearData.forEach(item => {
        const date = getDateFromTimestamp(item.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Format YYYY-MM

        if (!groupedData[monthKey]) {
            groupedData[monthKey] = 0;
        }

        groupedData[monthKey] += parseFloat(item.value);
    });

    monthlyCurrYearData.value = Object.keys(groupedData).map(month => ({
        label: month,
        y: groupedData[month],
    }));
}

function detailedFormat() {
    detailedData.value = props.currYearData.map(item => {
        const date = getDateFromTimestamp(item.timestamp);
        const formattedLabel = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
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
        text: `Laporan Pemakaian - ${intervalOption.value === 'monthly' ? 'Bulanan' : 'Detail'}`,
    },
    axisX: {
        title: intervalOption.value === 'monthly' ? "Bulan" : "Detail Waktu",
    },
    axisY: {
        title: "Pemakaian (kWh)",
        suffix: " kWh",
    },
    data: [
        {
            type: "column",
            yValueFormatString: "#,### kWh",
            dataPoints: intervalOption.value === 'monthly' ? monthlyCurrYearData.value : detailedData.value,
        },
    ],
}));

watch(intervalOption, () => {
    if (intervalOption.value === 'monthly') {
        groupDataByMonth();
    } else {
        detailedFormat();
    }
});

onMounted(() => {
    calculateMonthsInCurrYear();
    groupDataByMonth();
    detailedFormat();
});
</script>
