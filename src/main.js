//安装vue，等同于导入vue.js文件
import Vue from 'vue'
//导入App组件（根组件）
import App from './App.vue'
//取消生产提示
Vue.config.productionTip = false

//导入混入
//全局混入
//Vue.mixin(mix1)

//导入插件
import {p1} from "./plugins";
//使用插件（一般放在Vue实例之前）
Vue.use(p1, 1, 2,  4)

//引入vuex插件中的核心对象：store
import store from "./vuex/store";

//导入vue-router插件
import VueRouter from 'vue-router'
//使用vue-router插件
Vue.use(VueRouter)
//导入路由器对象，下面的new vue要加配置项：router
import router from './router/index'

new Vue({
    el: "#app",
    store : store,   //用this.$store来拿到共享对象
    async beforeCreate() {
        //全局事件总线, 所有组件共享这个this, vue实例，通过$bus来在组件之间传输数据
        Vue.prototype.$bus = this
        window.myAPI.getSavingState().then(savingState => {
            if (savingState) {
                this.$store.commit('SET_VOLUME', savingState.volume)
                this.$store.commit('SET_CURRENT_INDEX', savingState.currentIndex)
                this.$store.commit('SET_NOW_MODE', savingState.nowMode)
                this.$store.commit('SET_IS_MUTE', savingState.isMute)
                this.$store.commit('SET_QUEUE', savingState.queue)
                this.$store.commit('SET_SHOW_LYRICS', savingState.showLyrics)
                this.$store.commit('SET_TO_HOME_AFTER_CHANGE_QUEUE', savingState.toHomeAfterChangeQueue)
                this.$store.commit('SET_AUTO_HIDE_LRC', savingState.autoHideLrc)
                this.$store.commit('SET_SHOW_QUEUE', savingState.showQueue)
                this.$store.commit('SET_LYRIC_ALIGNMENT_MODE', savingState.lyricAlignmentMode)
                this.$store.commit('SET_HIGHLIGHT', savingState.highlight)
                this.$store.commit('SET_SHOW_FORMAT', savingState.showFormat)
                this.$store.commit('SET_INFO_MODAL', savingState.infoModal)
                this.$store.commit('SET_LYRICS_MODAL', savingState.lyricsModal)
                this.$store.commit('SET_QUEUE_MODAL', savingState.queueModal)

                this.$store.commit('SET_EXIT', savingState.exit)
                this.$store.commit('SET_GLOBAL_SHORTCUT', savingState.globalShortcut)
                this.$store.commit('SET_SAVED_CURRENT_PLAYTIME', savingState.savedCurrentPlaytime)
                this.$store.commit('SET_LYRIC_FONT', savingState.lyricFont)
                this.$store.commit('SET_LYRIC_FONT2', savingState.lyricFont2)
                this.$store.commit('SET_ONLINE_LRC', savingState.onlineLrc)
                this.$store.commit('SET_LYRIC_DIRECTORY', savingState.lyricDirectory)
                this.$store.commit('SET_BIGGER_LYRIC', savingState.biggerLyric)
                this.$store.commit('SET_SHOW_TLYRIC', savingState.showTlyric)
                this.$store.commit('SET_CHECK', savingState.check)
                this.$store.commit('SET_BLUR', savingState.blur)
                this.$store.commit('SET_BRIGHT', savingState.bright)
                this.$store.commit('SET_SHOW_ALBUMS', savingState.showAlbums)
                this.$store.commit('SET_SHOW_ARTISTS', savingState.showArtists)
                this.$store.commit('SET_SHOW_FOLDERS', savingState.showFolders)
                this.$store.commit('SET_OTHER_BLUR', savingState.otherBlur)
                this.$store.commit('SET_SHORTCUTS', savingState.shortcuts)
                this.$store.commit('SET_DLYRIC_COLOR', savingState.dLyricColor)
                this.$store.commit('SET_USE_PURE_COLOR', savingState.usePureColor)
                this.$store.commit('SET_DLYRIC_COLOR_PURE', savingState.dLyricColorPure)
                this.$store.commit('SET_UseEQ', savingState.useEQ)
                this.$store.commit('SET_EQPARAM', savingState.EQParam)
                this.$store.commit('SET_BOLD_LRC', savingState.boldLrc)
                this.$store.commit('SET_SHOW_SPECTRUM', savingState.showSpectrum)
                this.$store.commit('SET_PFONT', savingState.pFont)
                this.$store.commit('SET_DFONT', savingState.dFont)
                this.$store.commit('SET_MATCH_BLANK', savingState.matchBlank)
                this.$store.commit('SET_SPECTRUM_SPEED', savingState.spectrumSpeed)
                this.$store.commit('SET_SHOW_SONG_INFO', savingState.showSongInfo)
                this.$store.commit('SET_USE_BACK_COVER', savingState.useBackCover)
                this.$store.commit('SET_BACK_COVER_PATH', savingState.backCoverPath)
                this.$store.commit('SET_ROTATE_COVER', savingState.rotateCover)
                this.$store.commit('SET_VOLUME_CHANGE', savingState.volumeChange)
                this.$store.commit('SET_DOWNLOAD_ONLINE_IMG', savingState.downloadOnlineImg)
                console.log("读取设置：成功")
                if (this.$store.state.queue[0] !== undefined) {
                    if (this.$store.state.queue[0].id === "") {
                        window.myAPI.closeWelcome()
                    }
                } else {
                    window.myAPI.closeWelcome()
                }
            } else {
                console.log("读取设置：失败")
            }
        });

        window.myAPI.getAllSongs().then(songs => {
            this.$store.commit('SET_SONGS', songs);
        });
        window.myAPI.getAllPlaylists().then(playlists => {
            this.$store.commit('SET_PLAYLISTS', playlists);
        });
    },
    router : router,
    render: h => h(App),
    /*原本是这样的↓
    * render ：（createElement）=>{
    *     return createElement(App)
    * }
    * */
});

