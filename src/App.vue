<template>
  <div class="app-shell">
    <van-nav-bar
      v-if="isDetail"
      :left-arrow="isDetail"
      fixed
      safe-area-inset-top
      @click-left="backToList"
    >
      <template #title>
        <div v-if="!isDetail" class="nav-brand">
          <img :src="`${baseUrl}assets/logo.png`" alt="猴哥星球" />
          <span>猴哥星球</span>
        </div>
        <span v-else>{{ navTitle }}</span>
      </template>
    </van-nav-bar>

    <main class="page-body" :class="{ 'with-nav': isDetail }">
      <section v-if="!isDetail" class="list-page">
        <section class="home-hero" aria-label="资料库概览">
          <div class="hero-brand-row">
            <button class="hero-brand" type="button" @click="switchModule(defaultModule)">
              <img :src="`${baseUrl}assets/logo.png`" alt="" />
              <span>猴哥星球</span>
            </button>
            <span class="hero-badge">H5 资料库</span>
          </div>
          <h1 class="hero-title" :aria-label="heroTitle">
            <span aria-hidden="true">{{ typedHeroTitle || '\u00a0' }}</span>
          </h1>
          <p>{{ activeModule === 'material' ? '考研资料、网盘链接和分类入口集中整理。' : '按科目和分类筛选，随时打开重点内容。' }}</p>

          <div class="hero-note">
            <span>NOTE</span>
            <strong>{{ activeModule === 'material' ? '防走丢：请关注「公众号：猴子考研」' : '打开笔记详情后，可用画板标记重点。' }}</strong>
          </div>

        </section>

        <div v-if="visibleModules.length > 1" class="home-sticky-switch">
          <div
            class="hero-module-switch"
            :style="{ '--module-count': visibleModules.length }"
            role="tablist"
            aria-label="内容模块"
          >
            <button
              v-for="module in visibleModules"
              :key="module.value"
              :class="{ active: activeModule === module.value }"
              type="button"
              role="tab"
              :aria-selected="activeModule === module.value"
              @click="switchModule(module.value)"
            >
              <span>{{ module.tabLabel }}</span>
              <em>{{ moduleCountLabel(module.value) }}</em>
            </button>
          </div>
        </div>

        <section v-if="siteConfig.materialEnabled && activeModule === 'material'" class="module-panel">
          <van-search
            v-model="materialQuery.keywords"
            shape="round"
            placeholder="搜索考研资料..."
            @search="refreshMaterialList"
            @clear="refreshMaterialList"
          />

          <div class="material-filter-card" aria-label="资料筛选">
            <div class="material-subject-row" role="tablist" aria-label="资料科目">
              <button
                :class="{ active: activeMaterialSubjectIndex === 0 }"
                type="button"
                role="tab"
                :aria-selected="activeMaterialSubjectIndex === 0"
                @click="selectMaterialSubject(0)"
              >
                全部
              </button>
              <button
                v-for="(subject, index) in materialSubjects"
                :key="subject.value || subject.label"
                :class="{ active: activeMaterialSubjectIndex === index + 1 }"
                type="button"
                role="tab"
                :aria-selected="activeMaterialSubjectIndex === index + 1"
                @click="selectMaterialSubject(index + 1)"
              >
                {{ subject.label }}
              </button>
            </div>
            <div v-if="materialCategories.length > 0" class="material-category-row" aria-label="资料分类">
              <button
                :class="{ active: activeMaterialCategoryIndex === 0 }"
                type="button"
                @click="selectMaterialCategory(0)"
              >
                全部
              </button>
              <button
                v-for="(category, index) in materialCategories"
                :key="category.value || category.label"
                :class="{ active: activeMaterialCategoryIndex === index + 1 }"
                type="button"
                @click="selectMaterialCategory(index + 1)"
              >
                {{ category.label }}
              </button>
            </div>
          </div>

          <van-pull-refresh v-model="materialRefreshing" @refresh="refreshMaterialList">
            <van-list
              v-model:loading="materialLoading"
              :finished="materialFinished"
              finished-text="没有更多资料了"
              @load="loadMaterialList"
            >
              <article
                v-for="item in materialList"
                :key="item.id"
                class="content-card material-card"
                @click="openMaterialDetail(item.id)"
              >
                <img v-if="item.coverImage" class="content-cover" :src="item.coverImage" alt="" />
                <div class="content-main">
                  <h3>{{ item.title }}</h3>
                  <div class="tag-row">
                    <van-tag v-if="item.isTop === 1" type="danger" plain>置顶</van-tag>
                    <van-tag v-if="item.subjectName" type="primary" plain>{{ item.subjectName }}</van-tag>
                    <van-tag v-for="tag in item.categoryList" :key="tag" plain>{{ tag }}</van-tag>
                  </div>
                  <p class="link-summary">
                    <span v-if="item.baiduUrl">百度网盘</span>
                    <span v-if="item.quarkUrl">夸克网盘</span>
                    <span v-if="!item.baiduUrl && !item.quarkUrl">查看详情</span>
                  </p>
                </div>
              </article>
              <van-empty
                v-if="!materialLoading && materialFinished && materialList.length === 0"
                :description="materialEmptyDescription"
              />
            </van-list>
          </van-pull-refresh>
        </section>

        <section v-else class="module-panel note-panel">
          <van-search
            v-model="noteQuery.keywords"
            shape="round"
            placeholder="搜索笔记标题或内容..."
            @search="refreshNoteList"
            @clear="refreshNoteList"
          />

          <div class="note-filter-card">
            <div class="note-subject-row" role="tablist" aria-label="笔记科目">
              <button
                :class="{ active: activeSubjectIndex === 0 }"
                type="button"
                role="tab"
                :aria-selected="activeSubjectIndex === 0"
                @click="selectNoteSubject(0)"
              >
                全部
              </button>
              <button
                v-for="(subject, index) in noteSubjects"
                :key="subject.value || subject.label"
                :class="{ active: activeSubjectIndex === index + 1 }"
                type="button"
                role="tab"
                :aria-selected="activeSubjectIndex === index + 1"
                @click="selectNoteSubject(index + 1)"
              >
                {{ subject.label }}
              </button>
            </div>
            <div class="note-category-row" aria-label="笔记分类">
              <button
                :class="{ active: activeNoteCategoryIndex === 0 }"
                type="button"
                @click="selectNoteCategory(0)"
              >
                全部
              </button>
              <button
                v-for="(category, index) in noteCategories"
                :key="category.value || category.label"
                :class="{ active: activeNoteCategoryIndex === index + 1 }"
                type="button"
                @click="selectNoteCategory(index + 1)"
              >
                {{ category.label }}
              </button>
            </div>
          </div>

          <van-pull-refresh v-model="noteRefreshing" @refresh="refreshNoteList">
            <van-list
              v-model:loading="noteLoading"
              :finished="noteFinished"
              finished-text="没有更多笔记了"
              @load="loadNoteList"
            >
              <article
                v-for="item in noteList"
                :key="item.id"
                class="content-card note-card"
                :class="{ 'link-card': item.type === 1 }"
                @click="openNoteDetail(item)"
              >
                <div class="note-card-header">
                  <van-tag plain type="primary">{{ item.categoryName || noteCategoryLabel(item.categoryId) }}</van-tag>
                  <em>{{ item.subjectName || noteSubjectLabel(item.subjectId) }}</em>
                  <span v-if="item.updateTime">{{ formatDate(item.updateTime) }}</span>
                </div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.summary || plainText(item.content, 76) || (item.type === 1 ? '点击跳转外部页面' : '点击查看笔记详情') }}</p>
              </article>
              <van-empty
                v-if="!noteLoading && noteFinished && noteList.length === 0"
                :description="noteEmptyDescription"
              />
            </van-list>
          </van-pull-refresh>
        </section>
      </section>

      <section v-else class="detail-page">
        <van-loading v-if="detailLoading" class="center-loading" />
        <template v-else-if="detailType === 'material' && materialDetail">
          <h1>{{ materialDetail.title }}</h1>
          <div class="tag-row detail-tags">
            <van-tag v-if="materialDetail.subjectName" type="primary" plain>{{ materialDetail.subjectName }}</van-tag>
            <van-tag v-for="tag in materialDetail.categoryList" :key="tag" plain>{{ tag }}</van-tag>
          </div>
          <div v-if="safeMaterialContent" class="content-text content-html" v-html="safeMaterialContent"></div>

          <div v-if="materialDetail.baiduUrl || materialDetail.quarkUrl" class="pan-actions">
            <button
              v-if="materialDetail.baiduUrl"
              class="pan-card baidu"
              type="button"
              @click="openPan(materialDetail.baiduUrl, materialDetail.baiduCode, 'baidu_click')"
            >
              <span class="pan-icon">度</span>
              <span class="pan-info">
                <strong>打开百度网盘</strong>
                <em>{{ codeLabel(materialDetail.baiduCode) }}</em>
              </span>
              <span class="pan-arrow">›</span>
            </button>
            <button
              v-if="materialDetail.quarkUrl"
              class="pan-card quark"
              type="button"
              @click="openPan(materialDetail.quarkUrl, materialDetail.quarkCode, 'quark_click')"
            >
              <span class="pan-icon">夸</span>
              <span class="pan-info">
                <strong>打开夸克网盘</strong>
                <em>{{ codeLabel(materialDetail.quarkCode) }}</em>
              </span>
              <span class="pan-arrow">›</span>
            </button>
          </div>

          <van-empty
            v-if="!materialDetail.baiduUrl && !materialDetail.quarkUrl"
            description="暂未配置网盘链接"
          />

          <van-notice-bar
            v-if="materialDetail.linkRemark"
            class="remark"
            wrapable
            :scrollable="false"
            :text="materialDetail.linkRemark"
          />
        </template>

        <template v-else-if="detailType === 'note' && noteDetail">
          <!-- 外部链接笔记：全屏内嵌网页，体验接近原生页面 -->
          <div v-if="isExternalLinkNote" class="link-detail-full">
            <div v-if="linkFrameLoading" class="link-frame-loading">
              <van-loading>页面加载中...</van-loading>
            </div>
            <iframe
              class="link-frame"
              :src="noteDetail.linkUrl"
              title="外部页面"
              @load="linkFrameLoading = false"
            ></iframe>
            <button type="button" class="link-open-browser" @click="openExternalInBrowser">
              浏览器打开 ›
            </button>
          </div>

          <!-- 普通笔记详情 -->
          <article v-else ref="noteDetailCard" class="note-detail-card">
            <div class="note-meta">
              <van-tag plain type="primary">{{ noteDetail.subjectName || noteSubjectLabel(noteDetail.subjectId) }}</van-tag>
              <van-tag plain>{{ noteDetail.categoryName || noteCategoryLabel(noteDetail.categoryId) }}</van-tag>
              <span v-if="noteDetail.updateTime">{{ formatDate(noteDetail.updateTime) }}</span>
            </div>
            <h1>{{ noteDetail.title }}</h1>
            <p v-if="noteDetail.summary" class="note-summary">{{ noteDetail.summary }}</p>
            <div v-if="safeNoteContent" class="content-text content-html note-content" v-html="safeNoteContent"></div>
            <van-empty v-else description="暂无笔记内容" />

            <!-- 画板 Canvas -->
            <canvas
              v-show="sketchEnabled"
              ref="sketchCanvas"
              class="sketch-canvas"
              :class="{ 'sketch-active': sketchActive }"
              @mousedown="startSketch"
              @mousemove="drawSketch"
              @mouseup="endSketch"
              @mouseleave="endSketch"
            />
          </article>

          <!-- 画板工具栏 -->
          <div v-show="sketchEnabled" class="sketch-toolbar">
            <div class="sketch-tools">
              <button
                type="button"
                :class="{ active: sketchTool === 'pen' }"
                title="画笔"
                @click="setSketchTool('pen')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </button>
              <button
                type="button"
                :class="{ active: sketchTool === 'highlighter' }"
                title="荧光笔"
                @click="setSketchTool('highlighter')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 11-6 6v3h9l3-3" />
                  <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
                  <path d="M14.5 3.5 21 10" />
                </svg>
              </button>
              <button
                type="button"
                :class="{ active: sketchTool === 'eraser' }"
                title="橡皮擦"
                @click="setSketchTool('eraser')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                  <path d="M22 21H7" />
                  <path d="m5 11 9 9" />
                </svg>
              </button>
              <div class="sketch-divider" />
              <button type="button" title="撤销" @click="undoSketch">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 7v6h6" />
                  <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                </svg>
              </button>
              <button type="button" title="清空" @click="clearSketch">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
              <button type="button" title="保存图片" @click="exportSketch">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              <div class="sketch-divider" />
              <button type="button" title="关闭画板" @click="toggleSketch">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </template>
      </section>

      <!-- 笔记画板触发按钮 -->
      <button
        v-if="detailType === 'note' && noteDetail && !isExternalLinkNote"
        type="button"
        class="sketch-fab"
        :class="{ active: sketchEnabled }"
        @click="toggleSketch"
        title="画板标记"
      >
        <svg v-if="!sketchEnabled" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </main>

    <!-- 个人中心悬浮入口（仅列表页展示） -->
    <PersonalCenter v-if="!isDetail" @open="openFromCenter" />

    <footer class="site-footer">
      <button class="site-disclaimer-link" type="button" @click="showDisclaimer">
        免责声明
      </button>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
        鄂ICP备2024066684号-4
      </a>
    </footer>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { marked } from 'marked'
import html2canvas from 'html2canvas'
import { showConfirmDialog, showDialog, showFailToast, showSuccessToast } from 'vant'
import { getMaterialCategories, getMaterialDetail, getMaterialList, getMaterialSubjects } from './api/material'
import { getNoteCategories, getNoteDetail, getNoteList, getNoteSubjects } from './api/note'
import { reportVisit } from './api/visit'
import PersonalCenter from './components/PersonalCenter.vue'
import { addHistory } from './utils/localStore'

const siteConfig = {
  officialAccountName: import.meta.env.VITE_OFFICIAL_ACCOUNT_NAME || '猴哥考研',
  materialEnabled: parseEnvBoolean(import.meta.env.VITE_MATERIAL_ENABLED, true)
}
const baseUrl = import.meta.env.BASE_URL

const allModules = [
  { value: 'material', tabLabel: '资料' },
  { value: 'note', tabLabel: '笔记' }
]
const defaultNoteSubjects = [{ label: '考研政治', value: '' }]

const visibleModules = computed(() => allModules.filter((module) => (
  siteConfig.materialEnabled || module.value !== 'material'
)))
const defaultModule = computed(() => visibleModules.value[0]?.value || 'note')
const activeModule = ref(defaultModule.value)
const materialList = ref([])
const materialSubjects = ref([])
const materialCategories = ref([])
const activeMaterialSubjectIndex = ref(0)
const activeMaterialCategoryIndex = ref(0)
const materialLoading = ref(false)
const materialRefreshing = ref(false)
const materialFinished = ref(false)
const materialListError = ref(false)
const materialTotal = ref(null)
const materialDetail = ref(null)
let materialRequestToken = 0
let materialListInFlight = false
let materialReloadPending = false

const noteList = ref([])
const noteSubjects = ref(defaultNoteSubjects)
const noteCategories = ref([])
const activeSubjectIndex = ref(0)
const activeNoteCategoryIndex = ref(0)
const noteLoading = ref(false)
const noteRefreshing = ref(false)
const noteFinished = ref(false)
const noteListError = ref(false)
const noteTotal = ref(null)
const noteDetail = ref(null)
let noteRequestToken = 0
let noteListInFlight = false
let noteReloadPending = false

const detailLoading = ref(false)
const detailType = ref('')
const linkFrameLoading = ref(false)

/* ========== 笔记画板状态 ========== */
const sketchEnabled = ref(false)
const sketchActive = ref(false)
const sketchTool = ref('pen')
const sketchCanvas = ref(null)
const noteDetailCard = ref(null)
let sketchCtx = null
let sketchDrawing = false
let sketchCurrentStroke = null // 当前正在画的笔画
let sketchStrokes = [] // 笔画指令列表 [{tool, points: [{x,y}]}]
let sketchStrokesIndex = -1 // 当前撤销指针
let sketchLastX = 0
let sketchLastY = 0
let sketchLastMidX = 0
let sketchLastMidY = 0
let sketchTouchStartHandler = null
let sketchTouchMoveHandler = null
let sketchTouchEndHandler = null
let sketchDpr = 1
let sketchRect = null
let sketchPendingPos = null
let sketchRafId = 0
const SKETCH_MAX_DPR = 2
const SKETCH_MAX_CANVAS_PIXELS = 12_000_000
let sketchSaveTimer = 0

const SKETCH_TOOLS = {
  pen: { color: '#e53935', width: 2.5, opacity: 1, lineCap: 'round', lineJoin: 'round' },
  highlighter: { color: '#ffeb3b', width: 14, opacity: 0.35, lineCap: 'butt', lineJoin: 'round' },
  eraser: { color: '#000000', width: 20, opacity: 1, globalCompositeOperation: 'destination-out', lineCap: 'round', lineJoin: 'round' }
}

/* ================================ */

const materialQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  keywords: '',
  subjectId: '',
  categoryId: ''
})

const noteQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  keywords: '',
  subjectId: '',
  categoryId: ''
})

const isDetail = computed(() => Boolean(detailType.value))

const heroTitle = computed(() => (
  activeModule.value === 'material' ? '让资料更好找' : '把重点笔记带在身边'
))
const typedHeroTitle = ref('')
let heroTitleTimer = 0

const navTitle = computed(() => {
  if (detailType.value === 'material') {
    return '资料详情'
  }
  if (detailType.value === 'note') {
    return '笔记详情'
  }
  return '猴哥星球资料库'
})

const selectedMaterialSubject = computed(() => {
  if (activeMaterialSubjectIndex.value === 0) {
    return ''
  }
  return materialSubjects.value[activeMaterialSubjectIndex.value - 1]?.value || ''
})

const selectedMaterialCategory = computed(() => {
  if (activeMaterialCategoryIndex.value === 0) {
    return ''
  }
  return materialCategories.value[activeMaterialCategoryIndex.value - 1]?.value || ''
})

// 科目 index 0 为「全部」，不限制 subjectId
const selectedSubject = computed(() => {
  if (activeSubjectIndex.value === 0) {
    return ''
  }
  return noteSubjects.value[activeSubjectIndex.value - 1]?.value || ''
})

const selectedNoteCategory = computed(() => {
  if (activeNoteCategoryIndex.value === 0) {
    return ''
  }
  return noteCategories.value[activeNoteCategoryIndex.value - 1]?.value || ''
})

const materialEmptyDescription = computed(() => (
  materialListError.value ? '资料接口暂时不可用，请确认本地后端已启动' : '暂无资料'
))

const noteEmptyDescription = computed(() => (
  noteListError.value ? '笔记接口暂未接入，后端实现后即可展示' : '暂无笔记'
))

const safeMaterialContent = computed(() => sanitizeHtml(materialDetail.value?.content || ''))
const safeNoteContent = computed(() => renderContent(noteDetail.value?.content || '', noteDetail.value?.contentType))
const isExternalLinkNote = computed(() => noteDetail.value?.type === 1 && Boolean(noteDetail.value?.linkUrl))

function moduleCountLabel(module) {
  const total = module === 'material' ? materialTotal.value : noteTotal.value
  if (total !== null) {
    return total
  }
  const hasError = module === 'material' ? materialListError.value : noteListError.value
  return hasError ? '--' : '...'
}

onMounted(async () => {
  reportVisit({ eventType: 'page_view' })
  window.addEventListener('popstate', handlePopState)
  const initTasks = [loadNoteSubjects()]
  if (siteConfig.materialEnabled) {
    initTasks.push(loadMaterialSubjects())
  }
  await Promise.all(initTasks)
  if (siteConfig.materialEnabled) {
    await loadMaterialCategories()
  }
  await loadNoteCategories()
  await restoreFromUrl()
  playHeroTitleTyping()
  prefetchInactiveModuleTotal()
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handlePopState)
  clearHeroTitleTimer()
})

watch(heroTitle, () => {
  nextTick(playHeroTitleTyping)
})

function clearHeroTitleTimer() {
  if (heroTitleTimer) {
    clearInterval(heroTitleTimer)
    heroTitleTimer = 0
  }
}

function shouldReduceMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}

function playHeroTitleTyping() {
  clearHeroTitleTimer()
  const text = heroTitle.value
  if (shouldReduceMotion()) {
    typedHeroTitle.value = text
    return
  }
  typedHeroTitle.value = ''
  let index = 0
  heroTitleTimer = window.setInterval(() => {
    index += 1
    typedHeroTitle.value = text.slice(0, index)
    if (index >= text.length) {
      clearHeroTitleTimer()
    }
  }, 95)
}

async function restoreFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const module = params.get('module')
  const type = params.get('type')
  const id = params.get('id')
  if (isModuleVisible(module)) {
    activeModule.value = module
  } else {
    activeModule.value = defaultModule.value
  }
  if (id) {
    const detailModule = type === 'note' ? 'note' : 'material'
    if (isModuleVisible(detailModule)) {
      await openDetail(id, detailModule, true)
    } else {
      window.history.replaceState({}, '', `${window.location.pathname}?module=${defaultModule.value}`)
    }
  }
}

async function loadMaterialSubjects() {
  try {
    const res = await getMaterialSubjects()
    const rows = Array.isArray(res.data) ? res.data : []
    materialSubjects.value = rows.map(normalizeMaterialOption)
  } catch (error) {
    console.warn('资料科目加载失败：', error)
  }
}

async function loadMaterialCategories() {
  try {
    const res = await getMaterialCategories(selectedMaterialSubject.value)
    const rows = Array.isArray(res.data) ? res.data : []
    materialCategories.value = rows.map(normalizeMaterialOption)
  } catch (error) {
    console.warn('资料分类加载失败：', error)
    materialCategories.value = []
  }
}

async function loadNoteSubjects() {
  try {
    const res = await getNoteSubjects()
    const rows = Array.isArray(res.data) ? res.data : []
    noteSubjects.value = rows.length > 0 ? rows.map(normalizeSubject) : defaultNoteSubjects
  } catch (error) {
    noteSubjects.value = defaultNoteSubjects
  }
}

async function loadNoteCategories() {
  try {
    const res = await getNoteCategories(selectedSubject.value)
    const rows = Array.isArray(res.data) ? res.data : []
    noteCategories.value = rows.map(normalizeCategory)
  } catch (error) {
    noteCategories.value = []
  }
}

async function loadMaterialList() {
  if (!siteConfig.materialEnabled) {
    materialLoading.value = false
    materialRefreshing.value = false
    materialFinished.value = true
    return
  }
  if (materialListInFlight) {
    materialReloadPending = true
    return
  }
  materialListInFlight = true
  const token = materialRequestToken
  const pageNum = materialQuery.pageNum
  const params = {
    ...materialQuery,
    subjectId: selectedMaterialSubject.value,
    categoryId: selectedMaterialCategory.value
  }
  try {
    materialListError.value = false
    const res = await getMaterialList(params)
    if (token !== materialRequestToken) {
      return
    }
    const rows = responseRows(res)
    materialTotal.value = responseTotal(res, rows)
    if (materialRefreshing.value || pageNum === 1) {
      materialList.value = []
      materialRefreshing.value = false
    }
    materialList.value.push(...rows)
    materialQuery.pageNum = pageNum + 1
    materialFinished.value = materialList.value.length >= materialTotal.value || rows.length < materialQuery.pageSize
  } catch (error) {
    if (token !== materialRequestToken) {
      return
    }
    if (materialRefreshing.value || materialQuery.pageNum === 1) {
      materialList.value = []
    }
    materialListError.value = true
    materialRefreshing.value = false
    showFailToast('资料接口不可用')
    materialFinished.value = true
  } finally {
    materialListInFlight = false
    materialLoading.value = false
    if (materialReloadPending) {
      materialReloadPending = false
      materialLoading.value = true
      loadMaterialList()
    }
  }
}

async function loadNoteList() {
  if (noteListInFlight) {
    noteReloadPending = true
    return
  }
  noteListInFlight = true
  const token = noteRequestToken
  const pageNum = noteQuery.pageNum
  const params = {
    ...noteQuery,
    subjectId: selectedSubject.value,
    categoryId: selectedNoteCategory.value
  }
  try {
    noteListError.value = false
    const res = await getNoteList(params)
    if (token !== noteRequestToken) {
      return
    }
    const rows = responseRows(res)
    const total = responseTotal(res, rows)
    noteTotal.value = total
    if (noteRefreshing.value || pageNum === 1) {
      noteList.value = []
      noteRefreshing.value = false
    }
    noteList.value.push(...rows)
    noteQuery.pageNum = pageNum + 1
    noteFinished.value = noteList.value.length >= total || rows.length < noteQuery.pageSize
  } catch (error) {
    if (token !== noteRequestToken) {
      return
    }
    if (noteRefreshing.value || noteQuery.pageNum === 1) {
      noteList.value = []
    }
    noteListError.value = true
    noteRefreshing.value = false
    noteFinished.value = true
  } finally {
    noteListInFlight = false
    noteLoading.value = false
    if (noteReloadPending) {
      noteReloadPending = false
      noteLoading.value = true
      loadNoteList()
    }
  }
}

function refreshMaterialList() {
  materialRequestToken += 1
  materialQuery.pageNum = 1
  materialFinished.value = false
  materialListError.value = false
  materialTotal.value = null
  materialLoading.value = true
  materialRefreshing.value = true
  loadMaterialList()
}

function refreshNoteList() {
  noteRequestToken += 1
  noteQuery.pageNum = 1
  noteFinished.value = false
  noteListError.value = false
  noteTotal.value = null
  noteLoading.value = true
  noteRefreshing.value = true
  loadNoteList()
}

function responseTotal(res, rows) {
  const total = Number(res.total ?? res.data?.total)
  return Number.isFinite(total) ? total : rows.length
}

function responseRows(res) {
  if (Array.isArray(res.rows)) {
    return res.rows
  }
  if (Array.isArray(res.data?.rows)) {
    return res.data.rows
  }
  if (Array.isArray(res.data)) {
    return res.data
  }
  return []
}

async function prefetchInactiveModuleTotal() {
  if (isDetail.value) {
    return
  }
  const tasks = []
  if (siteConfig.materialEnabled && materialTotal.value === null && activeModule.value !== 'material') {
    tasks.push(prefetchMaterialTotal())
  }
  if (noteTotal.value === null && activeModule.value !== 'note') {
    tasks.push(prefetchNoteTotal())
  }
  await Promise.allSettled(tasks)
}

async function prefetchMaterialTotal() {
  try {
    const res = await getMaterialList({
      ...materialQuery,
      pageNum: 1,
      pageSize: 1,
      subjectId: selectedMaterialSubject.value,
      categoryId: selectedMaterialCategory.value
    })
    const rows = responseRows(res)
    materialTotal.value = responseTotal(res, rows)
  } catch (error) {
    materialListError.value = true
  }
}

async function prefetchNoteTotal() {
  try {
    const res = await getNoteList({
      ...noteQuery,
      pageNum: 1,
      pageSize: 1,
      subjectId: selectedSubject.value,
      categoryId: selectedNoteCategory.value
    })
    const rows = responseRows(res)
    noteTotal.value = responseTotal(res, rows)
  } catch (error) {
    noteListError.value = true
  }
}

async function selectMaterialSubject(index) {
  if (activeMaterialSubjectIndex.value === index) {
    return
  }
  activeMaterialSubjectIndex.value = index
  activeMaterialCategoryIndex.value = 0
  await loadMaterialCategories()
  refreshMaterialList()
}

function selectMaterialCategory(index) {
  if (activeMaterialCategoryIndex.value === index) {
    return
  }
  activeMaterialCategoryIndex.value = index
  refreshMaterialList()
}

async function selectNoteSubject(index) {
  if (activeSubjectIndex.value === index) {
    return
  }
  activeSubjectIndex.value = index
  activeNoteCategoryIndex.value = 0
  await loadNoteCategories()
  refreshNoteList()
}

function selectNoteCategory(index) {
  if (activeNoteCategoryIndex.value === index) {
    return
  }
  activeNoteCategoryIndex.value = index
  refreshNoteList()
}

async function switchModule(module) {
  if (!isModuleVisible(module)) {
    return
  }
  if (activeModule.value === module) {
    return
  }
  activeModule.value = module
  window.history.pushState({}, '', `${window.location.pathname}?module=${module}`)
  if (module === 'note' && noteList.value.length === 0 && !noteFinished.value) {
    await loadNoteCategories()
    refreshNoteList()
  }
  if (module === 'material' && materialList.value.length === 0 && !materialFinished.value) {
    refreshMaterialList()
  }
}

function openMaterialDetail(id) {
  if (!siteConfig.materialEnabled) {
    return
  }
  openDetail(id, 'material')
}

function openNoteDetail(item) {
  if (item.type === 1 && item.linkUrl) {
    reportVisit({
      eventType: 'note_link_click',
      materialId: item.id,
      materialTitle: item.title
    })
    // 外链笔记改为站内详情页 + 内嵌网页，列表数据作为兜底直接传入
    openDetail(item.id, 'note', false, item)
    return
  }
  openDetail(item.id, 'note')
}

function openExternalInBrowser() {
  if (noteDetail.value?.linkUrl) {
    window.open(noteDetail.value.linkUrl, '_blank', 'noopener')
  }
}

async function openDetail(id, type, replaceState = false, seedData = null) {
  if (!isModuleVisible(type)) {
    activeModule.value = defaultModule.value
    return
  }
  // 重置画板状态
  sketchEnabled.value = false
  sketchActive.value = false
  window.removeEventListener('resize', handleSketchResize)
  detailType.value = type
  activeModule.value = type
  materialDetail.value = null
  noteDetail.value = seedData
  linkFrameLoading.value = Boolean(seedData?.type === 1 && seedData?.linkUrl)
  detailLoading.value = !seedData
  if (!replaceState) {
    window.history.pushState({ id, type }, '', `?type=${type}&id=${id}`)
  }
  try {
    const res = type === 'note' ? await getNoteDetail(id) : await getMaterialDetail(id)
    if (res.code !== 0) {
      throw new Error(res.msg || '详情加载失败')
    }
    if (type === 'note') {
      // 接口数据优先，列表兜底数据补齐缺失字段（如 linkUrl）
      const hadDetail = Boolean(noteDetail.value)
      noteDetail.value = seedData ? { ...seedData, ...res.data } : res.data
      // 只有 iframe 尚未挂载时（无 seedData 的直达/刷新场景）才需要打开加载层；
      // 若 iframe 已挂载（seedData 场景），加载状态完全由 @load 事件控制，
      // 否则缓存命中时 iframe 先于接口完成加载，这里会把加载层重新置 true 导致卡死
      if (!hadDetail && isExternalLinkNote.value) {
        linkFrameLoading.value = true
      }
      reportVisit({
        eventType: 'note_detail_view',
        materialId: noteDetail.value.id,
        materialTitle: noteDetail.value.title
      })
    } else {
      materialDetail.value = res.data
      reportVisit({
        eventType: 'detail_view',
        materialId: materialDetail.value.id,
        materialTitle: materialDetail.value.title
      })
    }
    const loadedDetail = type === 'note' ? noteDetail.value : materialDetail.value
    if (loadedDetail) {
      addHistory({ id: loadedDetail.id, type, title: loadedDetail.title })
    }
  } catch (error) {
    showFailToast(error.message || '详情加载失败')
  } finally {
    detailLoading.value = false
  }
}

function backToList() {
  const module = isModuleVisible(detailType.value) ? detailType.value : defaultModule.value
  detailType.value = ''
  materialDetail.value = null
  noteDetail.value = null
  sketchEnabled.value = false
  sketchActive.value = false
  window.removeEventListener('resize', handleSketchResize)
  window.history.pushState({}, '', `${window.location.pathname}?module=${module}`)
}

function openFromCenter({ id, type }) {
  if (!isModuleVisible(type)) {
    return
  }
  openDetail(id, type)
}

function codeLabel(code) {
  return code ? `提取码：${code}` : '点击打开链接'
}

function showDisclaimer() {
  showDialog({
    title: '免责声明',
    message: `本站资料由公众号：${siteConfig.officialAccountName} 收集整理，仅供学习交流使用，不得用于任何商业用途。如侵犯您的权益，请联系我：monkeys.xu@qq.com。`,
    confirmButtonText: '我知道了'
  })
}

async function openPan(url, code, eventType) {
  reportVisit({
    eventType,
    materialId: materialDetail.value?.id,
    materialTitle: materialDetail.value?.title
  })
  if (code) {
    await copyText(code, '提取码已复制')
  }
  showConfirmDialog({
    title: '即将打开网盘',
    message: code ? `提取码已复制：${code}` : '点击确认后打开网盘链接',
    confirmButtonText: '打开',
    cancelButtonText: '复制链接'
  })
    .then(() => {
      window.location.href = url
    })
    .catch(() => copyText(url, '链接已复制'))
}

async function copyText(text, message) {
  if (!text) {
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    showSuccessToast(message)
  } catch (error) {
    showFailToast('复制失败，请长按手动复制')
  }
}

function handlePopState() {
  detailType.value = ''
  materialDetail.value = null
  noteDetail.value = null
  sketchEnabled.value = false
  sketchActive.value = false
  window.removeEventListener('resize', handleSketchResize)
  restoreFromUrl()
}

function isModuleVisible(module) {
  return visibleModules.value.some((item) => item.value === module)
}

function parseEnvBoolean(value, defaultValue) {
  if (value === undefined || value === '') {
    return defaultValue
  }
  return !['0', 'false', 'off', 'no'].includes(String(value).trim().toLowerCase())
}

function normalizeSubject(subject) {
  if (typeof subject === 'string') {
    return { label: subject, value: subject }
  }
  return {
    label: subject.label || subject.name || subject.title || '考研政治',
    value: subject.value || subject.id || subject.code || subject.label || ''
  }
}

function normalizeCategory(category) {
  if (typeof category === 'string') {
    return { label: category, value: category }
  }
  return {
    label: category.label || category.name || category.title || '未分类',
    value: category.value || category.id || category.code || category.label || ''
  }
}

function normalizeMaterialOption(item) {
  if (typeof item === 'string') {
    return { label: item, value: item }
  }
  return {
    label: item.name || item.label || item.title || '',
    value: item.id || item.value || item.code || item.name || ''
  }
}

function noteSubjectLabel(value) {
  return noteSubjects.value.find((subject) => String(subject.value) === String(value))?.label || value || '考研政治'
}

function noteCategoryLabel(value) {
  return noteCategories.value.find((category) => String(category.value) === String(value))?.label || value || '未分类'
}

function formatDate(value) {
  if (!value) {
    return ''
  }
  return String(value).slice(0, 10)
}

function renderContent(content, contentType) {
  if (!content) {
    return ''
  }
  const isMarkdown = String(contentType || '').toLowerCase() === 'markdown'
  const html = isMarkdown ? marked.parse(content) : content
  return sanitizeHtml(html)
}

function plainText(content, maxLength) {
  if (!content) {
    return ''
  }
  const text = sanitizeHtml(renderContent(content, 'html'))
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

function sanitizeHtml(html) {
  if (!html) {
    return ''
  }
  const template = document.createElement('template')
  template.innerHTML = html
  template.content.querySelectorAll('script, iframe, object, embed').forEach((node) => node.remove())
  normalizeMarkdownTextNodes(template.content)
  normalizeMarkdownInlineHtml(template.content)
  template.content.querySelectorAll('*').forEach((node) => {
    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase()
      const value = attr.value.trim().toLowerCase()
      if (name.startsWith('on') || ((name === 'href' || name === 'src') && value.startsWith('javascript:'))) {
        node.removeAttribute(attr.name)
      }
    })
    normalizeContentStyle(node)
  })
  return normalizeLooseMarkdownStrongHtml(template.innerHTML)
}

function normalizeMarkdownTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes = []
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode)
  }
  textNodes.forEach((node) => {
    if (!hasLooseMarkdownStrong(node.nodeValue) || isPlainTextContainer(node.parentElement)) {
      return
    }
    const fragment = document.createElement('template')
    fragment.innerHTML = marked.parseInline(node.nodeValue)
    node.replaceWith(fragment.content)
  })
}

function hasLooseMarkdownStrong(text) {
  return /(\*\*|__)(?=\S)([\s\S]*?\S)\1/.test(text || '')
}

function isPlainTextContainer(element) {
  return Boolean(element?.closest('pre, code, textarea, script, style'))
}

function normalizeMarkdownInlineHtml(root) {
  const containers = root.querySelectorAll('p, li, td, th, blockquote, h1, h2, h3, h4, h5, h6, div')
  containers.forEach((node) => {
    if (isPlainTextContainer(node) || !hasLooseMarkdownStrong(node.innerHTML)) {
      return
    }
    node.innerHTML = node.innerHTML.replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '<strong>$2</strong>')
  })
}

function normalizeLooseMarkdownStrongHtml(html) {
  return String(html || '').replace(/(?:\*\*|__)\s*([\s\S]*?)\s*(?:\*\*|__)/g, (match, content) => {
    if (!content || /<(pre|code|textarea|script|style)(\s|>)/i.test(content)) {
      return match
    }
    return `<strong>${content}</strong>`
  })
}

function normalizeContentStyle(node) {
  if (!node.style) {
    return
  }
  const color = node.style.color
  const backgroundColor = node.style.backgroundColor
  const borderColor = node.style.borderColor
  const borderLeftColor = node.style.borderLeftColor
  if (color && !isNeutralColor(color)) {
    node.style.color = 'var(--brand-color)'
  }
  if (backgroundColor && !isNeutralColor(backgroundColor)) {
    node.style.backgroundColor = 'var(--brand-soft)'
  }
  if (borderColor && !isNeutralColor(borderColor)) {
    node.style.borderColor = 'var(--brand-border)'
  }
  if (borderLeftColor && !isNeutralColor(borderLeftColor)) {
    node.style.borderLeftColor = 'var(--brand-color)'
  }
}

function isNeutralColor(value) {
  const color = String(value || '').trim().toLowerCase()
  if (!color || color === 'transparent' || color === 'inherit' || color === 'currentcolor') {
    return true
  }
  if (color.includes('var(--')) {
    return true
  }
  if (color.startsWith('rgb')) {
    const numbers = color.match(/\d+(\.\d+)?/g)?.map(Number) || []
    const [red, green, blue] = numbers
    if (red === undefined || green === undefined || blue === undefined) {
      return false
    }
    const max = Math.max(red, green, blue)
    const min = Math.min(red, green, blue)
    return max - min <= 16 || max <= 80 || min >= 232
  }
  return ['black', 'white', '#000', '#000000', '#111', '#111111', '#222', '#222222', '#333', '#333333', '#fff', '#ffffff'].includes(color)
}

/* ========== 笔记画板功能 ========== */

function toggleSketch() {
  if (sketchEnabled.value) {
    sketchEnabled.value = false
    sketchActive.value = false
    // 移除 touch 事件监听器
    const canvas = sketchCanvas.value
    if (canvas) {
      if (sketchTouchStartHandler) canvas.removeEventListener('touchstart', sketchTouchStartHandler)
      if (sketchTouchMoveHandler) canvas.removeEventListener('touchmove', sketchTouchMoveHandler)
      if (sketchTouchEndHandler) {
        canvas.removeEventListener('touchend', sketchTouchEndHandler)
        canvas.removeEventListener('touchcancel', sketchTouchEndHandler)
      }
    }
    sketchTouchStartHandler = null
    sketchTouchMoveHandler = null
    sketchTouchEndHandler = null
    if (sketchRafId) {
      cancelAnimationFrame(sketchRafId)
      sketchRafId = 0
    }
    sketchPendingPos = null
    sketchRect = null
    sketchCurrentStroke = null
    if (sketchSaveTimer) {
      clearTimeout(sketchSaveTimer)
      sketchSaveTimer = 0
    }
    return
  }
  sketchEnabled.value = true
  sketchActive.value = true
  nextTick(() => {
    initSketchCanvas()
    restoreSketchFromStorage()
  })
}

function initSketchCanvas() {
  const canvas = sketchCanvas.value
  const card = noteDetailCard.value
  if (!canvas || !card) return

  if (!syncSketchCanvasSize(canvas, card)) return

  // 移除旧的 touch 事件监听器
  if (sketchTouchStartHandler) canvas.removeEventListener('touchstart', sketchTouchStartHandler)
  if (sketchTouchMoveHandler) canvas.removeEventListener('touchmove', sketchTouchMoveHandler)
  if (sketchTouchEndHandler) {
    canvas.removeEventListener('touchend', sketchTouchEndHandler)
    canvas.removeEventListener('touchcancel', sketchTouchEndHandler)
  }

  sketchTouchStartHandler = (e) => {
    e.preventDefault()
    startSketch(e)
  }
  sketchTouchMoveHandler = (e) => {
    e.preventDefault()
    drawSketch(e)
  }
  sketchTouchEndHandler = () => {
    endSketch()
  }

  canvas.addEventListener('touchstart', sketchTouchStartHandler, { passive: false })
  canvas.addEventListener('touchmove', sketchTouchMoveHandler, { passive: false })
  canvas.addEventListener('touchend', sketchTouchEndHandler)
  canvas.addEventListener('touchcancel', sketchTouchEndHandler)

  window.removeEventListener('resize', handleSketchResize)
  window.addEventListener('resize', handleSketchResize)
}

function getSketchDpr(rect) {
  const deviceDpr = Math.min(window.devicePixelRatio || 1, SKETCH_MAX_DPR)
  const cssPixels = rect.width * rect.height
  if (cssPixels <= 0) return 1
  const areaSafeDpr = Math.sqrt(SKETCH_MAX_CANVAS_PIXELS / cssPixels)
  return Math.max(1, Math.min(deviceDpr, areaSafeDpr))
}

function syncSketchCanvasSize(canvas, card) {
  const rect = card.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return false
  sketchRect = rect

  const dpr = getSketchDpr(rect)
  sketchDpr = dpr

  canvas.width = Math.round(rect.width * dpr)
  canvas.height = Math.round(rect.height * dpr)
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'

  sketchCtx = canvas.getContext('2d')
  sketchCtx.scale(dpr, dpr)
  sketchCtx.lineCap = 'round'
  sketchCtx.lineJoin = 'round'
  return true
}

function handleSketchResize() {
  if (!sketchEnabled.value || !sketchCanvas.value || !noteDetailCard.value) return
  if (!syncSketchCanvasSize(sketchCanvas.value, noteDetailCard.value)) return

  // 用指令列表重绘（比保存/恢复整张图快得多）
  redrawAllStrokes()
}

function getSketchPos(event) {
  if (!sketchRect) return { x: 0, y: 0 }
  let clientX, clientY
  if (event.touches && event.touches.length > 0) {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  } else if (event.changedTouches && event.changedTouches.length > 0) {
    clientX = event.changedTouches[0].clientX
    clientY = event.changedTouches[0].clientY
  } else {
    clientX = event.clientX
    clientY = event.clientY
  }
  return {
    x: clientX - sketchRect.left,
    y: clientY - sketchRect.top
  }
}

/* ================================
   Sketch 工具方法
   ================================ */

function setSketchTool(tool) {
  sketchTool.value = tool
}

function getToolConfig() {
  return SKETCH_TOOLS[sketchTool.value]
}

function applyToolConfig(tool) {
  if (!sketchCtx) return
  sketchCtx.globalCompositeOperation = tool.globalCompositeOperation || 'source-over'
  sketchCtx.globalAlpha = tool.opacity
  sketchCtx.strokeStyle = tool.color
  sketchCtx.lineWidth = tool.width
  sketchCtx.lineCap = tool.lineCap
  sketchCtx.lineJoin = tool.lineJoin
}

function drawStroke(stroke) {
  if (!sketchCtx || !stroke.points || stroke.points.length < 2) return
  const tool = SKETCH_TOOLS[stroke.tool]
  if (!tool) return
  applyToolConfig(tool)
  drawSmoothStrokePath(stroke.points)
}

function drawSmoothStrokePath(points) {
  if (!sketchCtx || points.length < 2) return
  if (points.length === 2) {
    sketchCtx.beginPath()
    sketchCtx.moveTo(points[0].x, points[0].y)
    sketchCtx.lineTo(points[1].x, points[1].y)
    sketchCtx.stroke()
    return
  }

  sketchCtx.beginPath()
  sketchCtx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const current = points[i]
    const midX = (prev.x + current.x) / 2
    const midY = (prev.y + current.y) / 2
    sketchCtx.quadraticCurveTo(prev.x, prev.y, midX, midY)
  }
  const last = points[points.length - 1]
  sketchCtx.lineTo(last.x, last.y)
  sketchCtx.stroke()
}

function redrawAllStrokes() {
  if (!sketchCtx) return
  clearSketchCanvas()
  const len = Math.min(sketchStrokesIndex + 1, sketchStrokes.length)
  for (let i = 0; i < len; i++) {
    drawStroke(sketchStrokes[i])
  }
}

function startSketch(event) {
  if (!sketchActive.value || !sketchCtx) return
  const card = noteDetailCard.value
  if (card) sketchRect = card.getBoundingClientRect()
  const pos = getSketchPos(event)

  sketchDrawing = true
  sketchLastX = pos.x
  sketchLastY = pos.y
  sketchLastMidX = pos.x
  sketchLastMidY = pos.y

  sketchCurrentStroke = {
    tool: sketchTool.value,
    points: [{ x: pos.x, y: pos.y }]
  }

  applyToolConfig(getToolConfig())
  sketchCtx.beginPath()
  sketchCtx.moveTo(pos.x, pos.y)
  sketchCtx.lineTo(pos.x + 0.1, pos.y + 0.1)
  sketchCtx.stroke()
}

function drawSketch(event) {
  if (!sketchDrawing || !sketchActive.value || !sketchCtx || !sketchCurrentStroke) return
  const pos = getSketchPos(event)
  const dx = pos.x - sketchLastX
  const dy = pos.y - sketchLastY
  // 距离采样：移动小于 4px 直接跳过（减少高频事件堆积）
  if (dx * dx + dy * dy < 16) return

  const midX = (sketchLastX + pos.x) / 2
  const midY = (sketchLastY + pos.y) / 2

  sketchCtx.beginPath()
  sketchCtx.moveTo(sketchLastMidX, sketchLastMidY)
  sketchCtx.quadraticCurveTo(sketchLastX, sketchLastY, midX, midY)
  sketchCtx.stroke()

  sketchLastX = pos.x
  sketchLastY = pos.y
  sketchLastMidX = midX
  sketchLastMidY = midY
  sketchCurrentStroke.points.push({ x: pos.x, y: pos.y })
}

function endSketch() {
  if (!sketchDrawing) return
  sketchDrawing = false
  if (sketchRafId) {
    cancelAnimationFrame(sketchRafId)
    sketchRafId = 0
  }
  sketchPendingPos = null

  if (sketchCurrentStroke && sketchCurrentStroke.points.length >= 2) {
    applyToolConfig(getToolConfig())
    sketchCtx.beginPath()
    sketchCtx.moveTo(sketchLastMidX, sketchLastMidY)
    sketchCtx.lineTo(sketchLastX, sketchLastY)
    sketchCtx.stroke()

    sketchStrokes = sketchStrokes.slice(0, sketchStrokesIndex + 1)
    sketchStrokes.push(sketchCurrentStroke)
    sketchStrokesIndex++
    if (sketchStrokes.length > 50) {
      sketchStrokes.shift()
      sketchStrokesIndex--
    }
  }
  sketchCurrentStroke = null

  if (sketchSaveTimer) clearTimeout(sketchSaveTimer)
  sketchSaveTimer = setTimeout(() => {
    saveSketchToStorage()
  }, 500)
}

function undoSketch() {
  if (sketchStrokesIndex < 0) {
    clearSketchCanvas()
    return
  }
  sketchStrokesIndex--
  redrawAllStrokes()
  // 防抖存 localStorage
  if (sketchSaveTimer) clearTimeout(sketchSaveTimer)
  sketchSaveTimer = setTimeout(() => {
    saveSketchToStorage()
  }, 500)
}

function clearSketch() {
  showConfirmDialog({
    title: '确认清空',
    message: '确定要清空所有画板标记吗？此操作不可撤销。',
    confirmButtonText: '清空',
    cancelButtonText: '取消'
  }).then(() => {
    clearSketchCanvas()
    sketchStrokes = []
    sketchStrokesIndex = -1
    if (sketchSaveTimer) clearTimeout(sketchSaveTimer)
    saveSketchToStorage()
  }).catch(() => {})
}

function clearSketchCanvas() {
  if (!sketchCtx || !sketchCanvas.value) return
  const canvas = sketchCanvas.value
  const dpr = sketchDpr || 1
  sketchCtx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
}

function saveSketchToStorage() {
  if (!noteDetail.value?.id) return
  const key = `sketch_${noteDetail.value.id}`
  const activeStrokes = sketchStrokes.slice(0, sketchStrokesIndex + 1)
  try {
    localStorage.setItem(key, JSON.stringify({
      strokes: activeStrokes,
      index: sketchStrokesIndex,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.warn('画板存储失败，可能超出 quota', e)
  }
}

function restoreSketchFromStorage() {
  if (!noteDetail.value?.id || !sketchCtx) return
  const key = `sketch_${noteDetail.value.id}`
  const saved = localStorage.getItem(key)
  if (!saved) return
  try {
    const data = JSON.parse(saved)
    if (!data.strokes || !Array.isArray(data.strokes)) return
    sketchStrokes = data.strokes
    sketchStrokesIndex = typeof data.index === 'number' ? data.index : sketchStrokes.length - 1
    redrawAllStrokes()
  } catch (e) {
    console.warn('恢复画板草稿失败', e)
  }
}

async function exportSketch() {
  const card = noteDetailCard.value
  if (!card) {
    showFailToast('笔记内容未加载')
    return
  }

  // 计算当前可视区域（相对于笔记卡片，CSS 像素）
  const cardRect = card.getBoundingClientRect()
  const viewportH = window.innerHeight
  const cardTop = cardRect.top
  const cardBottom = cardRect.bottom
  const cardW = cardRect.width
  const cardH = cardRect.height

  // 可视区域在卡片内的起始/结束位置（CSS 像素）
  const visibleTop = Math.max(0, -cardTop)
  const visibleBottom = Math.min(cardH, viewportH - cardTop)
  const visibleH = Math.max(0, visibleBottom - visibleTop)

  if (visibleH <= 0) {
    showFailToast('当前没有可见内容')
    return
  }

  showSuccessToast('正在生成图片...')

  try {
    // 1. 用 html2canvas 渲染笔记卡片为图片
    const cardCanvas = await html2canvas(card, {
      scale: Math.min(window.devicePixelRatio || 1, 2),
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    // 2. 创建合并 canvas，尺寸 = 卡片宽度 × 可视高度
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mergeCanvas = document.createElement('canvas')
    mergeCanvas.width = Math.round(cardW * dpr)
    mergeCanvas.height = Math.round(visibleH * dpr)
    const mCtx = mergeCanvas.getContext('2d')

    // 3. 把笔记内容中对应可视区域的部分画上去
    mCtx.drawImage(
      cardCanvas,
      0, visibleTop * dpr,
      cardCanvas.width, visibleH * dpr,
      0, 0,
      mergeCanvas.width, mergeCanvas.height
    )

    // 4. 叠加 sketchCanvas 标记（只叠加对应可视区域）
    if (sketchCanvas.value && sketchStrokesIndex >= 0) {
      mCtx.drawImage(
        sketchCanvas.value,
        0, visibleTop * sketchDpr,
        sketchCanvas.value.width, visibleH * sketchDpr,
        0, 0,
        mergeCanvas.width, mergeCanvas.height
      )
    }

    // 5. 导出
    const dataUrl = mergeCanvas.toDataURL('image/png')

    // 创建预览弹层
    const preview = document.createElement('div')
    preview.className = 'sketch-export-preview'
    preview.innerHTML = `
      <div class="sketch-export-backdrop" onclick="this.parentElement.remove()"></div>
      <div class="sketch-export-content">
        <h3>长按图片保存到相册</h3>
        <img src="${dataUrl}" alt="笔记截图" />
        <p>在浏览器中长按上方图片，选择「保存图片」即可存入相册</p>
        <button type="button" onclick="this.closest('.sketch-export-preview').remove()">我知道了</button>
      </div>
    `
    document.body.appendChild(preview)

    // 同时尝试下载
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    link.download = `笔记标记_${noteDetail.value?.title || 'untitled'}_${dateStr}.png`
    link.href = dataUrl
    link.style.display = 'none'
    document.body.appendChild(link)
    try {
      link.click()
    } catch (e) {
      console.warn('自动下载失败', e)
    }
    setTimeout(() => link.remove(), 100)
  } catch (e) {
    console.error('生成图片失败', e)
    showFailToast('生成图片失败，请重试')
  }
}

/* ================================ */
</script>
