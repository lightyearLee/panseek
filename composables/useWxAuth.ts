/**
 * 微信公众号认证 composable
 * 提示：已移除外部公众号强制引流与搜素次数限制，实现完全无限制自由搜索。
 */

export function useWxAuth() {
  return {
    isVerified: computed(() => true),
    isReady: computed(() => true),
    checkSearchAuth: () => false,
  };
}
