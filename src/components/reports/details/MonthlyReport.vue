<template>


    <CanvasJSChart :options="options" />
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';

// State Management
const selectedYear = ref(new Date().getFullYear()); // Default tahun ini


const props = defineProps([

    'lastMonthOverviewProps'

])

// List bulan dalam bahasa Indonesia
const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Fungsi untuk mengelompokkan data per bulan dan menjumlahkan totalnya
const aggregateMonthlyData = () => {
    const aggregatedData = {};

    props.value.lastMonthOverviewProps.forEach(item => {
        const date = new Date(parseInt(item.timestamp)); // Konversi timestamp ke Date
        const monthIndex = date.getMonth(); // Ambil index bulan (0-11)

        if (!aggregatedData[monthIndex]) {
            aggregatedData[monthIndex] = 0;
        }

        aggregatedData[monthIndex] += parseFloat(item.value); // Menjumlahkan pemakaian
    });

    // Konversi hasil ke format yang bisa digunakan di chart
    return Object.keys(aggregatedData).map(monthIndex => ({
        label: months[parseInt(monthIndex)],
        y: aggregatedData[monthIndex]
    }));
};

// Reactive chart options (akan otomatis diperbarui jika datanya berubah)
const options = computed(() => ({
    animationEnabled: true,
    exportEnabled: true,
    title: {
        text: `Laporan Pemakaian Bulanan Tahun ${selectedYear.value}`
    },
    axisX: {
        title: "Bulan"
    },
    axisY: {
        title: "Pemakaian (kWh)",
        suffix: " kWh"
    },
    data: [
        {
            type: "column",
            yValueFormatString: "#,### kWh",
            dataPoints: aggregateMonthlyData() // Data otomatis diperbarui
        }
    ]
}));

// Log perubahan saat mounted
onMounted(() => {
    console.log("Data Chart:", options.value.data[0].dataPoints);
});
</script>
