<template>
  <div class="coupon-section">
    <!-- 顶部标题与分类选择 -->
    <div class="coupon-header">
      <div class="coupon-header-left">
        <h2 class="coupon-title">
          <span class="coupon-icon">🎟️</span>
          <span>生活特惠领券</span>
          <span class="coupon-count-badge">{{ filteredCoupons.length }} 款可用</span>
        </h2>
        <p class="coupon-subtitle">
          精选滴滴打车、美团外卖、车主加油等全网高额立减券 · 手机一键直达拉起 App
        </p>
      </div>
      <button class="btn-tip-toggle" @click="showTipsModal = !showTipsModal" title="查看隐藏券提取技巧">
        <span>💡 深度隐藏券获取秘籍</span>
      </button>
    </div>

    <!-- 隐藏券获取指南弹窗/卡片 -->
    <Transition name="fade">
      <div v-if="showTipsModal" class="tips-box">
        <div class="tips-box-header">
          <h4>💡 如何获取更多滴滴/美团深藏券？</h4>
          <button class="tips-close-btn" @click="showTipsModal = false">✕</button>
        </div>
        <div class="tips-grid">
          <div class="tip-card">
            <div class="tip-num">1</div>
            <div class="tip-body">
              <strong>微信小程序页面路径提取</strong>
              <p>在微信里打开滴滴或美团大额活动页面，点击右上角「···」选择「复制链接」或「复制页面路径」，即可获取永久直达入口。</p>
            </div>
          </div>
          <div class="tip-card">
            <div class="tip-num">2</div>
            <div class="tip-body">
              <strong>微信支付 · 有优惠金币</strong>
              <p>微信搜「微信支付商家消费券」，微信买单后赠送的金币，每周可免费兑换 5~15 元滴滴无门槛打车立减金和美团外卖券。</p>
            </div>
          </div>
          <div class="tip-card">
            <div class="tip-num">3</div>
            <div class="tip-body">
              <strong>银行/运营商异业合作</strong>
              <p>招商银行掌上生活、工行融e联、中国联通沃钱包、云闪付 App 内常年有 1 元购 10 元滴滴出行/美团外卖券包活动。</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 分类筛选器 -->
    <div class="coupon-categories">
      <button
        v-for="cat in categories"
        :key="cat.key"
        :class="['cat-btn', { active: currentCategory === cat.key }]"
        @click="currentCategory = cat.key">
        {{ cat.name }} ({{ countCategory(cat.key) }})
      </button>
    </div>

    <!-- 优惠券卡片网格 -->
    <div v-if="filteredCoupons.length > 0" class="coupon-grid">
      <div
        v-for="item in filteredCoupons"
        :key="item.id"
        class="coupon-card"
        :style="{ '--brand-color': item.color || '#0ea5e9' }">
        <!-- 顶部徽标与平台标签 -->
        <div class="card-top">
          <span class="platform-badge" :class="item.platform">
            {{ getPlatformLabel(item.platform) }}
          </span>
          <span v-if="item.recommendBadge" class="recommend-badge">
            {{ item.recommendBadge }}
          </span>
        </div>

        <!-- 优惠额度高亮 -->
        <div class="card-discount-area">
          <span class="discount-value">{{ item.discount }}</span>
        </div>

        <!-- 标题与说明 -->
        <h3 class="card-title">{{ item.title }}</h3>
        <p class="card-desc">{{ item.description }}</p>

        <!-- 标签列表 -->
        <div class="card-tags">
          <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag-pill">
            #{{ tag }}
          </span>
        </div>

        <!-- 底部操作按钮 -->
        <div class="card-actions">
          <button class="btn-claim" @click="handleOpen(item)">
            <span>📱 打开 App 领取</span>
          </button>
          <button class="btn-copy" @click="handleCopy(item)" title="复制活动链接">
            <span>📋 复制链接</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索无结果 -->
    <div v-else class="coupon-empty">
      <p>未找到匹配的优惠券，您可以切换分类或尝试其他关键词</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { COUPONS_DATA, COUPON_CATEGORIES, type CouponItem } from "~/config/coupons";
import { useToast } from "~/composables/useToast";

const props = defineProps<{
  keyword?: string;
}>();

const { showToast } = useToast();
const currentCategory = ref<string>("all");
const showTipsModal = ref(false);

const categories = COUPON_CATEGORIES;

function countCategory(key: string): number {
  if (key === "all") return COUPONS_DATA.length;
  return COUPONS_DATA.filter((c) => c.category === key).length;
}

function getPlatformLabel(platform: CouponItem["platform"]): string {
  switch (platform) {
    case "didi":
      return "滴滴出行";
    case "meituan":
      return "美团";
    case "eleme":
      return "饿了么";
    default:
      return "生活特惠";
  }
}

const filteredCoupons = computed(() => {
  let list = COUPONS_DATA;

  // 分类筛选
  if (currentCategory.value !== "all") {
    list = list.filter((c) => c.category === currentCategory.value);
  }

  // 关键词筛选
  const kw = (props.keyword || "").trim().toLowerCase();
  if (kw) {
    list = list.filter((c) => {
      return (
        c.title.toLowerCase().includes(kw) ||
        c.description.toLowerCase().includes(kw) ||
        c.tags.some((t) => t.toLowerCase().includes(kw)) ||
        c.categoryName.toLowerCase().includes(kw)
      );
    });
  }

  return list;
});

function handleOpen(item: CouponItem) {
  // 判断是否移动端
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (isMobile && item.appScheme) {
    // 尝试拉起 App
    window.location.href = item.appScheme;
    setTimeout(() => {
      // 1.5 秒未唤起则回退到 H5 网页
      window.open(item.h5Url, "_blank");
    }, 1500);
  } else {
    // 桌面端或无 scheme 时直接打开 H5 页面
    window.open(item.h5Url, "_blank");
  }
  showToast(`正在跳转到 ${item.title} 领券入口`, "success");
}

function handleCopy(item: CouponItem) {
  const text = `${item.title} - ${item.discount}\n直达链接：${item.h5Url}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
      () => showToast("已复制领券链接，可发至微信或浏览器打开", "success"),
      () => fallbackCopy(text)
    );
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    showToast("已复制领券链接，可发至微信或浏览器打开", "success");
  } catch {
    showToast("复制失败，请手动长按链接复制", "error");
  } finally {
    document.body.removeChild(ta);
  }
}
</script>

<style scoped>
.coupon-section {
  margin: 24px 0 36px;
  padding: 24px;
  background: var(--card-bg, rgba(30, 41, 59, 0.5));
  border-radius: var(--radius-lg, 16px);
  border: 1px solid var(--border-light, rgba(255, 255, 255, 0.08));
  backdrop-filter: blur(12px);
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.coupon-title {
  margin: 0 0 6px;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary, #f8fafc);
  display: flex;
  align-items: center;
  gap: 10px;
}

.coupon-icon {
  font-size: 1.5rem;
}

.coupon-count-badge {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.15);
  color: var(--primary, #38bdf8);
  border: 1px solid rgba(14, 165, 233, 0.3);
}

.coupon-subtitle {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-secondary, #94a3b8);
}

.btn-tip-toggle {
  background: rgba(234, 179, 8, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(234, 179, 8, 0.3);
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-tip-toggle:hover {
  background: rgba(234, 179, 8, 0.22);
  transform: translateY(-1px);
}

.tips-box {
  margin-bottom: 20px;
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px dashed rgba(234, 179, 8, 0.4);
}

.tips-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tips-box-header h4 {
  margin: 0;
  font-size: 0.95rem;
  color: #fbbf24;
}

.tips-close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1rem;
  cursor: pointer;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.tip-card {
  display: flex;
  gap: 10px;
  background: rgba(30, 41, 59, 0.6);
  padding: 10px 12px;
  border-radius: 8px;
}

.tip-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fbbf24;
  color: #000;
  font-weight: 700;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tip-body strong {
  display: block;
  font-size: 0.85rem;
  color: #f8fafc;
  margin-bottom: 4px;
}

.tip-body p {
  margin: 0;
  font-size: 0.78rem;
  color: #94a3b8;
  line-height: 1.4;
}

.coupon-categories {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.cat-btn {
  padding: 8px 16px;
  font-size: 0.88rem;
  border-radius: 999px;
  background: var(--input-bg, rgba(15, 23, 42, 0.5));
  border: 1px solid var(--border-medium, rgba(255, 255, 255, 0.1));
  color: var(--text-secondary, #94a3b8);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cat-btn:hover {
  color: var(--text-primary, #f8fafc);
  border-color: var(--primary, #0ea5e9);
}

.cat-btn.active {
  background: var(--primary, #0ea5e9);
  color: #fff;
  border-color: var(--primary, #0ea5e9);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.coupon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 16px;
}

.coupon-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--card-bg, rgba(30, 41, 59, 0.7));
  border: 1px solid var(--border-light, rgba(255, 255, 255, 0.08));
  border-radius: 14px;
  transition: all 0.25s ease;
  overflow: hidden;
}

.coupon-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--brand-color);
}

.coupon-card:hover {
  transform: translateY(-3px);
  border-color: var(--brand-color);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.4);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.platform-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.platform-badge.didi {
  background: rgba(255, 125, 0, 0.15);
  color: #ff922b;
  border: 1px solid rgba(255, 125, 0, 0.3);
}

.platform-badge.meituan {
  background: rgba(234, 179, 8, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.platform-badge.eleme {
  background: rgba(2, 132, 199, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(2, 132, 199, 0.3);
}

.platform-badge.other {
  background: rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.recommend-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: #fff;
}

.card-discount-area {
  margin-bottom: 8px;
}

.discount-value {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--brand-color);
  letter-spacing: -0.5px;
}

.card-title {
  margin: 0 0 8px;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary, #f8fafc);
  line-height: 1.4;
}

.card-desc {
  margin: 0 0 14px;
  font-size: 0.84rem;
  color: var(--text-secondary, #94a3b8);
  line-height: 1.5;
  flex: 1;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.tag-pill {
  font-size: 0.72rem;
  color: var(--text-tertiary, #64748b);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-claim {
  flex: 1;
  padding: 10px 14px;
  font-size: 0.88rem;
  font-weight: 600;
  border: none;
  border-radius: 9px;
  background: var(--brand-color);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-claim:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-copy {
  padding: 10px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid var(--border-medium, rgba(255, 255, 255, 0.15));
  border-radius: 9px;
  background: var(--input-bg, rgba(15, 23, 42, 0.4));
  color: var(--text-secondary, #94a3b8);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-copy:hover {
  color: var(--text-primary, #f8fafc);
  border-color: var(--text-primary, #f8fafc);
}

.coupon-empty {
  text-align: center;
  padding: 36px 20px;
  color: var(--text-tertiary, #64748b);
  font-size: 0.95rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .coupon-section {
    padding: 18px 14px;
  }
  .coupon-header {
    flex-direction: column;
    align-items: stretch;
  }
  .btn-tip-toggle {
    text-align: center;
  }
}
</style>
