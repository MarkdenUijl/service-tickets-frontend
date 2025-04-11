<script setup>
import { ref, computed } from 'vue';
import ValidatedInput from './ValidatedInput.vue';

const email = ref('');

const isEmailValid = computed(() =>
  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email.value)
);
</script>

<template>
  <form>
    <ValidatedInput
      v-model="email"
      placeholder="Email"
      type="text"
      :isValid="isEmailValid"
      validationText="Please enter a valid email address"
    /> <br>

    <p>Form value: {{ isEmailValid }}</p>
  </form>
</template>