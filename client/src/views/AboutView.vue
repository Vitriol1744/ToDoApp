<template>
  <div class="about">
    <h1>This is an about page</h1>
    <span v-for="n in 150"><br></span>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    //text-align: center;
    padding: 25% 25%;
  }
}
</style>
