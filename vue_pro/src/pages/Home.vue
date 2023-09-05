<template>
    <div class="home-container route-container unselectable">
        <div class="song-info">
            <div class="cover-container">
                <img v-if="this.$store.state.nowSongCover" :src="this.$store.state.nowSongCover" alt="cover" class="cover">
            </div>
            <div class="threeInfo-container">
                <b class="info title" v-if="nowSong">{{nowSong.title}}</b>
                <b class="info artist" v-if="nowSong">{{nowSong.artist}}</b>
                <b class="info album" v-if="nowSong">{{nowSong.album}}</b>
            </div>
        </div>

        <!-- 歌词部分的内容 -->
        <div class="lyrics" v-if="this.$store.state.showLyrics === true">
            <div class="lyrics-container" ref="lyricsContainer">
                <div
                        v-for="(line, index) in parsedLyrics"
                        :key="index"
                        :class="['lyrics-line', { 'current-line': index === currentLyricIndex, 'original-line': (index === currentLyricIndex && hasTranslation) || (index === currentLyricIndex - 1 && hasTranslation) }]"
                >
                    {{ line.text }}
                </div>
            </div>
        </div>

        <div class="play-queue" ref="queueTable">
            <!-- 播放队列部分的内容 -->
            <table class="queue-table">
                <tbody>
                <tr v-for="(song, index) in nowQueue" :key="index"
                    class="table-row" @dblclick="playSelectedSong(index)"
                    :class="{ 'current-song': index === currentSongIndex }">
                    <td class="table-cell-num">{{ index + 1 }}</td>
                    <td class="table-cell">{{ song.title + " - " + song.artist}}</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import {mix3, textTruncateMixin} from "@/mixin";
    import {mapMutations} from "vuex";

    export default {
        name: "Home",
        mixins: [mix3, textTruncateMixin],
        data(){
            return {
                parsedLyrics: [], // 歌词数组，每个元素格式为 { time: 秒数, text: 歌词文本 }
                currentLyricIndex: 0, // 当前显示的歌词行索引
                hasTranslation: false,
                songCover : null
            };
        },
        computed: {
            currentSongIndex(){
                return this.$store.state.currentIndex
            },
            nowQueue(){
              return this.$store.state.queue
            },
            currentPlayTime() {
                // 获取当前播放时间，可以从你的 state 中获取
                return this.$store.state.currentPlayTime; // 假设为秒数
            },
        },
        mounted(){
          this.$bus.$on('songOnTop',this.scrollToCurrentSong)
        },
        watch: {
            currentPlayTime(newTime) {
                this.updateCurrentLyricIndex();
                this.updateLyricScroll();
            },
            '$store.state.lyricOfNowSong': {
                immediate: true,
                handler(newLyricText) {
                    this.parsedLyrics = this.parseLyrics(newLyricText);
                    this.hasTranslation = (newLyricText.match(/\//g) || []).length >= 10;
                },
            },
        },
        methods:{
            playSelectedSong(index) {
                // 调用 setCurrentIndex 并传递 index 参数
                this.setCurrentIndex(index);
                this.$store.state.isPlaying = true
                // 使用this.$nextTick确保在DOM更新后再操作滚动条位置
                this.$nextTick(() => {
                    const lyricContainer = this.$refs.lyricsContainer;
                    if (lyricContainer) {
                        lyricContainer.scrollTop = 0;
                    }
                });
            },
            updateLyricScroll() {
                // 更新歌词滚动位置的逻辑
                const lyricContainer = document.querySelector('.lyrics-container');
                if (lyricContainer) {
                    const lineHeight = 40; // 每行歌词的高度
                    const middleLineIndex = Math.floor(lyricContainer.clientHeight / lineHeight / 2);
                    const targetLineIndex = this.currentLyricIndex - middleLineIndex;
                    lyricContainer.style.transition = 'scrollTop 0.8s ease-in-out'; // 添加过渡效果
                    lyricContainer.scrollTop = lineHeight * targetLineIndex;
                }
            },
            updateCurrentLyricIndex() {
                // 根据当前播放时间更新当前歌词行的索引
                // 根据当前播放时间更新当前歌词行的索引
                for (let i = 0; i < this.parsedLyrics.length - 1; i++) {
                    if (this.parsedLyrics[i + 1] && this.currentPlayTime >= this.parsedLyrics[i].time && this.currentPlayTime < this.parsedLyrics[i + 1].time) {
                        this.currentLyricIndex = i;
                        break;
                    }
                }
                // 处理最后一行歌词
                const lastIndex = this.parsedLyrics.length - 1;
                if (this.currentPlayTime >= this.parsedLyrics[lastIndex].time) {
                    this.currentLyricIndex = lastIndex;
                }
            },
            parseLyrics(lyricsText) {
                const lines = lyricsText.split('\n');
                const lyrics = [];

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const matches = line.match(/\[(\d+):(\d+\.\d+)\](.+)/);

                    if (matches) {
                        const minute = parseInt(matches[1]);
                        const second = parseFloat(matches[2]);
                        const time = minute * 60 + second;
                        const text = matches[3];

                        if (text.includes(' / ')) {
                            const [originalText, translatedText] = text.split('/');
                            lyrics.push({ time, text: originalText, isOriginal: true });
                            lyrics.push({ time, text: translatedText, isTranslation: true });
                        } else {
                            lyrics.push({ time, text });
                        }
                    }
                }

                return lyrics;
            },
            ...mapMutations({
                setCurrentIndex: 'SET_CURRENT_INDEX'
            }),

            scrollToCurrentSong() {

                const queueTable = this.$refs.queueTable;

                if (!queueTable) {
                    return;
                }

                const currentIndex = this.$store.state.currentIndex;
                const rowHeight = 30; // 假设每行的高度为 30px
                const containerHeight = queueTable.clientHeight;
                const scrollTop = rowHeight * (currentIndex + 1) - containerHeight / 2;

                // 计算可滚动的最大高度
                const maxScrollTop = queueTable.scrollHeight - containerHeight;

                // 调整滚动位置，确保不超出边界
                if (scrollTop < 0) {
                    queueTable.scrollTop = 0;
                } else if (scrollTop > maxScrollTop) {
                    queueTable.scrollTop = maxScrollTop;
                } else {
                    queueTable.scrollTop = scrollTop;
                }
            }
        }
    };
</script>

<style scoped>
    .play-queue {
        flex: 2;
        font-size: 10px;
        overflow-y: auto;
        overflow-x: hidden;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
    }
    .play-queue::-webkit-scrollbar {
        width: 15px;
        background-color: rgba(0, 0, 0, 0); /* 设置为半透明的背景颜色 */
        border-radius: 10px;
    }

    /* 滚动条滑块 */
    .play-queue::-webkit-scrollbar-thumb {
        background-color: white; /* 设置滑块的颜色 */
        border-radius: 20px; /* 设置滑块的圆角 */
    }

    /* 滚动条轨道 */
    .play-queue::-webkit-scrollbar-track {
        background-color: rgba(255, 255, 255, 0); /* 设置轨道的颜色 */
    }
    .queue-table {
        width: 100%;
        margin-bottom: 5px;
        marigin-top: 5px;
        border-collapse: collapse;
    }
    .table-row {
        background-color: rgba(255, 255, 255, 0);
    }
    .table-row:hover {
        background-color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
    }
    .table-cell {
        padding: 6px;
        font-size: 13px;
        border: 1px solid rgba(255, 255, 255, 0);
        white-space: nowrap;
    }
    .table-cell-num {
        padding: 6px;
        font-size: 13px;
        border: 1px solid rgba(255, 255, 255, 0);;
        text-align:center;
    }
    .current-song{
        background-color: rgba(255, 255, 255, 0.3);;
    }
    .home-container {
        display: flex;
        gap: 20px;
    }
    .route-container {
        height: calc(97vh - 230px); /* 100px 是顶部导航栏和底部控制栏的总高度 */
        overflow: hidden;
    }

    /*=================================================================================*/
    /*=================================================================================*/


    .lyrics {
        flex: 4;
        padding: 5px;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
        /* 添加你的歌词部分的样式 */
        overflow: hidden;
    }
    .lyrics-container {
        padding: 2px;
        overflow-y: auto;
        height: calc(97vh - 250px); /* 设置合适的高度 */
    }
    .lyrics-container::-webkit-scrollbar {
        width: 0; /* 使滚动条不可见 */
    }

    .lyrics-line {
        height: 40px;
        line-height: 30px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: darkgrey;
        font-size: 20px;
        font-weight: bold;
    }

    .current-line {
        color: white;
    }
    .original-line {
        color: white;
    }



    /*=================================================================================*/
    /*=================================================================================*/
    .song-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 3;
        padding: 20px;
        position: sticky;
        top: 0;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
    }
    .song-info {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        flex: 3;
        padding: 20px;
        position: sticky;
        top: 0;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
    }

    .cover-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 66.66%;
        border-radius: 20px;
        overflow: hidden;
        margin-bottom: 10px;
    }

    .cover {
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 30px;
    }

    .threeInfo-container {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        height: 33.33%;
        width: 100%;
    }

    .info {
        font-weight: bolder;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        max-width: 100%;
        text-align: center;
    }

    .title {
        font-size: 25px;
    }

    .artist,
    .album {
        font-size: 20px;
    }
</style>
