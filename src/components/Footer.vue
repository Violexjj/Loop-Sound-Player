<template>
    <div class="container unselectable">
        <div class="image-and-buttons">
            <div class="image-container">
                <!-- 封面图片 -->
                <div v-if="nowSong" class="image-wrapper">
                    <img
                            v-if="this.$store.state.nowSongCover"
                            :src="this.$store.state.nowSongCover"
                            alt="Image"
                            ref="songImage"
                            class="image"
                            :style="{ animationPlayState: this.isPlaying ? 'running' : 'paused' }"
                            @click="toHome"
                    />
                </div>
            </div>
            <div class="center-buttons">
                <!-- 信息按钮 -->
                <div class="control-button" @click="showMoreInfo(0,null)" title="歌曲信息">
                    <div class="info-image" ></div>
                </div>
                <!-- 播放模式按钮 -->
                <div class="control-button" @click="changePlayMode">
                    <div class="rotate-image" v-show="playMode === 0" title="队列循环"></div>
                    <div class="random-image" v-show="playMode === 1" title="无序循环"></div>
                    <div class="onesong-image" v-show="playMode === 2" title="单曲循环"></div>
                </div>
                <!-- 上一曲按钮 -->
                <div class="control-button" @click="playLast(); triggerEvent1()" title="上一首">
                    <div class="prev-image"></div>
                </div>
                <!-- 暂停播放按钮 -->
                <div class="control-button large" @click="togglePlay" title="暂停/播放">
                    <div
                            v-show="!this.$store.state.isPlaying"
                            class="pause-play-image"
                    ></div>
                    <div
                            v-show="this.$store.state.isPlaying"
                            class="pause-play-image2"
                    ></div>
                </div>
                <!-- 下一曲按钮 -->
                <div class="control-button" @click="playNext(); triggerEvent1()" title="下一首">
                    <div class="next-image"></div>
                </div>
            </div>

            <HowlerPlayer></HowlerPlayer>

        </div>
        <!-- 进度条 -->

        <div class="progress-bar-container">
            <vue-slider
                    v-model="currentProgress"
                    :min="0"
                    :max="100"
                    :interval="0.1"
                    :dot-size="20"
                    :height="15"
                    style="width: 100%;margin-top: 25px"
                    class="slider"
                    :duration="0.18"
                    :lazy="true"
                    :tooltip="'none'"
            >

            </vue-slider>
            <div class="time-labels">
                <span  class="played-time-footer">{{ playedTime?playedTime:"00:00" }}</span>
                <span class="total-time-footer">{{ nowSongDuration?nowSongDuration:"00:00" }}</span>
            </div>
        </div>


        <!--        ------------------------------------------------------------------------------------------->
        <div class="right-controls">
            <!-- 歌词按钮 -->
            <div class="control-button lyric-button" @click="changeShowLyric" :class="{ 'active': showLyric }" title="显示/隐藏歌词">
                <div class="lyrics-image"></div>
            </div>
            <!-- 队列按钮 -->
            <div class="control-button queue-button" @click="changeShowQueue()" :class="{ 'active': showQueue }" title="显示/隐藏队列">
                <div class="queue-image"></div>
            </div>
            <!-- 播放列表按钮 -->
            <div class="control-button" @click="showPlaylistModal = true" title="切换播放列表">
                <div class="playlist-image"></div>
            </div>

            <!-- 音量按钮 -->
            <div class="control-button" @click="changeMute" @wheel="adjustVolumeWithWheel">
                <div v-show="!this.$store.state.isMute && this.volume !== 0"  class="volume-image"></div>
                <div v-show="this.$store.state.isMute || this.volume === 0" class="noVolume-image"></div>
            </div>
            <vue-slider
                    v-model="$store.state.volume"
                    :min="0"
                    :max="100"
                    :interval="1"
                    :dot-size="12"
                    :height="10"
                    :duration="0.2"
                    style="width:100px;margin-left: 7.5px;margin-right: 5px"
            ></vue-slider>
            <div v-show="showVolumeValue" class="volume-value">
                {{ `音量 :  ${volume}` }}
            </div>
        </div>

        <!-- 展示播放列表 -->
        <div v-if="showPlaylistModal" class="modal">
            <div class="playlist-panel">
                <!-- 关闭按钮 -->
                <div class="modal-close" @click="showPlaylistModal = false">
                    <div class="close-button close-image"></div>
                </div>
                <!-- 选项列表内容 -->
                <div class="playlist-options">
                    <div v-for="playlist in playlists" :key="playlist.name" class="playlist-option"
                         @click="openPlaylist(playlist.name)">
                        {{ playlist.name }}
                    </div>
                </div>
            </div>
        </div>
        <!--       音频文件信息 -------------------------------------------------------------------------------->
        <div class="info-dialog-container" v-if="showInfoDialog">
            <div class="overlay" >
                <!--        展示信息框-->
                <div class="info-dialog">
                    <!-- 关闭按钮 -->
                    <div class="modal-close" @click="closeDialogInfo">
                        <div class="close-button close-image"></div>
                    </div>
                    <div class="info-content">
                        <!-- 歌曲封面 -->
                        <div class="cover-container">
                            <img :src="this.songInfo.cover" alt="Cover" class="cover-image" />
                            <br>
                        </div>
                        <!-- 歌曲详细信息 -->
                        <div class="info-details">
                            <table style="white-space: nowrap">
                                <tr>
                                    <td><div class="info-label">网易云ID：</div></td>
                                    <td><div class="info-value">{{ this.netId }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">标题：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.title }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">艺术家：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.artist }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">专辑：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.album }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">时长：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.duration }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">比特率：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.bitrate }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">采样率：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.sampleRate }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">位深：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.bitsPerSample }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">格式：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.moreInfo.format==="MPEG"?"MP3":this.songInfo.moreInfo.format }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">文件大小：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.fileSize }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">年份：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.moreInfo.year }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">音轨号：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.moreInfo.trackNumber }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">流派：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.moreInfo.genre[0] }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">注释：</div></td>
                                    <td><div class="info-value" :title=this.songInfo.moreInfo.comment[0]>{{ this.songInfo.moreInfo.comment[0] }}</div></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>

    .info-dialog-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }
    .info-dialog {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60%;
        height: 55%;
        background-color: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2;
    }

    .info-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }

    .cover-container {
        margin-top: 15px;
        width: 50%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .cover-image {
        max-width: 80%;
        max-height: 80%;
        object-fit: contain;
        border-radius: 10px;
    }

    .info-details {
        width: 50%;
        height: 100%;
        margin-left: 30px;
        margin-top: 20px;
        overflow: hidden;
    }

    .info-label {
        margin-bottom: 5px;
        font-weight: bold;
        margin-right: 10px;
    }

    .info-value {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    /*    --------------------------------------------------------------------------------------------*/
    .progress-bar-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 100%;
    }
    .slider:hover{
        cursor: pointer;
    }
    .time-labels {
        padding-top: 6px;
        display: flex;
        justify-content: space-between;
        width: 100%;
        font-size: 13px;
        color: white;
    }

    .played-time-footer {
        padding-left: 10px;
        letter-spacing: 1px;
    }

    .total-time-footer {
        padding-right: 8px;
        letter-spacing: 1px;
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

    .right-controls {
        display: flex;
        align-items: center;
    }

    .info-image {
        width: 60%;
        height: 60%;
        background-image: url('../assets/info.png');
        background-size: contain;
        background-repeat: no-repeat;
    }



    .lyrics-image {
        width: 60%;
        height: 60%;
        background-image: url('../assets/lrc.png');
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
        background-image: url('../assets/queue.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }

    .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .image-and-buttons {
        display: flex;
    }

    @keyframes rotateAnimation {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    .image-container {
        margin-left: 5px;
        width: 55px;
        height: 55px;
        border-radius: 100px;
        overflow: hidden;
        margin-right: 5px;
        transition: 0.3s;
    }
    .image-container:hover{
        filter: brightness(70%);
    }

    .image-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        cursor: pointer;
        animation: rotateAnimation 30s linear infinite;
    }
    .image:hover {
        filter:brightness(50%);
    }

    .center-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .control-button {
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
        transition: background-color 0.2s ease; /* 添加过渡效果 */
    }
    .control-button:hover{
        background-color: rgba(255, 255, 255, 0.1);
    }

    .large {
        width: 50px;
        height: 50px;
        font-size: 24px;
    }
    .pause-play-image {
        width: 80%;
        height: 80%;
        background-image: url('../assets/play.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .pause-play-image2 {
        width: 80%;
        height: 80%;
        background-image: url('../assets/pause.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .next-image {
        width: 60%;
        height: 60%;
        background-image: url('../assets/next.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .prev-image {
        width: 60%;
        height: 60%;
        background-image: url('../assets/prev.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .random-image {
        width: 70%;
        height: 70%;
        background-image: url('../assets/random.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .rotate-image {
        width: 100%;
        height: 100%;
        background-image: url('../assets/rotate.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .onesong-image {
        width: 80%;
        height: 80%;
        background-image: url('../assets/onesong.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .playlist-image {
        width: 80%;
        height: 80%;
        background-image: url('../assets/playlist.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }

    .close-image {
        width: 100%;
        height: 100%;
        background-image: url('../assets/close.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .volume-image {
        width: 60%;
        height: 60%;
        background-image: url('../assets/volume.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .noVolume-image {
        width: 60%;
        height: 60%;
        background-image: url('../assets/noVolume.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000; /* 确保在最上层 */
    }
    .playlist-panel {
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
        padding: 10px;
        width: 80%;
        max-width: 400px;
        position: relative;
        backdrop-filter: blur(20px);
    }

    .playlist-options {
        margin-top: 40px;
    }
    .playlist-option{
        font-weight: bold;
        padding: 10px;
        border-radius: 10px;
    }
    .playlist-option:hover{
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
    }

    .modal-close {
        position: absolute;
        top: 10px;
        right: 10px;
        color: white;
        cursor: pointer;
        border-color: white;
        z-index: 1001;
    }
    .close-button:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
    .close-button {
        width: 30px;
        height: 30px;
        border: 2px solid white; /* 设置边框为白色 */
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        color: white;
    }
</style>


<script>
    import { mix3} from "@/mixin";
    import {mapMutations, mapGetters,mapState} from "vuex"
    import HowlerPlayer from './HowlerPlayer'
    import VueSlider from 'vue-slider-component';
    import 'vue-slider-component/theme/default.css'



    export default {
        name: "Footer",
        mixins: [mix3],
        created() {
            // 监听来自主进程的暂停/播放请求
            myAPI.onPlayLast((_event) => {
                this.playLast()
                this.$bus.$emit('songOnTop')
            })
            myAPI.onToggle((_event) => {
                this.togglePlay()
            })
            myAPI.onPlayNext((_event) => {
                this.playNext()
                this.$bus.$emit('songOnTop')
            })
            myAPI.onDownVolume((_event) => {
                if (this.$store.state.volume <= 3) {
                    this.$store.state.volume = 0
                }else{
                    this.$store.state.volume = this.$store.state.volume -3
                }
                this.$bus.$emit('showVolume')
            })
            myAPI.onUpVolume((_event) => {
                if (this.$store.state.volume >= 97) {
                    this.$store.state.volume = 100
                }else{
                    this.$store.state.volume = this.$store.state.volume + 3
                }
                this.$bus.$emit('showVolume')
            })
            myAPI.onChangeMute((_event) => {
                this.$store.state.isMute = !this.$store.state.isMute
            })
            myAPI.onLoop((_event) => {
                this.$store.state.nowMode = 0
            })
            myAPI.onRandom((_event) => {
                this.$store.state.nowMode = 1
            })
            myAPI.onOne((_event) => {
                this.$store.state.nowMode = 2
            })
            //----------------------------------------------
            myAPI.onPlayLastG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                this.playLast()
                this.$bus.$emit('songOnTop')
            })
            myAPI.onToggleG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                this.togglePlay()
            })
            myAPI.onPlayNextG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                this.playNext()
                this.$bus.$emit('songOnTop')
            })
            myAPI.onDownVolumeG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                if (this.$store.state.volume <= 3) {
                    this.$store.state.volume = 0
                }else{
                    this.$store.state.volume = this.$store.state.volume -3
                }
                if (this.$store.state.focusMode) {
                    this.$bus.$emit('showVolumeFocus')
                }else{
                    this.$bus.$emit('showVolume')
                }
            })
            myAPI.onUpVolumeG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                if (this.$store.state.volume >= 97) {
                    this.$store.state.volume = 100
                }else{
                    this.$store.state.volume = this.$store.state.volume + 3
                }
                if (this.$store.state.focusMode) {
                    this.$bus.$emit('showVolumeFocus')
                }else{
                    this.$bus.$emit('showVolume')
                }
            })
            myAPI.onChangeMuteG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                this.$store.state.isMute = !this.$store.state.isMute
            })
            myAPI.onChangeModeG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                this.$store.commit('CHANGE_MODE_AND_INDEX')
            })
        },
        components : {HowlerPlayer,VueSlider},
        data() {
            return {
                showPlaylistModal: false, // 控制弹出框显示状态
                volumeRangeValue: this.$store.state.volume,
                showVolumeValue: false,
                isNextButtonDisabled: false,
                isPrevButtonDisabled: false,
                showInfoDialog : false,
            };
        },
        mounted() {
            this.$bus.$on('toggleSong',this.togglePlay)
            this.$bus.$on('playPrevSong',this.playLast)
            this.$bus.$on('playNextSong',this.playNext)
            this.$bus.$on('showVolume',this.showVolume)
            this.$bus.$on('showInfo',this.showInfo)
            this.$bus.$on('showPlaylist',this.showPlaylist)
            this.$bus.$on('showLyric',this.changeShowLyric)
            this.$bus.$on('showQueue',this.changeShowQueue)
            this.$bus.$on('showMoreInfo',this.showMoreInfo)
        },
        watch : {
            nowSong: {
                handler(newSong) {
                    this.$store.state.currentProgress = 0
                },
            },
        },
        computed : {
            netId(){
                return this.$store.state.songDialogInfo.netId === (-1) ? "未绑定":this.$store.state.songDialogInfo.netId
            },
            songInfo(){
                return this.$store.state.songDialogInfo
            },
            globalShortcut(){
                return this.$store.state.globalShortcut
            },
            showLyric(){
                return this.$store.state.showLyrics;
            },
            showQueue() {
                return this.$store.state.showQueue;
            },
            playlists(){
                return this.$store.state.playlists
            },
            moreInfo(){
                return this.$store.state.moreInfoOfNowSong
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
            volume: {
                get() {
                    return this.$store.state.volume;
                },
                set(newVolume) {
                }
            },
            playMode(){
                return this.$store.state.nowMode
            },
            isPlaying(){
                return this.$store.state.isPlaying
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
            ...mapGetters(['filteredSongs']),
            ...mapState(['currentIndex'])
        },
        methods: {
            changeInfo(){
                myAPI.changeInfo(this.$store.getters.nowSong.path)
            },
            closeDialogInfo(){
                this.$store.state.songDialogInfo = this.$store.state.nowSongDialogInfo
                this.showInfoDialog = false
            },
            showMoreInfo(mode,song){
                this.showInfoDialog = true
            },
            changeMute(){
                this.$store.state.isMute = !this.$store.state.isMute
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

            padTime(time) {
                if (isNaN(time.toString().padStart(2, '0'))) {
                    return "00"
                }else{
                    return time.toString().padStart(2, '0');
                }

            },
            updateProgressBarOnClick(event) {

                const progressBar = this.$refs.footerProgressBar;
                const rect = progressBar.getBoundingClientRect();
                const offsetX = event.clientX - rect.left;
                const progressBarWidth = progressBar.offsetWidth;
                const newProgress = (offsetX / progressBarWidth) * 100;
                this.$bus.$emit('changeProgress', newProgress);
            },
            updateProgressBarOnClickVolume(event) {
                const progressBar = this.$refs.footerVolumeProgressBar;
                const rect = progressBar.getBoundingClientRect();
                const offsetX = event.clientX - rect.left;
                const progressBarWidth = progressBar.offsetWidth;
                const newProgress = Math.round((offsetX / progressBarWidth) * 100);
                this.$store.state.volume = newProgress
                this.showVolumeValue = true;

                clearTimeout(this.volumeValueTimeout);
                this.volumeValueTimeout = setTimeout(() => {
                    this.showVolumeValue = false;
                }, 1000); // 1秒后隐藏
            },
            updateVolume(event) {
                const newVolume = event.target.value;
                this.$store.commit('SET_VOLUME', newVolume);
                this.showVolumeValue = true;
                // 设置一个定时器，一段时间后隐藏音量数值显示
                clearTimeout(this.volumeValueTimeout);
                this.volumeValueTimeout = setTimeout(() => {
                    this.showVolumeValue = false;
                }, 1000); // 1秒后隐藏
            },
            showVolume(){
                this.showVolumeValue = true;
                clearTimeout(this.volumeValueTimeout);
                this.volumeValueTimeout = setTimeout(() => {
                    this.showVolumeValue = false;
                }, 1000);
            },
            showInfo(){
                if (!this.showInfoDialog) {
                    this.showMoreInfo(0,null)
                }else{
                    this.closeDialogInfo()
                }
            },
            showPlaylist(){
                this.showPlaylistModal = !this.showPlaylistModal
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
            toHome() {
                // 在 Footer 中的封面点击后展示主页
                this.$bus.$emit('toHome');
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
            ...mapMutations(['CHANGE_MODE_AND_INDEX',
                'SET_FILTER_TYPE',
                'SET_SELECTED_PLAYLIST_NAME',
                'CHANGE_QUEUE_AND_PLAY']),
            changePlayMode() {
                this.CHANGE_MODE_AND_INDEX()
            },
            openPlaylist(playlistName) {
                this.SET_FILTER_TYPE('byPlaylist')
                this.SET_SELECTED_PLAYLIST_NAME(playlistName)
                let songs = this.filteredSongs
                const index = 0
                this.$store.commit('CLEAR_SHUFFLED_INDEX');
                this.$store.commit('CHANGE_QUEUE_AND_PLAY', {songs, index});
                if (this.$route.path !== "/") {
                    this.$router.push({
                        name: "Home",
                    });
                }
                if (this.$store.state.showQueue) {
                    setTimeout(()=>{
                        this.$bus.$emit('songOnTop')
                    },100)
                }

                this.showPlaylistModal = false
            }
        }
    };
</script>
