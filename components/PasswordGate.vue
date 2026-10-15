<template>
  <Teleport to="body">
    <Transition name="gate">
      <div v-if="visible" class="gate-overlay" role="dialog" aria-modal="true" aria-labelledby="gate-title">
        <div class="gate-card">
          <div class="gate-icon-wrapper">
            <span class="gate-lock-icon">🔒</span>
          </div>
          <h2 id="gate-title" class="gate-title">PanSeek 私密访问</h2>
          <p class="gate-desc">本站已启用访问保护，请输入密码进入主页</p>
          <form @submit.prevent="onSubmit" class="gate-form">
            <input
              ref="inputRef"
              v-model="password"
              type="password"
              class="gate-input"
              placeholder="请输入访问密码"
              autocomplete="current-password"
              aria-label="访问密码"
              autofocus
              @keydown.esc="password = ''" />
            <p v-if="error" class="gate-error">{{ error }}</p>
            <button type="submit" class="gate-btn" :disabled="submitting || !password.trim()">
              {{ submitting ? "正在验证…" : "解锁进入主页" }}
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean;
  error: string;
  submitting: boolean;
}>();

const emit = defineEmits<{
  (e: "unlock", password: string): void;
}>();

const password = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

const visible = computed(() => props.show);

watch(visible, (v) => {
  if (v) {
    password.value = "";
    nextTick(() => requestAnimationFrame(() => inputRef.value?.focus()));
  }
}, { immediate: true });

function onSubmit() {
  const p = password.value.trim();
  if (p) emit("unlock", p);
}
</script>

<style scoped>
.gate-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary, #0f172a);
  backdrop-filter: blur(16px);
}

.gate-card {
  width: 90%;
  max-width: 380px;
  padding: 36px 32px;
  background: var(--card-bg, rgba(30, 41, 59, 0.7));
  border-radius: var(--radius-lg, 16px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-light, rgba(255, 255, 255, 0.1));
  text-align: center;
}

.gate-icon-wrapper {
  margin-bottom: 16px;
}

.gate-lock-icon {
  font-size: 2.5rem;
  display: inline-block;
}

.gate-title {
  margin: 0 0 8px;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary, #f8fafc);
}

.gate-desc {
  margin: 0 0 24px;
  font-size: 0.88rem;
  color: var(--text-secondary, #94a3b8);
  line-height: 1.5;
}

.gate-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.gate-input {
  width: 100%;
  padding: 13px 16px;
  font-size: 1rem;
  border: 1px solid var(--border-medium, rgba(255, 255, 255, 0.2));
  border-radius: var(--radius-md, 12px);
  background: var(--input-bg, rgba(15, 23, 42, 0.6));
  color: var(--text-primary, #f8fafc);
  outline: none;
  box-sizing: border-box;
  text-align: center;
  transition: all 0.2s;
}

.gate-input:focus {
  border-color: var(--primary, #0ea5e9);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
}

.gate-input::placeholder {
  color: var(--text-tertiary, #64748b);
}

.gate-error {
  margin: -4px 0 0;
  font-size: 0.85rem;
  color: var(--error, #f43f5e);
  font-weight: 500;
}

.gate-btn {
  padding: 13px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: var(--primary, #0ea5e9);
  border: none;
  border-radius: var(--radius-md, 12px);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gate-btn:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.gate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gate-enter-active,
.gate-leave-active {
  transition: opacity 0.25s ease;
}

.gate-enter-from,
.gate-leave-to {
  opacity: 0;
}

.gate-enter-active .gate-card,
.gate-leave-active .gate-card {
  transition: transform 0.25s ease;
}

.gate-enter-from .gate-card,
.gate-leave-to .gate-card {
  transform: scale(0.95) translateY(-10px);
}
</style>
