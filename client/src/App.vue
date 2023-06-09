<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router'
import {computed, inject, Ref, UnwrapRef} from "vue";
import type {VueCookies} from "vue-cookies";

import { ref } from 'vue';
import Vue from 'vue';

// const $cookies = inject<VueCookies>('$cookies');
// if ("get" in $cookies)
// {
//   console.log('cookie: ', $cookies.get('user_token'));
//   if ($cookies.get('user_token')) tokenExists = true;
// }

const updateScroll = () =>
{
  let header = document.getElementById('header');
  if (window.scrollY > 100 || isUserVerified) header.style.backgroundColor = '#101b26';
  else header.style.background = 'transparent';
}
import { onMounted } from 'vue'
import authenticationService from "@/services/authenticationService";
import Api from "@/api/api";

interface Task
{
  id: number,
  text: string,
  description: string,
  priority: number,
  done: boolean
}

interface ToDoProject
{
  id: number,
  name: string,
  description: string,
  todos: Task[],
  newTodo: string,
  nextTaskID: number
}

const projects = ref([] as ToDoProject[])
const todos = ref([] as Task[])

async function renderProjectTree()
{

  let id = 0;
  let res = await Api().post('/get_todos', null, { withCredentials: true });

  let projectID = 0;
  for (const project of res.data.projects)
  {
    let taskID = 0;
    const current: ToDoProject = { id: projectID++, name: project.name, description: project.description, todos: [], newTodo: '', nextTaskID: taskID++};
    for (const task of project.tasks)
    {
      todos.value.push({id: id++, text: task.name, description: task.description, priority: task.priority, done: false});
      current.todos.push({id: id++, text: task.name, description: task.description, priority: task.priority, done: false});
    }
    projects.value.push(current);
  }
}

const isUserVerified = ref(false);
onMounted(async () =>
{
  window.addEventListener('scroll', updateScroll);

  let status: boolean = false;
  await authenticationService.verifyUserToken().then((res) => status = true)
      .catch(() => status = false);

  isUserVerified.value = status;

  if (isUserVerified.value)
    await renderProjectTree();
})


let id = 0

const hideCompleted = ref(false)

const filteredTodos = computed(() => {
  return hideCompleted.value
      ? todos.value.filter((t) => !t.done)
      : todos.value
})

function addTodo(project: UnwrapRefSimple<ToDoProject>)
{
  const nextID = project.nextTaskID;
  project.todos.push({ id: nextID, text: project.newTodo, description: '', priority: 0, done: false});

  console.log(project.newTodo);
  project.newTodo = ''
}

function removeTodo(project: UnwrapRef<ToDoProject>, todo: UnwrapRef<Task>)
{
  project.todos = project.todos.filter((t) => t !== todo);
  // todos.value = todos.value.filter((t) => t !== todo)
}

async function logout()
{
  console.log('logging out...');
  let res = await Api().post('/logout', null, { withCredentials: true });
}
</script>

<template>
  <div v-if="isUserVerified" style="width: 100%;" id="logged_in_main">
    <nav style="background-color: transparent; margin: 0; padding: 0;" id="header">
      <div id=logo_holder style="width: 32px; height: 32px; position: absolute; top: 10px; left: 15px">
        <a href="/"><img id="logo_link" src="@/assets/logo.svg" alt="checkbox.png"></a>
      </div>
      <v-row style="padding-top: 10px; display: flex; justify-content: center; width: 100%; align-items: center">
        <RouterLink to="/"><v-col class="column">Home</v-col></RouterLink>
        <RouterLink to="/about"><v-col class="column">About</v-col></RouterLink>
        <RouterLink to="/register"><v-col class="column">Register</v-col></RouterLink>
        <RouterLink to="/" @click="logout()"><v-col class="column">Log Out</v-col></RouterLink>
      </v-row>
    </nav>
<!--    <form @submit.prevent="addTodo">-->
<!--      <button>Add Todo</button>-->
<!--    </form>-->
    <nav id="projects_nav" style="padding-left: 20px">
      <ul style="list-style-type: none">
        <li v-for="project in projects" :key="project.id">
          <span>{{project.name}}</span>
          <ul style="padding-left: 20px; list-style-type: none;">
            <li v-for="todo in project.todos" :key="todo.id" style="display: flex;">
<!--              <input type="checkbox" v-model="todo.done">-->
              <input type=text :class="{ done: todo.done }" :value="todo.text" style="width: 50%">
              <button @click="removeTodo(project, todo)">X</button>
            </li>
            <li><input type="text" v-model="project.newTodo" v-on:keyup.enter="addTodo(project)" style="background-color: #15202b"></li>
          </ul>
        </li>
      </ul>
    </nav>

    <div id="router_view">
      <RouterView />
    </div>
  </div>
  <div v-else style="width: 100%">
      <nav style="background-color: transparent; margin: 0; padding: 0;" id="header">
        <div id=logo_holder style="width: 32px; height: 32px; position: absolute; top: 10px; left: 15px">
          <a href="/"><img id="logo_link" src="@/assets/logo.svg" alt="checkbox.png"></a>
        </div>
        <v-row style="padding-top: 10px; display: flex; justify-content: center; width: 100%; align-items: center">
          <RouterLink to="/"><v-col class="column">Home</v-col></RouterLink>
          <RouterLink to="/about"><v-col class="column">About</v-col></RouterLink>
          <RouterLink to="/register"><v-col class="column">Register</v-col></RouterLink>
          <RouterLink to="/login"><v-col class="column">Login</v-col></RouterLink>
        </v-row>
      </nav>

    <div id="router_view">
      <RouterView />
    </div>

    <footer>
      <p>Copyright© 2023 Vitriol1744</p>
    </footer>
  </div>
</template>

<style scoped>
input[type=text]
{
  color: #aaaaaa;
}
input[type=text]:focus
{
  background-color: #202b36;
}
#logged_in_main
{
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
}
#projects_nav
{
  position: fixed;
  width: 15%;
  height: 100vw;
  background-color: #101b26;
  top: 50px;
}
#router_view
{
  text-align: center;
  justify-content: center;
  align-items: center;
}
.column
{
  width: 150px;
  text-align: center;
}
#header
{
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  z-index: 200;
  height: 50px;
}
nav
{
  &.onScroll
  {
    box-shadow: 0 0 10px #aaa;
    background-color: #fff;
  }
}
#logo_holder > a:hover
{
  background: transparent;
}
footer
{
  display: flex;
  position: fixed;
  bottom: 0;
  width: 100vw;
  height: 50px;
  justify-content: center;
  padding-right: 15px;
  align-items: center;
  background-color: #2c3e50;
  font-weight: bold;
  font-style: italic;
}
</style>
