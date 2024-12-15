<template>
  <div class="grid grid-cols-4 gap-4">
    <a-card v-for="i in 4" :key="i"> 统计卡片 {{ i }} </a-card>
  </div>
</template>
