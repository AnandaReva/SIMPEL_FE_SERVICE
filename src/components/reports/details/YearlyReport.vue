<template>
    <CanvasJSChart :options="options" />
</template>

<script setup>
import { reactive, computed, onMounted, defineProps } from 'vue';

// Props untuk menerima data dari parent
const props = defineProps([
    'lastYearData']
);


// Fungsi untuk mengelompokkan data per tahun dan menjumlahkan totalnya
const aggregateYearlyData = () => {
    const aggregatedData = {};

    props.yearlyData.forEach(item => {
        const date = new Date(parseInt(item.timestamp)); // Konversi timestamp ke Date
        const year = date.getFullYear(); // Ambil tahun

        if (!aggregatedData[year]) {
            aggregatedData[year] = 0;
        }

        aggregatedData[year] += parseFloat(item.value); // Menjumlahkan pemakaian
    });

    // Konversi hasil ke format yang bisa digunakan di chart
    return Object.keys(aggregatedData).map(year => ({
        label: year,
        y: aggregatedData[year]
    }));
};

// Reactive chart options (otomatis diperbarui jika datanya berubah)
const options = computed(() => ({
    animationEnabled: true,
    exportEnabled: true,
    title: {
        text: "Laporan Pemakaian Tahunan"
    },
    axisX: {
        title: "Tahun"
    },
    axisY: {
        title: "Pemakaian (kWh)",
        suffix: " kWh"
    },
    data: [
        {
            type: "column",
            yValueFormatString: "#,### kWh",
            dataPoints: aggregateYearlyData() // Data otomatis diperbarui
        }
    ]
}));

// Log data saat komponen dipasang
onMounted(() => {
    console.log("Data Chart (Tahunan):", options.value.data[0].dataPoints);
});
</script>
