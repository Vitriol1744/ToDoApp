<script setup lang="ts">
  import {ref} from "vue";

  import AuthenticationService, {RegistrationCredentials} from "@/services/authenticationService";
  import '@/assets/input.scss'
  import type {AxiosError} from "axios";

  const firstNameRef = ref('Szymon');
  const lastNameRef = ref('Zemke');
  const phoneRef = ref('729 986 607');
  const emailRef = ref('vitriol1744@gmail.com');
  const passwordRef = ref('zaq1@WSX');
  const response = ref('');

  async function register()
  {
    const credentials: RegistrationCredentials =
        {
          firstName: firstNameRef.value,
          lastName: lastNameRef.value,
          phone: phoneRef.value,
          password: passwordRef.value,
          email: emailRef.value,
          createdAt: new Date().toDateString(),
          updatedAt: new Date().toDateString()
        };
    const responseOutput = document.getElementById('_response');
    const resultDiv = document.getElementById('result_div');
    await AuthenticationService.register(credentials)
        .then((res) =>
        {
          response.value = res.data.message;
          resultDiv.style.border = '3px solid #9abd32';
          responseOutput.style.color = '#9acd32';
          console.log(res.data.log);
        })
        .catch((err: AxiosError) =>
        {
          responseOutput.style.color = '#ff0000';
          resultDiv.style.border = '3px solid #ef0000';
          response.value = err.response.data.message;
          console.log(err.response.data.log)
        });
  }
</script>

<template>
  <div id="main" style="margin-top: -200px">
    <div id="result_div" style="padding: 12px">
      <p style="font-size: 0.9em;" id="_response">{{response}}</p>
    </div>
    <div class="form__group field" style="width: 800px" id="input_boxes">
      <input type="text" v-model="firstNameRef" class="form__field" name="first_name" id="first_name" placeholder="First Name: ">
      <input type="text" v-model="lastNameRef" class="form__field" name="last_name" id="last_name" placeholder="Last Name: ">
      <input type="tel" v-model="phoneRef" class="form__field" name="phone" id="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{3}" placeholder="Phone: ">
<!--      <label for="email" class="form__label">Email</label>-->
      <input type="email" v-model="emailRef" class="form__field" name="email" id="email" placeholder="Enter your email: ">
      <input type="password" v-model="passwordRef" class="form__field" name="password" id="password" placeholder="Enter your password: ">
<!--      <label for="password" class="form__label">Password</label>-->
      <button style="width: 400px; margin-top: 30px" @click="register">Register</button>
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