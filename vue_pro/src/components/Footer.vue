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
                            class="image"
                            @click="toHome"
                    />
                </div>
            </div>
            <div class="center-buttons">
                <!-- 歌词按钮 -->
                <div class="control-button" @click="changeShowLyric">
                    <div class="lyrics-image"></div>
                </div>
                <!-- 播放模式按钮 -->
                <div class="control-button" @click="changePlayMode">
                    <div class="rotate-image" v-show="playMode === 0"></div>
                    <div class="random-image" v-show="playMode === 1"></div>
                    <div class="onesong-image" v-show="playMode === 2"></div>
                </div>
                <!-- 上一曲按钮 -->
                <div class="control-button" @click="playLast">
                    <div class="prev-image"></div>
                </div>
                <!-- 暂停播放按钮 -->
                <div class="control-button large" @click="togglePlay">
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
                <div class="control-button" @click="playNext(); triggerEvent1()">
                    <div class="next-image"></div>
                </div>
            </div>

            <HowlerPlayer></HowlerPlayer>

        </div>
        <!-- 进度条 -->
        <div class="progress-bar-container">

            <div class="progress-bar-wrapper">
                <div class="progress-bar" ref="footerProgressBar" @click="updateProgressBarOnClick">
                    <div class="progress" :style="{ width: currentProgress + '%' }"></div>
                </div>
            </div>
            <div class="time-labels">
                <span class="played-time">{{ playedTime }}</span>
                <span class="total-time">{{ nowSongDuration }}</span>
            </div>
        </div>


<!--        ------------------------------------------------------------------------------------------->
        <div class="right-controls">
            <!-- 信息按钮 -->
            <div class="control-button">
                <div class="info-image" @click="showInfoDialog = true"></div>
            </div>
            <!-- 播放列表按钮 -->
            <div class="control-button" @click="showPlaylistModal = true">
                <div class="playlist-image"></div>
            </div>
            <!-- 音量按钮 -->
            <div class="control-button" @click="changeMute" @wheel="adjustVolumeWithWheel">
                <div v-show="!this.$store.state.isMute" class="volume-image"></div>
                <div v-show="this.$store.state.isMute" class="noVolume-image"></div>
            </div>
            <!-- 音量range -->
            <input type="range" v-model="volume" min="0" max="100"
                   @input="updateVolume" @wheel="adjustVolumeWithWheel"/>
            <div v-show="showVolumeValue" class="volume-value">
                {{ `音量: ${volume}` }}
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
<!--        -------------------------------------------------------------------------------->
        <div class="info-dialog-container" v-if="showInfoDialog">
            <div class="overlay" >
                <!--        展示信息框-->
                <div class="info-dialog">
                    <!-- 关闭按钮 -->
                    <div class="modal-close" @click="showInfoDialog = false">
                        <div class="close-button close-image"></div>
                    </div>
                    <div class="info-content">
                        <!-- 歌曲封面 -->
                        <div class="cover-container">
                            <img :src="this.$store.state.nowSongCover" alt="Cover" class="cover-image" />
                        </div>
                        <!-- 歌曲详细信息 -->
                        <div class="info-details">
                            <div class="info-row">
                                <div class="info-label">标题:</div>
                                <div class="info-value">{{ nowSong.title }}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">艺术家:</div>
                                <div class="info-value">{{ nowSong.artist }}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">专辑:</div>
                                <div class="info-value">{{ nowSong.album }}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">时长:</div>
                                <div class="info-value">{{ nowSong.duration }}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">比特率:</div>
                                <div class="info-value">{{ nowSong.bitrate }}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">采样率:</div>
                                <div class="info-value">{{ nowSong.sampleRate }}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">位深:</div>
                                <div class="info-value">{{ nowSong.bitsPerSample }}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">大小:</div>
                                <div class="info-value">{{ nowSong.fileSize }}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">格式:</div>
                                <div class="info-value">{{ moreInfo.format==="MPEG"?"MP3":moreInfo.format }}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">音轨号:</div>
                                <div class="info-value">{{ moreInfo.trackNumber }}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">年份:</div>
                                <div class="info-value">{{ moreInfo.year }}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">流派:</div>
                                <div class="info-value">{{ moreInfo.genre }}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">注释:</div>
                                <div class="info-value">{{ moreInfo.comment }}</div>
                            </div>
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
        background-color: rgba(0, 0, 0, 0.3);
        z-index: 1;
    }
    .info-dialog {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60%;
        height: 80%;
        background-color: rgba(0, 0, 0, 0.8);
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
        height: 100%;
    }

    .cover-container {
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
        margin-left: 40px;
        margin-top: 50px;
        overflow: hidden;
    }

    .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }

    .info-label {
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
        height: 15px;
    }

    .time-labels {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-top: 6px;
        font-size: 12px;
        color: white;
    }

    .played-time {
        padding-left: 10px;
    }

    .total-time {
        padding-right: 10px;
    }

    .progress-bar-wrapper {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .progress-bar {
        margin-left: 2px;
        margin-right: 2px;
        width: 100%;
        height: 15px;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 100px;
        cursor: pointer;
        overflow: hidden;
        position: relative;
    }

    .progress {
        height: 100%;
        background-color: #f0f0f0;
        border-radius: 100px;
    }
    .volume-value {
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

    .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .image-and-buttons {
        display: flex;
    }

    .image-container {
        width: 60px;
        height: 60px;
        border-radius: 100px;
        overflow: hidden;
        margin-right: 10px;
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
        margin: 0 7px;
        transition: background-color 0.2s ease; /* 添加过渡效果 */
    }
    .control-button:hover{
        background-color: rgba(255, 255, 255, 0.1);
    }

    .large {
        width: 50px;
        height: 50px;
        font-size: 24px;
        margin: 0;
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
        background-color: rgba(0, 0, 0, 0.3); /* 半透明黑色背景 */
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000; /* 确保在最上层 */
    }
    .playlist-panel {
        background-color: rgba(0, 0, 0, 0.7);
        border-radius: 10px;
        padding: 10px;
        width: 80%;
        max-width: 400px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0);
        position: relative;
    }

    .playlist-options {
        /* 选项列表的样式 */

        margin-top: 40px;
    }
    .playlist-option{
        padding: 10px;
        border-radius: 10px;
        transition: background-color 0.1s ease;
    }
    .playlist-option:hover{
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.5); /* 鼠标悬停时的背景颜色 */
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
       background-color: rgba(255, 255, 255, 0.4);
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


    export default {
        name: "Footer",
        mixins: [mix3],
        components : {HowlerPlayer},
        data() {
            return {
                showPlaylistModal: false, // 控制弹出框显示状态
                volumeRangeValue: this.$store.state.volume,
                showVolumeValue: false,
                isNextButtonDisabled: false,
                isPrevButtonDisabled: false,
                showInfoDialog : false
            };
        },
        mounted() {
            this.$bus.$on('toggleSong',this.togglePlay)
            this.$bus.$on('playPrevSong',this.playLast)
            this.$bus.$on('playNextSong',this.playNext)
        },
        watch : {
            nowSong: {
                handler(newSong) {
                    this.$store.state.currentProgress = 0
                },
            },
        },
        computed : {
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
                }
                return '00:00';
            },
            nowSongDuration() {
                if (this.nowSong) {
                    return this.nowSong.duration.substring(0, 5);
                }
                return '00:00';
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
            ...mapGetters(['filteredSongs']),
            ...mapState(['currentProgress'])
        },
        methods: {
            changeMute(){
                this.$store.state.isMute = !this.$store.state.isMute
            },
            changeShowLyric(){
                this.$store.state.showLyrics = !this.$store.state.showLyrics
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
                return time.toString().padStart(2, '0');
            },
            updateProgressBarOnClick(event) {
                    const progressBar = this.$refs.footerProgressBar;
                    const rect = progressBar.getBoundingClientRect();
                    const offsetX = event.clientX - rect.left;
                    const progressBarWidth = progressBar.offsetWidth;
                    const newProgress = (offsetX / progressBarWidth) * 100;
                    this.$bus.$emit('changeProgress', newProgress);

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
                    this.$store.dispatch('nextSong');
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
                    this.$store.dispatch('prevSong');
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
                this.showPlaylistModal = false
            }
        }
    };
</script>
