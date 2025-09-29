<template>
  <ul uk-tab>
    <li class="uk-active"><a href="#"></a></li>
    <li><router-link to="/">Page one</router-link></li>
    <li><router-link to="/page-2">Page two</router-link></li>
    <li class="uk-disabled"><a></a></li>
  </ul>
  <router-view></router-view>
</template>
<script setup lang="ts">
</script>