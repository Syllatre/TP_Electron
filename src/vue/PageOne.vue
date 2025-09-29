<template>
  <h1>Page1</h1>
  <button @click="callApi()"  class="uk-button-primary">Appeler l'api</button>
  <div v-for="movie in movies" :key="movie.title">
    {{ movie.title }}
  </div>
</template>

<script setup>
import {ref} from 'vue';
import log from 'electron-log/renderer';
const movies = ref([]);

async function callApi(){
  log.info("j'ai cliqué");
  const res = await fetch('https://raw.githubusercontent.com/Chocolaterie/EniWebService/main/api/movies.json');

  const data = await res.json();
  movies.value = data;
}
</script>