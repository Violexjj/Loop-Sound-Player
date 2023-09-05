<template>
    <div class="unselectable" tabindex="0"
         @keydown.space="emitToggle()"
         @keyup.ctrl.left="emitPrev();setSongOnTop()"
         @keyup.ctrl.right="emitNext();setSongOnTop()">
        <div class="app">
            <div class="logo-and-control draggable-area" id="draggable-area">
                <div class="logo">
                    <img src="./assets/logo.png" alt="Logo"><span class="playerName">Loop Sound Player</span>
                </div>
                <div class="control-buttons">
                    <div class="control-button minimize minimize-button" @click="minimizeWindow">
                        <img src="./assets/minimize.png" alt="Minimize">
                    </div>
                    <div class="control-button maximize maximize-button" @click="maximizeWindow">
                        <img src="./assets/maximize.png" alt="Maximize">
                    </div>
                    <div class="control-button close close-button" @click="closeWindow">
                        <img src="./assets/closeWindow.png" alt="Close">
                    </div>
                </div>
            </div>

            <div class="background" :style="backgroundStyle"></div>
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
    </div>
</template>

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

    export default {
        name: "App",
        // 非常重要的行为习惯。 当前组件被销毁之前，要手动将绑定在总线上的事件解绑掉。
        beforeDestroy() {
            this.$bus.$off()
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
            ...mapGetters(['nowSong']),
            backgroundStyle() {
                if (this.nowSong) {
                    return {
                        backgroundImage: `url('${this.$store.state.nowSongCover}')`,
                    };
                }
                return {};
            },
        },
        watch:{
            nowSong : {
                immediate : true,
                handler(newSong) {
                    if (this.nowSong) {
                        this.getSongCover(newSong.albumCoverPath);
                    }
                },
            }
        },
        methods : {
            emitToggle(){
                this.$bus.$emit('toggleSong')
            },
            emitPrev(){
                this.$bus.$emit('playPrevSong')
            },
            emitNext(){
                console.log(4444444)
                this.$bus.$emit('playNextSong')
            },
            setSongOnTop(){
                this.$bus.$emit('songOnTop')
            },
            async getSongCover(){
                if (this.nowSong) {
                    this.$store.state.nowSongCover = await myAPI.getSongCover(this.nowSong.albumCoverPath)
                }
            },
            closeWindow(){
                const savingState = {
                    queue : this.$store.state.queue,
                    currentIndex : this.$store.state.currentIndex,
                    nowMode : this.$store.state.nowMode,
                    volume : this.$store.state.volume,
                    isMute : this.$store.state.isMute,
                    showLyrics : this.$store.state.showLyrics,
                    toHomeAfterChangeQueue : this.$store.state.toHomeAfterChangeQueue,
                }
                myAPI.closeWindow(savingState)
            },
            minimizeWindow(){
                myAPI.minimize()
            },
            maximizeWindow(){
                myAPI.maximize()
            }
        }
    }
</script>

<style>
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
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .logo img {
        width: 40px;
    }
    .playerName {
        margin-left: 10px;
        color: white;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 15px;
        padding: 4px 8px;
    }

    .control-buttons {
        display: flex;
        -webkit-app-region: no-drag;
    }

    .control-button {
        width: 24px; /* Adjust the width as needed */
        height: 24px; /* Adjust the height as needed */
        margin-left: 10px;
        cursor: pointer;
        border-radius: 10px;
        background-color: rgba(0, 0, 0, 0.2);
        transition: background-color 0.1s ease-in-out;
    }

    .close-button:hover {
        background-color: red; /* Change to the desired hover color */
    }
    .maximize-button:hover,
    .minimize-button:hover{
        background-color: rgba(255, 255, 255, 0.4);
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
        height: 97vh;
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
        background-size: cover;
        filter: blur(40px);
        transition: background-image 0.2s;
    }
    .background::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0); /* 半透明黑色 */
    }

    /* 在这里设置 header 的样式 */
    .header {
        background-color: rgba(0, 0, 0, 0.6); /* 半透明黑色背景 */
        border-radius: 100px; /* 圆角 */
        padding: 10px; /* 调整内边距以使内容与圆角保持一致 */
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
        background-color: rgba(0, 0, 0, 0.15); /* 半透明黑色背景 */
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
        transform: translateY(100%);
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
