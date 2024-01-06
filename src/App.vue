<template>
    <div class="unselectable winHidden" tabindex="0"
         @keyup.esc="closeWindow(false)"
         @keyup.space="emitToggle()"
         @keyup.ctrl.left="emitPrev();setSongOnTop()"
         @keyup.ctrl.right="emitNext();setSongOnTop()"
         @keydown.up="upVolume();emitShowVolume()"
         @keydown.down="downVolume();emitShowVolume()"
         @keyup.ctrl.i="emitShowInfo()"
         @keyup.ctrl.p="emitShowPlaylist()"
         @keyup.ctrl.n="changeMute()"
         @keyup.ctrl.o="changeMode()"
         @keyup.ctrl.l="changeLyric()"
         @keyup.ctrl.q="changeQueue()"
         @keyup.ctrl.z="returnHome()"
         @keyup.ctrl.s="toSettings()"
         @click="closeContext()"
         @blur="closeContext"
    >
        <div class="app" v-show="!this.$store.state.miniMode">
            <div class="logo-and-control draggable-area" id="draggable-area">
                <!--                logo部分-->
                <div class="logo">
                    <img src="./assets/logoImg.png" alt="Logo" class="logo-image"
                         :class="{ breathing: isPlaying }">
                    <span class="playerName">Loop Sound Player</span>
                </div>
                <!--                歌曲信息部分-->
                <div class="songInfo">
                    <span v-if="this.$route.path === '/SongsInPlaylist'" class="songInfoText">{{"当前播放列表："+this.$store.state.selectedPlaylistName}}</span>
                    <span v-if="this.$route.path !== '/SongsInPlaylist'" class="songInfoText">
                        {{(this.$store.state.currentIndex+1)+" / "+(this.$store.state.queue.length)+" · "+this.$store.getters.nowSong.title+" - "+this.$store.getters.nowSong.artist}}
                    </span>
                </div>
                <!--                控制按钮部分-->
                <div class="control-buttons">
                <!--   占位                 -->
                    <div class="control-buttons-nodrag" style="margin-left: auto;"></div>
<!--                    迷你模式-->
                    <div class="control-button minimize minimize-button" @click="miniMode">
                        <img src="./assets/mini.png" alt="Minimize">
                    </div>
<!--                    最小化-->
                    <div class="control-button minimize minimize-button" @click="minimizeWindow">
                        <img src="./assets/minimize.png" alt="Minimize">
                    </div>
<!--                    最大化-->
                    <div class="control-button maximize maximize-button" @click="maximizeWindow">
                        <img src="./assets/maximize.png" alt="Maximize">
                    </div>
<!--                    关闭-->
                    <div class="control-button close close-button" @click="closeWindow(false)">
                        <img src="./assets/closeWindow.png" alt="Close">
                    </div>


                </div>
            </div>

            <div class="background">
                <img :src="this.$store.state.nowSongCover" alt="Background Image" class="background-image"
                     :style="{ filter: 'blur(' + $store.state.blur + 'px) saturate(120%) brightness(' + $store.state.bright + '%)' }">
            </div>


            <header class="header">
                <Header></Header>
            </header>

            <main :class="'main-with-background route-container'">
                <div id="showBlackAndRoute">
                    <transition name="slide-up" mode="out-in">
                        <!-- 使用 v-if 条件渲染默认展示 Home 组件 -->
                        <router-view v-if="$route.name === 'Home' || $route.name === undefined" :key="$route.path"></router-view>
                        <!-- 使用 v-else 渲染其他路由组件 -->
                        <router-view v-else></router-view>
                    </transition>
                </div>
            </main>

            <footer class="footer">
                <Footer></Footer>
            </footer>
        </div>

<!--        迷你模式-->
        <div  v-show="this.$store.state.miniMode" class="miniMode">
<!--            背景-->
            <div class="background">
                <img :src="this.$store.state.nowSongCover" alt="Background Image" class="background-image">
            </div>
<!--            封面-->
            <div class="cover-container-mini">
                <img v-if="this.$store.state.nowSongCover" :src="this.$store.state.nowSongCover" alt="cover" class="cover-mini">
            </div>
<!--按钮-->
            <div class="buttonArea">
                <!-- 上一曲按钮 -->
                <div class="control-buttonMini noDrag" @click="emitPrev();setSongOnTop()">
                    <div class="prev-imageMini"></div>
                </div>
                <!-- 暂停播放按钮 -->
                <div class="control-buttonLargeMini  noDrag" @click="emitToggle()">
                    <div
                            v-show="!this.$store.state.isPlaying"
                            class="pause-play-imageMini"
                    ></div>
                    <div
                            v-show="this.$store.state.isPlaying"
                            class="pause-play-image2Mini"
                    ></div>
                </div>
                <!-- 下一曲按钮 -->
                <div class="control-buttonMini  noDrag" @click="emitNext();setSongOnTop()">
                    <div class="next-imageMini"></div>
                </div>
                <!--            退出迷你模式按钮-->
                <div class="control-buttonMini  noDrag" @click="miniMode">
                    <div class="exitMini"></div>
                </div>
            </div>

        </div>

        <div v-show="showIsExist" class="showIsExist">
            {{`歌曲已存在，请勿重复添加！ `}}
        </div>

        <div v-show="showUpdate" class="showIsExist">
            {{ `有新版本可用，请前往设置查看更新信息。` }}
        </div>
    </div>
</template>
<style>
    .miniMode{
        margin-top: 9px;
        display: flex;
        align-items: center;
        width: 100%;
        height: 55px;
        -webkit-app-region: drag;
    }
    .buttonArea{
        display: flex;
        flex: 1;
        justify-content: space-between;
        align-items: center;
        margin-left: 10px;
    }
    .noDrag{
        -webkit-app-region: no-drag;
    }
    .control-buttonMini {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 35px;
        height: 35px;
        background-color: rgba(0, 0, 0, 0.3);
        color: white;
        border-radius: 50%;
        cursor: pointer;
        margin: 0 4px;
        transition: background-color 0.2s ease; /* 添加过渡效果 */
    }
    .control-buttonMini:hover{
        background-color: rgba(255, 255, 255, 0.1);
    }
    .control-buttonLargeMini {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 45px;
        height: 45px;
        background-color: rgba(0, 0, 0, 0.3);
        color: white;
        border-radius: 50%;
        cursor: pointer;
        transition: background-color 0.2s ease; /* 添加过渡效果 */
    }
    .control-buttonLargeMini:hover{
        background-color: rgba(255, 255, 255, 0.1);
    }
    .pause-play-imageMini {
        width: 80%;
        height: 80%;
        background-image: url('./assets/play.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .pause-play-image2Mini {
        width: 80%;
        height: 80%;
        background-image: url('./assets/pause.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .next-imageMini {
        width: 60%;
        height: 60%;
        background-image: url('./assets/next.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .prev-imageMini {
        width: 60%;
        height: 60%;
        background-image: url('./assets/prev.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .exitMini{
        width: 80%;
        height: 80%;
        background-image: url('./assets/mini.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }

    .cover-container-mini {
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .cover-mini {
        transition: ease-in-out 0.3s;
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 10px;
    }

    @keyframes breathe {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }

    .logo-image {
        animation: breathe 3s infinite;
    }

    .logo-image:not(.breathing) {
        animation: none;
    }
    .showIsExist {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 8px 16px;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 20px;
        font-size: 16px;
        z-index: 1000;
    }
    .draggable-area {
        -webkit-app-region: drag;
        width: 100%; /* 设置宽度 */
        height: 30px; /* 设置高度 */
    }
    .logo-and-control {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: rgba(0, 0, 0, 0);
        margin-bottom: 5px;
    }

    .logo {
        width: 33.33%;
        display: flex;
        align-items: center;
    }
    .logo img {
        height: 30px;
    }

    .playerName {
        margin-left: 5px;
        color: white;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 15px;
        padding: 4px 8px;
        white-space: nowrap;
    }
    .songInfo {
        margin-left: 10px;
        background-color: rgba(0, 0, 0, 0.3);
        width: 100%;
        display: flex;
        border-radius: 15px;
        align-items: center;
        justify-content: center; /* 文本水平居中 */
        overflow: hidden; /* 隐藏超出容器的内容 */
        white-space: nowrap; /* 防止文本换行 */
    }
    .songInfoText {
        margin-left: 10px;
        color: white;
        border-radius: 50px;
        padding: 4px 8px;
        text-overflow: ellipsis; /* 使用省略号来截断超出容器的文本 */
        overflow: hidden; /* 再次确保隐藏超出容器的内容 */
        white-space: nowrap; /* 防止文本换行 */
    }

    .control-buttons {
        width: 33.33%;
        display: flex;
        padding-right: 2px;
    }

    .control-button {
        width: 30px; /* Adjust the width as needed */
        height: 30px; /* Adjust the height as needed */
        margin-left: 10px;
        cursor: pointer;
        border-radius: 10px;
        background-color: rgba(0, 0, 0, 0.2);
        -webkit-app-region: no-drag;
    }

    .close-button:hover {
        background-color: red; /* Change to the desired hover color */
    }
    .maximize-button:hover,
    .minimize-button:hover{
        background-color: rgba(255, 255, 255, 0.2);
    }

    .control-button img {
        width: 100%;
        height: 100%;
    }
    .app {
        overflow-y: hidden;
        min-width: 400px;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        height: 97.5vh;
    }
    .app::-webkit-scrollbar {
        width: 1px; /* 设置滚动条宽度 */
    }

    .app::-webkit-scrollbar-thumb {
        background-color: transparent; /* 设置滚动条 thumb 颜色为透明 */
    }


    .background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        overflow: hidden; /* 确保图片不溢出容器 */
        background-color: rgba(0, 0, 0, 0.5); /* 设置背景颜色，可以根据需要调整 */
    }

    .background-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover; /* 控制图片填充方式，类似 background-size: cover */
    }
    .background::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色 */
    }

    /* 在这里设置 header 的样式 */
    .header {
        margin-top: 2px;
        background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
        border-radius: 100px; /* 圆角 */
        padding: 5px; /* 调整内边距以使内容与圆角保持一致 */
    }

    main {
        flex: 1 1 auto;
        margin-top: 10px;
        margin-bottom: 10px;
    }

    /* 在这里设置 footer 的样式 */
    .footer {
        background-color: rgba(0, 0, 0, 0.15); /* 半透明灰色背景 */
        border-radius: 100px; /* 圆角 */
        padding: 10px; /* 调整内边距以使内容与圆角保持一致 */
    }

    /* 设置全局字体颜色 */
    body {
        color: #f0f0f0; /* 灰白色 */
    }

    /* 设置链接字体颜色 */
    a {
        color: #f0f0f0; /* 灰白色 */
    }

    .main-with-background {
        margin-right: 5px;
        margin-left: 5px;
        background-color: rgba(0, 0, 0, 0.2); /* 半透明黑色背景 */
        border-radius: 15px; /* 圆角 */
        padding: 15px; /* 调整内边距以使内容与圆角保持一致 */
        overflow: hidden; /* 禁止滚动 */
    }
    .route-container {
        height: calc(97vh - 210px); /* 100px 是顶部导航栏和底部控制栏的总高度 */
        overflow: hidden;
    }
    /* 定义过渡效果 */
    .slide-up-enter-active,
    .slide-up-leave-active {
        transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
    }

    .slide-up-enter,
    .slide-up-leave-to {
        transform: translateY(15%);
        opacity: 0;
    }
    /*    文本不可选中*/
    .unselectable {
        outline: none;
        -webkit-user-select: none; /* Chrome, Safari, Opera */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* IE 10+ */
        user-select: none; /* Standard syntax */
    }
    .unselectable:focus {
        box-shadow: none;
        /* 或者设置边框为透明，具体样式根据需要自行调整 */
        border: 0 solid transparent;
    }
</style>
<script>
    import Header from './components/Header'
    import Footer from './components/Footer'
    import Home from './pages/Home'
    import Albums from './pages/Albums'
    import AlbumDetail from './pages/AlbumDetail'
    import Artists from './pages/Artists'
    import ArtistDetail from './pages/ArtistDetail'
    import Search from './pages/Search'
    import Settings from './pages/Settings'
    import Library from './pages/Library'
    import Playlists from './pages/Playlists'
    import {mapGetters} from "vuex";
    import axios from 'axios';

    export default {
        name: "App",
        // 非常重要的行为习惯。 当前组件被销毁之前，要手动将绑定在总线上的事件解绑掉。
        beforeDestroy() {
            this.$bus.$off()
        },
        data(){
            return{
                showUpdate: false,
                playlistInitial: true
            }
        },
        created() {

            this.$store.commit('SHUFFLE_INDEX_LIST')
            myAPI.onSaveBeforeQuit((_event,arg) => {
                if (arg === 1) {
                    this.closeWindow(true)
                }else{
                    if (this.$store.state.globalShortcut) {
                        this.closeWindow(true)
                    }
                }
            })
            myAPI.onCloseFromBottom((_event) => {
                this.closeWindow(false)
            })
            myAPI.onOpenSettings((_event) => {
                if (this.$route.path !== "/Settings") {
                    this.$router.push({
                        name: "Settings",
                    });
                }
            })
        },
        components: {
            Header,
            Footer,
            Home,
            Albums,
            AlbumDetail,
            ArtistDetail,
            Artists,
            Playlists,
            Library,
            Settings,
            Search
        },
        computed: {
            playlists(){
                return this.$store.state.playlists
            },
            check(){
                return this.$store.state.check
            },
            isPlaying(){
                return this.$store.state.isPlaying
            },
            showIsExist(){
                return this.$store.state.showIsExist
            },
            ...mapGetters(['nowSong']),
        },
        watch:{
            playlists:{
                handler(newVal) {
                    if (this.playlistInitial) {
                        if (newVal !== null && newVal.length > 0) {
                            this.getPlaylistsCovers()
                        }
                    }
                },
            },
            nowSong : {
                immediate : true,
                handler(newSong) {
                    if (this.nowSong) {
                        this.getSongCover();
                    }
                },
            },
            check : {
                handler(isCheck) {
                    if (isCheck) {
                        this.getLatestVersion();
                    }
                },
            }
        },
        methods : {
            async getPlaylistsCovers() {
                this.playlistInitial = false
                for (const playlist of this.$store.state.playlists) {
                    // 根据 playlist.name 获取封面数据
                    const cover = await myAPI.getPlaylistCover(playlist.name)
                    // 创建包含列表名和封面数据的 JSON 对象
                    const playlistCover = {
                        name: playlist.name,
                        cover: cover,
                    };
                    // 将 playlistCover 对象放入 Vuex 的 playlistsCovers 数组中
                        this.$store.state.playlistsCovers.push(playlistCover);
                    }
            },
            async getLatestVersion() {
                try {
                    const x = await axios.get(`https://api.github.com/repos/Violexjj/Loop-Sound-Player/releases/latest`)
                    this.$store.state.latestVersion = x.data.tag_name.slice(1)
                    this.$store.state.latestVersionInfo = x.data.body
                    if (this.$store.state.latestVersion) {
                        if (this.$store.state.latestVersion !== this.$store.state.nowVersion) {
                            this.showUpdate = true
                            setTimeout(()=>{
                                this.showUpdate = false
                            },3000)
                        }
                    }
                } catch (error) {
                    this.$store.state.errorMessage = error.message
                    console.log('获取最新版本信息失败，错误信息：');
                    console.log(error)
                }
            },
            closeContext(){
                if (this.$store.state.showContextMenu === true) {
                    this.$store.state.showContextMenu = false
                }
            },
            emitToggle(){
                if (!this.$store.state.blockSpace) {
                    this.$bus.$emit('toggleSong')
                }
            },
            emitPrev(){
                this.$bus.$emit('playPrevSong')
            },
            emitNext(){
                this.$bus.$emit('playNextSong')
            },
            upVolume(){
                if (this.$store.state.volume >= 97) {
                    this.$store.state.volume = 100
                }else{
                    this.$store.state.volume = this.$store.state.volume + 3
                }
            },
            downVolume(){
                if (this.$store.state.volume <= 3) {
                    this.$store.state.volume = 0
                }else{
                    this.$store.state.volume = this.$store.state.volume -3
                }
            },
            emitShowVolume(){
                this.$bus.$emit('showVolume')
            },
            emitShowInfo(){
                this.$bus.$emit('showInfo')
            },
            emitShowPlaylist(){
                this.$bus.$emit('showPlaylist')
            },
            returnHome(){
                if (this.$route.path !== "/") {
                    this.$router.push({
                        name: "Home",
                    });
                }
            },
            toSettings(){
                if (this.$route.path !== "/Settings") {
                    this.$router.push({
                        name: "Settings",
                    });
                }
            },
            changeMute(){
                this.$store.state.isMute = !this.$store.state.isMute
            },
            changeMode(){
                this.$store.commit('CHANGE_MODE_AND_INDEX')
            },
            changeLyric(){
                this.$bus.$emit('showLyric')
            },
            changeQueue(){
                this.$bus.$emit('showQueue')
            },
            setSongOnTop(){
                this.$bus.$emit('songOnTop')
            },

            async getSongCover(){
                if (this.nowSong) {
                    this.$store.state.nowSongCover = await myAPI.getSongCover(this.nowSong.path,1)
                }
            },
            saveAndClose(){
                const savingState = {
                    queue : this.$store.state.queue,
                    currentIndex : this.$store.state.currentIndex,
                    nowMode : this.$store.state.nowMode,
                    volume : this.$store.state.volume,
                    isMute : this.$store.state.isMute,
                    showLyrics : this.$store.state.showLyrics,
                    toHomeAfterChangeQueue : this.$store.state.toHomeAfterChangeQueue,
                    autoHideLrc: this.$store.state.autoHideLrc,
                    showQueue : this.$store.state.showQueue,
                    lyricAlignmentMode : this.$store.state.lyricAlignmentMode,
                    highlight : this.$store.state.highlight,
                    queueModal : this.$store.state.queueModal,
                    lyricsModal : this.$store.state.lyricsModal,
                    infoModal : this.$store.state.infoModal,
                    showFormat : this.$store.state.showFormat,
                    exit : this.$store.state.exit,
                    globalShortcut : this.$store.state.globalShortcut,
                    deleteLocalFile : this.$store.state.deleteLocalFile,
                    savedCurrentPlaytime :this.$store.state.savedCurrentPlaytime,
                    lyricFont : this.$store.state.lyricFont,
                    onlineLrc: this.$store.state.onlineLrc,
                    lyricDirectory : this.$store.state.lyricDirectory,
                    biggerLyric: this.$store.state.biggerLyric,
                    showTlyric: this.$store.state.showTlyric,
                    check: this.$store.state.check,
                    blur: this.$store.state.blur,
                    bright: this.$store.state.bright
                }
                myAPI.closeWindow(savingState)
            },
            closeWindow(fromTray){
                this.$store.state.savedCurrentPlaytime = this.$store.state.currentPlayTime
                if (fromTray) {
                    this.saveAndClose()
                }else{
                    if (!this.$store.state.exit) {
                        this.saveAndClose()
                    }else{
                        myAPI.hideWindow()
                    }
                }
            },
            minimizeWindow(){
                myAPI.minimize()
            },
            maximizeWindow(){
                myAPI.maximize()
            },
            miniMode(){
                if (!this.$store.state.miniMode) {
                    myAPI.miniMode(true)
                    this.$store.state.miniMode=true
                }else{
                    myAPI.miniMode(false)
                    this.$store.state.miniMode=false
                }
            },
        }
    }
</script>


