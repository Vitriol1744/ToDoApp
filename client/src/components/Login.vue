<script setup lang="ts">
import {ref, inject, onMounted} from "vue";

import type { VueCookies } from "vue-cookies";
import '@/assets/input.scss'
import AuthenticationService from "@/services/authenticationService";
import type {AxiosError} from "axios";

const emailRef = ref('vitriol1744@gmail.com');
const passwordRef = ref('zaq1@WSX');
const response = ref('');
const $cookies = inject<VueCookies>('$cookies');
async function login()
{
  const credentials =
      {
        email: emailRef.value,
        password: passwordRef.value,
      };
  const responseOutput = document.getElementById('_response');
  const resultDiv = document.getElementById('result_div');

  await AuthenticationService.login(credentials)
      .then((res) =>
      {
          if ("set" in $cookies)
            $cookies.set('user_token', res.data.userToken);
          response.value = res.data.message;
          resultDiv.style.border = '3px solid #7aad32';
          responseOutput.style.color = '#9acd32';
          console.log(res.data.log);
          document.getElementById('input_boxes').style.width = '0';
          let buttons = document.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; i++)
          buttons[i].hidden = true;
      })
      .catch((err: AxiosError) =>
      {
          responseOutput.style.color = 'red';
          resultDiv.style.border = '3px solid red';
          response.value = err.response.data.message;
          console.log(err.response.data.log)
      });

}

</script>

<template>
  <div id="main" style="margin-top: -250px">
      <div id="result_div" style="padding: 12px; width: 20vw">
        <p style="font-size: 0.9em;" id="_response">{{response}}</p>
      </div>
    <div class="form__group field" id="input_boxes">

      <input type="email" v-model="emailRef" class="form__field" name="email" id="email" placeholder="Enter your email: ">
      <br>
      <input style="margin-top: -25px" type="password" v-model="passwordRef" class="form__field" name="password" id="password" placeholder="Enter your password: ">
    </div>
    <div style="width: 800px; margin-top: 25px">
      <button style="width: 50%; " @click="login">Login</button>
      <button style="width: 50%;" @click="verify">Verify</button>
    </div>
  </div>
</template>

<style scoped>
#main
{
  font-family: 'Poppins', sans-serif;
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 1.5rem;
}
</style>