<template>
    <div class="unselectable winHidden"
         :style="{fontFamily:pFont}" tabindex="0"

         @click="closeContext()"
         @blur="closeContext"
    >

        <div class="app" v-show="!this.$store.state.miniMode">
            <div v-if="!focusMode" class="logo-and-control draggable-area" id="draggable-area">
                <!--                logo部分-->
                <div class="logo">
                    <img src="./assets/logoImg.png" alt="Logo" class="logo-image"
                         :class="{ breathing: isPlaying }">
                    <span class="playerName">Sonorbit</span>
                </div>
                <!--                歌曲信息部分-->
                <div class="songInfo">
                    <span v-if="this.$route.path === '/SongsInPlaylist'" class="songInfoText">{{"当前播放列表："+this.$store.state.selectedPlaylistName}}</span>

                    <span v-if="this.$route.path === '/SongsInFolder'" class="songInfoText">{{"当前文件夹："+this.$store.state.selectedFolderPath}}</span>

                    <span v-if="this.$route.path !== '/SongsInPlaylist' && this.$route.path !== '/SongsInFolder' && this.$store.state.playNextSongs" class="songInfoText">
                        {{"临时播放："+nowSongTitle+" - "+nowSongArtist}}
                    </span>

                    <span v-if="this.$route.path !== '/SongsInPlaylist' && this.$route.path !== '/SongsInFolder'  && !this.$store.state.playNextSongs" class="songInfoText">
                        {{"正在播放："+nowSongTitle+" - "+nowSongArtist+"（"+(this.$store.state.currentIndex+1)+" / "+(this.$store.state.queue.length)+"）"}}
                    </span>

                </div>
                <!--                控制按钮部分-->
                <div class="control-buttons">
                    <!--   占位                 -->
                    <div class="control-buttons-nodrag" style="margin-left: auto;"></div>
                    <!--                    迷你模式-->
                    <div class="control-button minimize minimize-button" @click="miniMode" title="迷你模式">
                        <img src="./assets/mini.png" alt="Minimize">
                    </div>
                    <!--                    最小化-->
                    <div class="control-button minimize minimize-button" @click="minimizeWindow" title="最小化">
                        <img src="./assets/minimize.png" alt="Minimize">
                    </div>
                    <!--                    最大化-->
                    <div class="control-button maximize maximize-button" @contextmenu="maximizeWindow(2)" @click="maximizeWindow(1)" title="左键最大化，右键全屏">
                        <img src="./assets/maximize.png" alt="Maximize">
                    </div>
                    <!--                    关闭-->
                    <div class="control-button close close-button" @click="closeWindow(false)" title="关闭">
                        <img src="./assets/closeWindow.png" alt="Close">
                    </div>


                </div>
            </div>

<!--            全局背景-->
            <div class="background">
                <img :src="this.$store.state.nowSongCover"  ref="backCover" alt="Background Image" class="background-image"
                     :style="{ filter: 'blur(' + $store.state.blur + 'px) saturate(120%) brightness(' + $store.state.bright + '%)' }">
            </div>


            <header v-if="!focusMode" class="header">
                <Header></Header>
            </header>

            <main :class="{
                                      'main-with-background': true,
                                      'route-container': true,
                                      'focusModeMain': focusMode,
                                      'noFocusModeMain': !focusMode
                                    }">
                <div class="showBlackAndRoute">
                    <transition name="slide-up" mode="out-in">
                        <!-- 使用 v-if 条件渲染默认展示 Home 组件 -->
                        <router-view v-if="$route.name === 'Home' || $route.name === undefined" :key="$route.path"></router-view>
                        <!-- 使用 v-else 渲染其他路由组件 -->
                        <router-view v-else></router-view>
                    </transition>
                </div>
                <div v-if="focusMode && focusMode2" class="buttons-container">
                    <div class="container" >
                        <!-- 歌词按钮 -->
                        <div class="control-button-2 lyric-button" @click="changeShowLyric" :class="{ 'active': showLyric }">
                            <div class="lyrics-image"></div>
                        </div>
                        <!-- 队列按钮 -->
                        <div class="control-button-2 queue-button" @click="changeShowQueue()" :class="{ 'active': showQueue }">
                            <div class="queue-image"></div>
                        </div>
                        <!-- 上一曲按钮 -->
                        <div class="control-button-2" @click="playLast(); triggerEvent1()">
                            <div class="prev-image-2"></div>
                        </div>
                        <!-- 暂停播放按钮 -->
                        <div class="control-button-2 large" @click="togglePlay">
                            <div
                                    v-show="!this.$store.state.isPlaying"
                                    class="pause-play-image-2"
                            ></div>
                            <div
                                    v-show="this.$store.state.isPlaying"
                                    class="pause-play-image2-2"
                            ></div>
                        </div>
                        <!-- 下一曲按钮 -->
                        <div class="control-button-2" @click="playNext(); triggerEvent1()">
                            <div class="next-image-2"></div>
                        </div>
                        <!-- 播放模式按钮 -->
                        <div class="control-button-2" @click="changePlayMode">
                            <div class="rotate-image" v-show="playMode === 0"></div>
                            <div class="random-image" v-show="playMode === 1"></div>
                            <div class="onesong-image" v-show="playMode === 2"></div>
                        </div>
                        <!-- 音量按钮 -->
                        <div class="control-button-2" @click="changeMute" @wheel="adjustVolumeWithWheel">
                            <div v-show="!this.$store.state.isMute && this.volume !== 0" class="volume-image"></div>
                            <div v-show="this.$store.state.isMute || this.volume === 0" class="noVolume-image"></div>
                        </div>
                    </div>
                </div>

                <div v-if="$store.state.focusMode && focusMode2" class="slider-time">
                    <span  class="played-time">{{ playedTime?playedTime:"00:00" }}</span>
                    <vue-slider
                            v-model="currentProgress"
                            :min="0"
                            :max="100"
                            :interval="0.1"
                            :dot-size="20"
                            :height="15"
                            style="min-width: 280px;width: 90%"
                            class="slider"
                            :duration="0"
                            :drag-on-click="true"
                            :useKeyboard="false"
                            :lazy="true"
                            :tooltip="'none'"
                    ></vue-slider>
                    <span class="played-time">{{ nowSongDuration?nowSongDuration:"00:00" }}</span>

                </div>

            </main>

            <!--沉浸模式的拖拽区域-->
            <div class="focus-drag" v-if="focusMode"></div>

            <footer v-show="!focusMode" class="footer">
                <Footer></Footer>
            </footer>
        </div>

        <!--        迷你模式-->
        <div  v-show="this.$store.state.miniMode" class="miniMode">
            <!--            背景-->
            <div class="background">
                <img :src="this.$store.state.nowSongCover" alt="Background Image" style="filter: blur(30px)" class="background-image">
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
        <div v-show="showUpdateError" class="showIsExist">
            {{ `获取新版本失败，请前往设置查看错误信息。` }}
        </div>
        <!--        显示文件扫描情况-->
        <div v-show="showReboot" class="showReboot">
            {{info}}
        </div>
        <div v-show="showVolumeValue" class="volume-value">
            {{ `音量 :  ${volume}` }}
        </div>
    </div>
</template>
<style>
    .played-time{
        font-size: 13px;
        letter-spacing: 1px;
    }
    .slider-time{
        margin-top: 10px;
        gap: 15px;
        width: 90%;
        margin-left: 5%;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 20px;
    }
    .lyrics-image {
        width: 60%;
        height: 60%;
        background-image: url('./assets/lrc.png');
        background-size: contain;
        background-repeat: no-repeat;
    }
    .lyric-button.active{
        background-color: rgba(255, 255, 255, 0.2);
    }
    .queue-button.active {
        background-color: rgba(255, 255, 255, 0.2);
    }
    .queue-image{
        width: 80%;
        height: 80%;
        background-image: url('./assets/queue.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .volume-image {
        width: 60%;
        height: 60%;
        background-image: url('./assets/volume.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .noVolume-image {
        width: 60%;
        height: 60%;
        background-image: url('./assets/noVolume.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .volume-value {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 0 16px;
        padding-top: 8px;
        padding-bottom: 10px;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        color: white;
        border-radius: 20px;
        font-size: 16px;
        z-index: 1000;
    }
    .random-image {
        width: 70%;
        height: 70%;
        background-image: url('./assets/random.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .rotate-image {
        width: 100%;
        height: 100%;
        background-image: url('./assets/rotate.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .onesong-image {
        width: 80%;
        height: 80%;
        background-image: url('./assets/onesong.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .slider:hover{
        cursor: pointer;
    }
    .buttons-container{
        margin-top: 15px;
        justify-content: center;
        display: flex;
    }
    .container{

        align-items: center;
        justify-content: center;
        display: flex;
        gap: 10px
    }

    .pause-play-image-2 {
        width: 80%;
        height: 80%;
        background-image: url('./assets/play.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .pause-play-image2-2 {
        width: 80%;
        height: 80%;
        background-image: url('./assets/pause.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .next-image-2 {
        width: 60%;
        height: 60%;
        background-image: url('./assets/next.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .prev-image-2 {
        width: 60%;
        height: 60%;
        background-image: url('./assets/prev.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .control-button-2 {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background-color: rgba(0, 0, 0, 0.3);
        color: white;
        border-radius: 50%;
        cursor: pointer;
        margin: 0 4px;
        transition: 0.2s ease; /* 添加过渡效果 */
    }
    .large {
        width: 50px;
        height: 50px;
        font-size: 24px;
    }
    .control-button-2:hover{
        background-color: rgba(255, 255, 255, 0.1);
    }
    .control-button-2:active{
        transform: scale(0.85);
    }
    .showReboot {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 8px 16px;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        color: white;
        border-radius: 20px;
        font-size: 16px;
        z-index: 1000;
    }
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
    .noDrag:active {
        transform: scale(0.85);
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
        transition: 0.2s ease; /* 添加过渡效果 */
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
        transition: 0.2s ease; /* 添加过渡效果 */
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
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
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
    .focus-drag{
        width: 100%;
        height: 27px;
        position: absolute;
        top: 0px;
        left: 0px;
        background-color: rgba(0, 0, 0, 0);
        -webkit-app-region: drag;
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
        letter-spacing: 1px;
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
        border-radius: 100px;
        transition: 0.2s;
        background-color: rgba(0, 0, 0, 0.2);
        -webkit-app-region: no-drag;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .close-button:hover {
        background-color: red; /* Change to the desired hover color */
    }
    .maximize-button:hover,
    .minimize-button:hover{
        background-color: rgba(255, 255, 255, 0.2);
    }

    .control-button img {
        width: 90%;
        height: 90%;
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
        user-drag: none;
        user-select: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        overflow: hidden; /* 确保图片不溢出容器 */
        background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色 */
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

    .noFocusModeMain {
        flex: 1 1 auto;
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .focusModeMain{
        flex: 1 1 auto;
        margin-top: 5px;
    }

    /* 在这里设置 footer 的样式 */
    .footer {
        background-color: rgba(0, 0, 0, 0.15); /* 半透明灰色背景 */
        border-radius: 100px; /* 圆角 */
        padding: 7px; /* 调整内边距以使内容与圆角保持一致 */
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
        overflow: auto; /* 禁止滚动 */
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
    import Folders from './pages/Folders'
    import SongsInFolder from './pages/SongsInFolder'
    import {mapGetters} from "vuex";
    import axios from 'axios';
    import VueSlider from 'vue-slider-component';
    import 'vue-slider-component/theme/default.css'

    export default {
        name: "App",
        // 非常重要的行为习惯。 当前组件被销毁之前，要手动将绑定在总线上的事件解绑掉。
        beforeDestroy() {
            this.$bus.$off()
        },
        mounted() {
            this.$bus.$on('showVolumeFocus',this.emitShowVolume)
            this.$bus.$on('showNoTarget',this.showNoTarget)
        },
        data(){
            return{
                showUpdate: false,
                showUpdateError: false,
                playlistInitial: true,
                info : "",
                showReboot : false,
                isNextButtonDisabled: false,
                isPrevButtonDisabled: false,
                showVolumeValue: false,
            }
        },
        created() {
            myAPI.onCloseDeskTopLyric((_event) => {
                this.$store.state.deckTopLyric =false
            })
            myAPI.onFocusMode((_event) => {
                this.outFocus()
            })
            myAPI.onSearch((_event) => {
                this.startSearch()
            })
            myAPI.onShowQueue((_event) => {
                this.changeShowQueue()
            })
            myAPI.onReturnHome((_event) => {
                this.returnHome()
            })
            myAPI.onShowLyric((_event) => {
                this.changeLyric()
            })
            myAPI.onShowPlaylists((_event) => {
                this.emitShowPlaylist()
            })
            myAPI.onShowInfo((_event) => {
                this.emitShowInfo()
            })
            myAPI.onErrorFile((_event) => {
                this.info = "扫描失败，请检查文件"
                setTimeout(()=>{
                    this.showReboot = false
                },2000)
            })
            myAPI.onFinishScan((_event) => {
                this.finishScan(true)
            })
            myAPI.onFinishScanErrorMix((_event) => {
                this.finishScan(false)
            })
            // 接收外部拖拽文件添加到音乐库
            document.addEventListener('dragover', (event) => {
                event.preventDefault();
            });

            document.addEventListener('drop', (event) => {
                event.preventDefault();
                this.info = "等待扫描中"
                this.showReboot = true
                const filePaths = []
                Array.from(event.dataTransfer.files).forEach((file) => {
                    filePaths.push(file.path);
                });
                myAPI.dragFile(filePaths)
            });

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
            VueSlider,
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
            Search,
            Folders,
            SongsInFolder
        },
        computed: {
            pFont(){
                return this.$store.state.pFont
            },
            nowSongTitle(){
                return this.$store.getters.nowSong !== null ? this.$store.getters.nowSong.title : "无"
            },
            nowSongArtist(){
                return this.$store.getters.nowSong !== null ? this.$store.getters.nowSong.artist : "无"
            },
            focusMode2(){
                return this.$store.state.focusMode2
            },
            playedTime() {
                if (this.nowSong) {
                    const totalDurationInMilliseconds = this.getDurationInMilliseconds(this.nowSong.duration);
                    const playedDurationInMilliseconds = (this.currentProgress / 100) * totalDurationInMilliseconds;
                    this.$store.state.currentPlayTime = playedDurationInMilliseconds / 1000
                    return this.formatTime(playedDurationInMilliseconds);
                }else{
                    return false
                }

            },
            nowSongDuration() {
                if (this.nowSong) {
                    return this.nowSong.duration.substring(0, 5);
                }else{
                    return false
                }
            },
            showLyric(){
                return this.$store.state.showLyrics;
            },
            showQueue() {
                return this.$store.state.showQueue;
            },
            volume: {
                get() {
                    return this.$store.state.volume;
                },
                set(newVolume) {
                    this.$store.state.volume = newVolume
                }
            },
            playMode(){
                return this.$store.state.nowMode
            },
            nextSongs(){
                return this.$store.state.nextSongs
            },
            nextSongsIndex(){
                return this.$store.state.nextSongsIndex
            },
            currentProgress:{
                get() {
                    return this.$store.state.currentProgress;
                },
                set(value) {
                    this.$bus.$emit('changeProgress', value);
                },
            },
            focusMode(){
                return this.$store.state.focusMode
            },
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
            '$store.state.songs':{
                deep: true,
                handler(newVal){
                    if (this.$store.state.songs.songs.length !== 0) {
                        const Folders = [];
                        this.$store.state.songs.songs.forEach(song => {
                            const folderPath = this.getFolderPath(song.path);
                            const existingIndex = Folders.findIndex(folder => folder.path === folderPath);
                            if (existingIndex !== -1) {
                                Folders[existingIndex].songs.push(song);
                            } else {
                                const folderName = this.getFolderName(folderPath);
                                const newFolder = {
                                    path: folderPath,
                                    name: folderName,
                                    songs: [song]
                                };
                                Folders.push(newFolder);
                            }
                        });
                        this.$store.state.folders = Folders
                    }else{
                        this.$store.state.folders = []
                    }
                }
            },
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
            },
        },
        methods : {
            showNoTarget(){
                this.info = "定位失败：列表中无当前播放歌曲"
                this.showReboot = true
                setTimeout(()=>{
                    this.showReboot = false
                },2000)
            },
            padTime(time) {
                if (isNaN(time.toString().padStart(2, '0'))) {
                    return "00"
                }else{
                    return time.toString().padStart(2, '0');
                }

            },
            getDurationInMilliseconds(durationString) {
                const parts = durationString.split(':');
                const minutes = parseInt(parts[0]);
                const seconds = parseInt(parts[1]);
                const millisecond = parseInt(parts[2]);
                return minutes * 60000 + seconds *1000+millisecond;
            },

            formatTime(milliseconds) {
                const minutes = Math.floor(milliseconds / 60000);
                const seconds = Math.floor((milliseconds % 60000) / 1000);
                return `${this.padTime(minutes)}:${this.padTime(seconds)}`;
            },

            outFocus(){
                if (this.focusMode) {
                    this.$store.state.focusMode = false
                }else{
                    setTimeout(()=>{
                        if (this.$route.path !== "/") {
                            this.$router.push({
                                name: "Home",
                            });
                        }
                        this.$store.state.focusMode = true
                    },5)
                }
            },
            changeShowLyric(){
                const showQueue = this.$store.state.showQueue
                this.$store.state.showInfo = !this.$store.state.showInfo
                this.$store.state.showLyrics = !this.$store.state.showLyrics
                if (showQueue) {
                    this.$store.state.showQueue = !this.$store.state.showQueue
                }
                setTimeout(()=>{
                    this.$store.state.showInfo = !this.$store.state.showInfo
                    if (showQueue) {
                        this.$store.state.showQueue = !this.$store.state.showQueue
                    }
                },500)
            },
            changeShowQueue(){
                const showLyric = this.$store.state.showLyrics
                this.$store.state.showInfo = !this.$store.state.showInfo
                if (showLyric) {
                    this.$store.state.showLyrics = !this.$store.state.showLyrics
                }
                this.$store.state.showQueue = !this.$store.state.showQueue
                setTimeout(()=>{
                    this.$store.state.showInfo = !this.$store.state.showInfo
                    if (showLyric) {
                        this.$store.state.showLyrics = !this.$store.state.showLyrics
                    }
                },500)
            },
            changePlayMode() {
                this.$store.commit('CHANGE_MODE_AND_INDEX')
            },
            togglePlay() {
                this.$store.dispatch('togglePlay');
            },
            playNext() {
                if (!this.isNextButtonDisabled) {
                    this.isNextButtonDisabled = true;
                    if (this.nextSongs.length !== 0 && this.nextSongsIndex < this.nextSongs.length-1) {
                        this.$store.state.nextSongsIndex += 1
                        if (this.nextSongsIndex === 0) {
                            this.$store.state.playNextSongs = true
                        }
                        this.$store.state.isPlaying = true
                    }else{
                        if (this.nextSongs.length !== 0 && this.nextSongsIndex === this.nextSongs.length - 1) {
                            this.$store.state.nextSongsIndex = -1
                            this.$store.state.nextSongs = []
                            this.$store.state.playNextSongs = false
                        }
                        this.$store.dispatch('nextSong');
                    }
                    setTimeout(() => {
                        this.isNextButtonDisabled = false;
                    }, 500);
                }

            },
            triggerEvent1() {
                this.$bus.$emit('songOnTop')
            },
            playLast() {
                if (!this.isPrevButtonDisabled) {
                    this.isPrevButtonDisabled = true;

                    if (this.nextSongs.length !== 0 && this.nextSongsIndex >= 0) {
                        if (this.$store.state.nextSongsIndex - 1 < 0) {
                            this.$store.state.playNextSongs =false
                            this.$store.state.nextSongsIndex = -1
                        }else{
                            this.$store.state.nextSongsIndex -= 1
                        }
                        this.$store.state.isPlaying = true
                    }else{
                        this.$store.dispatch('prevSong');
                    }

                    setTimeout(() => {
                        this.isPrevButtonDisabled = false;
                    }, 500);
                }
            },
            finishScan(success){
                if (success) {
                    this.info = "扫描结束，音乐库已更新，即将跳转至音乐库"
                    myAPI.getAllSongs().then(songs => {
                        this.$store.commit('SET_SONGS', songs);
                    });
                    setTimeout(()=>{
                        this.showReboot = false
                        if (this.$route.path !== "/Library") {
                            this.$router.push({
                                name: "Library",
                            });
                        }
                    },2000)
                }else{
                    this.info = "扫描失败，请不要同时扫描文件和文件夹"
                    setTimeout(()=>{
                        this.showReboot = false
                    },2000)
                }


            },
            getFolderName(folderPath) {
                return folderPath.substring(folderPath.lastIndexOf('\\') + 1);
            },
            getFolderPath(filePath) {
                return filePath.substring(0, filePath.lastIndexOf('\\'));
            },
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
                    // this.$store.state.latestVersion = "0.9.1"
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
                    this.showUpdateError = true
                    setTimeout(()=>{
                        this.showUpdateError = false
                    },3000)
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
                if (this.focusMode) {
                    this.showVolumeValue = true;
                    clearTimeout(this.volumeValueTimeout);
                    this.volumeValueTimeout = setTimeout(() => {
                        this.showVolumeValue = false;
                    }, 1000);
                }else{
                    this.$bus.$emit('showVolume')
                }
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
            startSearch(){
                this.$bus.$emit('startSearch')
            },
            changeMute(){
                this.$store.state.isMute = !this.$store.state.isMute
            },
            adjustVolumeWithWheel(event) {
                event.preventDefault(); // 阻止滚轮默认行为

                const delta = -Math.sign(event.deltaY); // 获取滚轮滚动方向，1 表示上滚，-1 表示下滚
                const step = 3; // 调整音量的步长

                let newVolume = this.volume + delta * step;
                newVolume = Math.max(0, Math.min(100, newVolume)); // 确保音量在合法范围内

                this.$store.commit('SET_VOLUME', newVolume);
                this.showVolumeValue = true;

                clearTimeout(this.volumeValueTimeout);
                this.volumeValueTimeout = setTimeout(() => {
                    this.showVolumeValue = false;
                }, 1000); // 1秒后隐藏
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
                    this.$bus.$emit("changeCover",true)
                    // if (this.$refs.backCover) {
                    //     this.$refs.backCover.style.opacity = 0.5
                    // }
                    const nowSongCover = await myAPI.getSongCover(this.nowSong.path,1)

                    setTimeout(()=>{
                        this.$store.state.nowSongCover = nowSongCover
                        this.$bus.$emit("changeCover", false)
                        // if (this.$refs.backCover) {
                        //     this.$refs.backCover.style.opacity = 1
                        // }
                    },500)

                    if ('mediaSession' in navigator) {
                        navigator.mediaSession.metadata = new MediaMetadata({
                            title: this.$store.getters.nowSong.title,
                            artist: this.$store.getters.nowSong.artist,
                            album: this.$store.getters.nowSong.album,
                            artwork: [
                                { src: nowSongCover, sizes: '512x512', type: 'image/png' }
                            ]
                        });
                    }
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
                    lyricFont2 : this.$store.state.lyricFont2,
                    onlineLrc: this.$store.state.onlineLrc,
                    lyricDirectory : this.$store.state.lyricDirectory,
                    biggerLyric: this.$store.state.biggerLyric,
                    showTlyric: this.$store.state.showTlyric,
                    check: this.$store.state.check,
                    blur: this.$store.state.blur,
                    bright: this.$store.state.bright,
                    showAlbums: this.$store.state.showAlbums,
                    showArtists: this.$store.state.showArtists,
                    showFolders: this.$store.state.showFolders,
                    otherBlur: this.$store.state.otherBlur,
                    shortcuts: this.$store.state.shortcuts,
                    dLyricColor: this.$store.state.dLyricColor,
                    usePureColor: this.$store.state.usePureColor,
                    dLyricColorPure: this.$store.state.dLyricColorPure,
                    useEQ: this.$store.state.useEQ,
                    EQParam: this.$store.state.EQParam,
                    boldLrc: this.$store.state.boldLrc,
                    showSpectrum: this.$store.state.showSpectrum,
                    matchBlank: this.$store.state.matchBlank,
                    pFont: this.$store.state.pFont,
                    dFont: this.$store.state.dFont
                }
                myAPI.closeWindow(savingState)
            },
            closeWindow(fromTray){
                if (this.$store.state.focusMode) {
                    this.$store.state.focusMode = false
                }else{
                    if (this.$store.state.playNextSongs) {
                        this.$store.state.savedCurrentPlaytime = 0
                    }else{
                        this.$store.state.savedCurrentPlaytime = this.$store.state.currentPlayTime
                    }

                    if (fromTray) {
                        this.saveAndClose()
                    }else{
                        if (!this.$store.state.exit) {
                            this.saveAndClose()
                        }else{
                            myAPI.hideWindow()
                        }
                    }
                }

            },
            minimizeWindow(){
                myAPI.minimize()
            },
            maximizeWindow(flag){
                myAPI.maximize(flag)
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


