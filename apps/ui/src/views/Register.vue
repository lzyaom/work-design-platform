<script setup lang="ts"></script>

<template>
  <div class="register">
    <!-- 背景 -->
    <div class="bg"></div>
    <!-- 用户注册  -->
    <h1>用户注册</h1>
    <form action="">
      <label for="username">用户名：</label>
      <input type="text" id="username" name="username" required />
      <br />
      <label for="password">密码：</label>
      <input type="password" id="password" name="password" required />
      <br />
      <label for="confirmPassword">确认密码：</label>
      <input type="password" id="confirmPassword" name="confirmPassword" required />
      <br />
      <button type="submit">注册</button>
    </form>
  </div>
</template>
