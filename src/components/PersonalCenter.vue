<template>
  <button type="button" class="pc-fab" title="个人中心" aria-label="个人中心" @click="openPanel">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </button>

  <van-popup
    v-model:show="show"
    position="bottom"
    round
    closeable
    :style="{ height: '74%' }"
    class="pc-popup"
    @closed="resetView"
  >
    <div class="pc-header">
      <button v-if="view !== 'menu'" type="button" class="pc-back" @click="view = 'menu'">
        ‹ 返回
      </button>
      <span class="pc-title">{{ panelTitle }}</span>
    </div>

    <!-- 主菜单 -->
    <div v-if="view === 'menu'" class="pc-menu">
      <button type="button" class="pc-menu-item" @click="view = 'feedback'">
        <span class="pc-menu-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <span class="pc-menu-text">
          <strong>意见反馈</strong>
          <em>链接失效、内容错误、功能建议都可以提</em>
        </span>
        <span class="pc-menu-arrow">›</span>
      </button>

      <button type="button" class="pc-menu-item" @click="view = 'donate'">
        <span class="pc-menu-icon heart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </span>
        <span class="pc-menu-text">
          <strong>支持本站</strong>
          <em>资料永久免费，自愿赞赏助力运营</em>
        </span>
        <span class="pc-menu-arrow">›</span>
      </button>

      <button type="button" class="pc-menu-item" @click="openList('favorites')">
        <span class="pc-menu-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <span class="pc-menu-text">
          <strong>我的收藏</strong>
          <em>{{ favorites.length ? `已收藏 ${favorites.length} 条内容` : '收藏的资料和笔记会放在这里' }}</em>
        </span>
        <span class="pc-menu-arrow">›</span>
      </button>

      <button type="button" class="pc-menu-item" @click="openList('history')">
        <span class="pc-menu-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>
        <span class="pc-menu-text">
          <strong>浏览历史</strong>
          <em>{{ history.length ? `最近看过 ${history.length} 条内容` : '最近打开过的内容记录' }}</em>
        </span>
        <span class="pc-menu-arrow">›</span>
      </button>

      <button type="button" class="pc-menu-item" @click="shareSite">
        <span class="pc-menu-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </span>
        <span class="pc-menu-text">
          <strong>分享本站</strong>
          <em>复制链接，分享给一起备考的同学</em>
        </span>
        <span class="pc-menu-arrow">›</span>
      </button>

      <button type="button" class="pc-menu-item" @click="showAbout">
        <span class="pc-menu-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </span>
        <span class="pc-menu-text">
          <strong>联系与关于</strong>
          <em>公众号、邮箱联系方式</em>
        </span>
        <span class="pc-menu-arrow">›</span>
      </button>

      <button type="button" class="pc-menu-item" @click="confirmClear">
        <span class="pc-menu-icon danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </span>
        <span class="pc-menu-text">
          <strong>清除本地数据</strong>
          <em>清空收藏与浏览历史</em>
        </span>
        <span class="pc-menu-arrow">›</span>
      </button>
    </div>

    <!-- 支持本站 -->
    <div v-else-if="view === 'donate'" class="pc-donate">
      <div class="pc-donate-text">
        <p>本站的考研资料和笔记均为<strong>免费分享</strong>，无需注册、不设门槛，会持续更新维护。</p>
        <p>如果这些内容对你有帮助，欢迎<strong>自愿赞赏</strong>支持一下，金额随意，一份心意就好。</p>
        <p>所有赞赏所得都将用于服务器、域名、存储等<strong>网站日常运营开支</strong>，让这个资料库能长期稳定地运行下去，帮助更多备考的同学。</p>
      </div>
      <img class="pc-donate-qrcode" :src="`${baseUrl}assets/zanshang.jpg`" alt="微信赞赏码" />
      <p class="pc-donate-hint">微信「扫一扫」，或长按识别二维码，即可赞赏支持</p>
      <div class="pc-donate-notice">
        <p>说明：赞赏完全出于自愿，属于个人之间的感谢与支持，不构成任何商品或服务交易，也不承诺任何回报；赞赏前请确认系本人真实意愿。</p>
      </div>
    </div>

    <!-- 意见反馈 -->
    <div v-else-if="view === 'feedback'" class="pc-feedback">
      <div class="pc-feedback-types">
        <button
          v-for="option in feedbackTypes"
          :key="option.label"
          type="button"
          :class="{ active: feedbackType.label === option.label }"
          @click="feedbackType = option"
        >
          {{ option.label }}
        </button>
      </div>
      <van-field
        v-model="feedbackContent"
        type="textarea"
        rows="5"
        maxlength="500"
        show-word-limit
        placeholder="请描述你遇到的问题或建议，越具体越好～"
        class="pc-feedback-textarea"
      />
      <van-field
        v-model="feedbackContact"
        placeholder="联系方式（选填，方便回复你）"
        class="pc-feedback-contact"
      />
      <van-button
        block
        round
        type="primary"
        :loading="feedbackSubmitting"
        :disabled="!feedbackContent.trim()"
        class="pc-feedback-submit"
        @click="submitFeedbackForm"
      >
        提交反馈
      </van-button>
      <p class="pc-feedback-tip">提交即代表你同意我们仅将该信息用于问题处理。</p>
    </div>

    <!-- 收藏 / 历史列表 -->
    <div v-else class="pc-list">
      <template v-if="currentList.length">
        <button
          v-for="item in currentList"
          :key="`${item.type}-${item.id}`"
          type="button"
          class="pc-list-item"
          @click="openItem(item)"
        >
          <span class="pc-list-type" :class="item.type">{{ item.type === 'material' ? '资料' : '笔记' }}</span>
          <span class="pc-list-title">{{ item.title || '未命名' }}</span>
          <span class="pc-menu-arrow">›</span>
        </button>
      </template>
      <van-empty v-else :description="view === 'favorites' ? '还没有收藏内容' : '暂无浏览记录'" />
    </div>
  </van-popup>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { showConfirmDialog, showDialog, showFailToast, showSuccessToast } from 'vant'
import { submitFeedback } from '../api/feedback'
import { clearLocalData, getFavorites, getHistory } from '../utils/localStore'

const emit = defineEmits(['open'])

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'monkeys.xu@qq.com'
const officialAccount = import.meta.env.VITE_OFFICIAL_ACCOUNT_NAME || '猴哥考研'
const baseUrl = import.meta.env.BASE_URL

const show = ref(false)
const view = ref('menu')
const favorites = ref([])
const history = ref([])

// 与后端 sys_feedback.feedback_type 枚举一致：1功能建议 2BUG反馈 3账号问题 4其他 5求资料 6链接失效
const feedbackTypes = [
  { label: '链接失效', value: 6 },
  { label: '求资料', value: 5 },
  { label: '内容错误', value: 2 },
  { label: '功能建议', value: 1 },
  { label: '其他问题', value: 4 }
]
const feedbackType = ref(feedbackTypes[0])
const feedbackContent = ref('')
const feedbackContact = ref('')
const feedbackSubmitting = ref(false)

const panelTitle = computed(() => {
  if (view.value === 'feedback') {
    return '意见反馈'
  }
  if (view.value === 'donate') {
    return '支持本站'
  }
  if (view.value === 'favorites') {
    return '我的收藏'
  }
  if (view.value === 'history') {
    return '浏览历史'
  }
  return '个人中心'
})

const currentList = computed(() => (view.value === 'favorites' ? favorites.value : history.value))

watch(show, (visible) => {
  if (visible) {
    refreshLists()
  }
})

function refreshLists() {
  favorites.value = getFavorites()
  history.value = getHistory()
}

function openPanel() {
  show.value = true
}

function resetView() {
  view.value = 'menu'
}

function openList(target) {
  refreshLists()
  view.value = target
}

function openItem(item) {
  show.value = false
  emit('open', { id: item.id, type: item.type })
}

async function submitFeedbackForm() {
  const content = feedbackContent.value.trim()
  if (!content) {
    return
  }
  feedbackSubmitting.value = true
  try {
    await submitFeedback({
      feedbackType: feedbackType.value.value,
      title: feedbackType.value.label,
      content,
      contact: feedbackContact.value.trim()
    })
    showSuccessToast('反馈已提交，感谢！')
    feedbackContent.value = ''
    feedbackContact.value = ''
    view.value = 'menu'
  } catch (error) {
    const text = `【${feedbackType.value.label}】${content}${feedbackContact.value ? `\n联系方式：${feedbackContact.value}` : ''}`
    showConfirmDialog({
      title: '提交失败',
      message: `反馈接口暂时不可用，可以复制内容后发送到邮箱 ${contactEmail}`,
      confirmButtonText: '复制内容',
      cancelButtonText: '取消'
    })
      .then(() => copyText(text, '反馈内容已复制'))
      .catch(() => {})
  } finally {
    feedbackSubmitting.value = false
  }
}

async function shareSite() {
  await copyText(window.location.origin + window.location.pathname, '链接已复制，去粘贴分享吧')
}

function showAbout() {
  showDialog({
    title: '联系与关于',
    message: `公众号：${officialAccount}\n邮箱：${contactEmail}\n\n本站资料仅供学习交流使用。`,
    confirmButtonText: '我知道了'
  })
}

function confirmClear() {
  showConfirmDialog({
    title: '清除本地数据',
    message: '将清空本机保存的收藏和浏览历史，操作不可恢复。',
    confirmButtonText: '清除',
    confirmButtonColor: '#ee0a24',
    cancelButtonText: '取消'
  })
    .then(() => {
      clearLocalData()
      refreshLists()
      showSuccessToast('已清除')
    })
    .catch(() => {})
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text)
    showSuccessToast(message)
  } catch (error) {
    showFailToast('复制失败，请手动复制')
  }
}
</script>
