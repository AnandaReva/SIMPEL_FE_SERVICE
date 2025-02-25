<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, watch, nextTick } from 'vue'
const router = useRouter()
const logout = () => {
    router.replace({
        name: 'login'
    }).then(() => {
        localStorage.clear()
        sessionStorage.clear()
        window.location.reload(true)
    })
}
onMounted(() => {
    console.log(' to logout')
    logout()
})
</script>
<template>

</template>