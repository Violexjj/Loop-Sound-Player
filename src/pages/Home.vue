<template>
    <div class="home-container route-container unselectable">
        <transition name="slide-right-left">
            <div class="song-info" v-if="showInfo" :class="{ 'add-background-modal': infoModal }">
                <div class="cover-container">
                    <img v-if="this.$store.state.nowSongCover" :src="this.$store.state.nowSongCover" alt="cover" class="cover">
                </div>

                <div class="threeInfo-container">
                    <b class="info title" v-if="nowSong">{{nowSong.title}}</b>
                    <b class="info artist display" v-if="nowSong" @click="displayArtistDetail(nowSong.artist)">{{nowSong.artist}}</b>
                    <b class="info album display" v-if="nowSong" @click="displayAlbumDetail(nowSong.album)">{{nowSong.album}}</b>
                    <b class="info format" v-if="this.$store.state.showFormat">{{Format}}</b>
                </div>

            </div>
        </transition>

        <!-- 歌词部分的内容 -->
        <transition name="slide-left-right" >
            <div class="lyrics" :class="{ 'add-background-modal': lyricsModal }" v-if="this.$store.state.showLyrics === true" >
                <div class="lyrics-container" ref="lyricsContainer">
                    <div
                            v-for="(line, index) in parsedLyrics"
                            :key="index"
                            ref="lyricLine"
                            @click="changeProgress(line.time)"
                            :style="{ fontSize: (index === currentLyricIndex) ? ($store.state.lyricFont + $store.state.biggerLyric) + 'px' : $store.state.lyricFont + 'px', marginBottom: (index < parsedLyrics.length - 1) ? '5px' : '0' }"
                            :class="[
          'lyrics-line',
          {
            'current-line': (index === currentLyricIndex),
            'highlight': (index === currentLyricIndex && highlight && line.text1 !== ''),
            'divide':(line.text1 === ''),

            'left-align': $store.state.lyricAlignmentMode === 0,
            'center-align': $store.state.lyricAlignmentMode === 1,
            'right-align': $store.state.lyricAlignmentMode === 2,
          },
        ]"
                    >
                        <div :class="{'notAllowWrap':index !== currentLyricIndex}" ref="text">{{line.text1}}</div>
                        <div :class="{'notAllowWrap':index !== currentLyricIndex}" style="margin-top: 5px" v-if="line.hasTranslation && line.text2!=='' && $store.state.showTlyric" ref="text">{{line.text2}}</div>
                    </div>
                </div>
            </div>
        </transition>
        <!-- 播放队列部分的内容 -->
        <transition name="slide-left-right">
            <div class="play-queue" ref="queueTable"
                 :class="{ 'add-background-modal': queueModal }"
                 v-if="this.$store.state.showQueue === true">
                <table class="queue-table">
                    <tbody>
                    <tr v-for="(song, index) in nowQueue" :key="index"
                        class="table-row" @dblclick="playSelectedSong(index);clearShuffledIndex()"
                        :class="{ 'current-song': index === currentSongIndex }">
                        <td class="table-cell-num">{{ index + 1 }}</td>
                        <td class="table-cell">
                            {{ truncateText(song.title + " - " + song.artist),10}}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </transition>
    </div>

</template>


<script>
    import {mix3, textTruncateMixin} from "@/mixin";
    import {mapGetters, mapMutations, mapState} from "vuex";

    export default {
        name: "Home",
        mixins: [mix3, textTruncateMixin],
        data(){
            return {
                parsedLyrics: [], // 歌词数组，每个元素格式为 { time: 秒数, text: 歌词文本 ,hasTranslation:有无翻译}
                currentLyricIndex: 0, // 当前显示的歌词行索引
                songCover : null,
                nowSongTime:0,
                smoothSpeed:50
            };
        },

        computed: {
            showQueue(){
                return this.$store.state.showQueue;
            },
            Format(){
                let a = null
                if (this.$store.state.moreInfoOfNowSong === "" || this.$store.state.moreInfoOfNowSong ===null){
                    a = ""
                }else{
                    a = this.$store.state.moreInfoOfNowSong.format==="MPEG"?"MP3":this.$store.state.moreInfoOfNowSong.format
                }
                function toSlash(val){
                    if (val === "" || val === "无" || null === val) {
                        return ""
                    }else{
                        return " · "+val
                    }
                }
                const b = toSlash(this.nowSong.bitsPerSample)
                const c = toSlash(this.nowSong.sampleRate)
                const d = toSlash(this.nowSong.bitrate)
                return a + b + c + d
            },
            ...mapState(['moreInfoOfNowSong','showFormat','infoModal','lyricsModal','queueModal']),
            ...mapGetters(['nowSong']),
            showInfo(){
                return this.$store.state.showInfo
            },
            showTranslatedLyric(){
                return this.$store.state.showTlyric
            },
            highlight(){
                return this.$store.state.highlight
            },
            divide(){
                return this.$store.state.divide
            },
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
            showQueue:{
                immediate:true,
                handler(newVal){
                    this.smoothSpeed = 300
                    setTimeout(()=>{
                        this.updateLyricScroll()
                        this.smoothSpeed = 50
                    },200)
                    if (newVal) {
                        setTimeout(()=>{
                            this.scrollToCurrentSong()
                        },100)
                    }
                }
            },
            nowSong:{
                immediate: true,
                handler(newSong){
                    const durationParts = this.nowSong.duration.split(':');
                    const minutes = parseInt(durationParts[0]);
                    const seconds = parseInt(durationParts[1]);
                    const milliseconds = parseInt(durationParts[2]);
                    this.nowSongTime = minutes * 60 + seconds + milliseconds / 1000;
                    this.showCover = false
                    setTimeout(()=>{
                        this.showCover = true
                    },500)
                }
            },
            currentPlayTime(newTime) {
                this.updateCurrentLyricIndex();
            },
            currentLyricIndex(newTime) {
                this.updateLyricScroll();
            },
            '$store.state.lyricOfNowSong': {
                immediate: true,
                handler(newLyricText) {
                    // 根据歌词文本来设置 showLyrics 的值
                    if (this.$store.state.autoHideLrc) {
                        //自动修改
                        if (newLyricText.includes('无歌词') ||newLyricText.includes('没有找到') || newLyricText.includes('纯音乐') || newLyricText === "") {
                            if (this.$store.state.showLyrics) {
                                const showQueue = this.$store.state.showQueue
                                this.$store.state.showInfo = false;
                                this.$store.state.showLyrics = false;
                                if (showQueue) {
                                    this.$store.state.showQueue = false;
                                }
                                setTimeout(()=>{
                                    this.$store.state.showInfo = true;
                                    if (showQueue) {
                                        this.$store.state.showQueue = true;
                                    }
                                },500)
                            }

                        }else{
                            if(!this.$store.state.showLyrics){
                                const showQueue = this.$store.state.showQueue
                                this.$store.state.showInfo = false;
                                this.$store.state.showLyrics = true;
                                if (showQueue) {
                                    this.$store.state.showQueue = false;
                                }
                                setTimeout(()=>{
                                    this.$store.state.showInfo = true;
                                    if (showQueue) {
                                        this.$store.state.showQueue = true;
                                    }
                                },500)
                            }
                        }
                    }
                    this.parsedLyrics = this.parseLyrics(newLyricText);
                },
            },
            '$store.state.showLyrics': {
                immediate: true,
                handler(newValue) {
                    this.smoothSpeed = 300
                    setTimeout(()=>{
                        this.updateLyricScroll()
                        this.smoothSpeed = 50
                    },200)

                },
            },
        },
        methods:{
            changeProgress(time){
                const newProgress = (time / this.nowSongTime) * 100;
                this.$bus.$emit('changeProgress', newProgress);
            },
            async displayArtistDetail(artistName){
                const filteredArtistSong = this.$store.state.songs.songs.filter(song => song.artist === artistName);
                // 创建包含 name 和 songs 属性的对象
                const artistDetail = {
                    name: artistName,
                    songs: filteredArtistSong
                };
                await this.changeArtistCover(artistDetail.songs,artistDetail);
            },
            async changeArtistCover(artistSongs,artist){
                const randomIndex = (Math.floor(Math.random() * artistSongs.length));
                const path = artistSongs[randomIndex].path
                const coverData = await myAPI.getSongCover(path,1);
                // 更新封面
                this.$store.state.nowArtistCover = coverData;
                this.$router.push({
                    name: 'ArtistDetail',
                    params: {
                        artist: artist,
                    },
                });
            },

            async displayAlbumDetail(albumName){
                const filteredAlbumSong = this.$store.state.songs.songs.filter(song => song.album === albumName);
                // 创建包含 name 和 songs 属性的对象
                const albumDetail = {
                    name: albumName,
                    songs: filteredAlbumSong
                };
                await this.changeAlbumCover(albumDetail.songs,albumDetail);
            },
            async changeAlbumCover(albumSongs,album){
                const path = albumSongs[0].path
                const coverData = await myAPI.getSongCover(path,1);
                // 更新封面
                this.$store.state.nowAlbumCover = coverData;
                this.$router.push({
                    name: 'AlbumDetail',
                    params: {
                        album: album,
                    },
                });
            },
            clearShuffledIndex(){
                this.$store.commit('CLEAR_SHUFFLED_INDEX');
            },
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
                const container = this.$refs.lyricsContainer;
                if (container) {
                    const lyricsLines = container.querySelectorAll('.lyrics-line');
                    const currentLine = lyricsLines[this.currentLyricIndex];
                    if (currentLine) {
                        setTimeout(()=>{
                            currentLine.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                            });
                        },this.smoothSpeed)

                    }
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

                let previousTime = null;
                let previousLine = null;

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const matches = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);


                    if (matches) {
                        const minute = parseInt(matches[1]);
                        const second = parseFloat(matches[2]);
                        const time = minute * 60 + second;
                        const text = matches[3].trim();

                        const xiegangcount = text.match(/[^ ] \/ [^ ]/g);
                        const parts = text.split(" / ");

                        if (xiegangcount && xiegangcount.length === 1 && (parts.length === 2 && parts[0].trim() !== "" && parts[1].trim() !== "")) {
                            const [originalText, translatedText] = text.split(' / ');
                            lyrics.push({time, text1: originalText, text2: translatedText, hasTranslation: true});
                        }else{
                            if (previousTime === time) {
                                // 如果当前时间戳与上一行相同，则将当前文本视为译文，并与上一行的文本合并
                                lyrics.pop(); // 移除上一次添加的原文
                                const [originalText, translatedText] = [previousLine, text];
                                lyrics.push({ time, text1: originalText, text2: translatedText, hasTranslation: true });
                            } else {
                                lyrics.push({ time, text1: text, hasTranslation: false });
                                previousTime = time;
                                previousLine = text;
                            }
                        }

                    }
                }
                return lyrics;
            },

            ...mapMutations({
                setCurrentIndex: 'SET_CURRENT_INDEX'
            }),

            scrollToCurrentSong() {
                if (this.showQueue) {
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
        }
    };
</script>
<style scoped>
    /* 自定义 slide-right-left 过渡效果 */
    .slide-right-left-enter-active, .slide-right-left-leave-active {
        transition: transform 0.5s ease, opacity 0.5s ease; /* 添加 transform 和 opacity 属性的过渡效果 */
    }
    .slide-right-left-enter, .slide-right-left-leave-to /* .slide-right-left-leave-active 在 <2.1.8 中可用 */ {
        transform: translateX(-15%); /* 从左往右消失 */
        opacity: 0;
    }
    /* 添加左右过渡效果的 CSS */
    .slide-left-right-enter-active, .slide-left-right-leave-active {
        transition: all 0.5s;
    }
    .slide-left-right-enter, .slide-left-right-leave-to /* .slide-left-right-leave-active 在 <2.1.8 中可用 */ {
        transform: translateX(50%); /* 从左往右消失 */
        opacity: 0;
    }


    .play-queue {
        flex: 1.7;
        font-size: 10px;
        overflow-y: auto;
        overflow-x: hidden;
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
        margin-bottom: 5px;
        marigin-top: 5px;
        border-collapse: collapse;
        width: 100%;
    }
    .table-row {
        background-color: rgba(255, 255, 255, 0);
        transition: 0.1s;
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
        gap: 13px;
    }
    .route-container {
        height: calc(97vh - 213px); /* 100px 是顶部导航栏和底部控制栏的总高度 */
        overflow: hidden;
    }
    .lyrics {
        flex: 4;
        padding: 5px;
        border-radius: 10px;
        overflow: hidden;
    }
    .lyrics-container {
        margin-top: 5px;
        padding: 2px;
        overflow-y: auto;
        height: calc(97.5vh - 237px); /* 设置合适的高度 */
    }
    .lyrics-container::-webkit-scrollbar {
        width: 0; /* 使滚动条不可见 */
    }
    .lyrics-line {
        padding:5px 10px;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.4);
        font-weight: bold;
        letter-spacing: 1px;
        transition: 0.2s;
        border-radius: 10px;
        scroll-behavior: smooth;
    }
    .lyrics-line:hover{
        background-color: rgba(255, 255, 255, 0.1);
        cursor: pointer;
        padding-bottom: 10px;
        padding-top: 10px;
    }
    .left-align {
        text-align: left;
    }
    .center-align {
        text-align: center;
    }
    .right-align {
        text-align: right;
    }


    .current-line {
        color: white;
        padding-bottom: 10px;
        padding-top: 10px;
    }

    .notAllowWrap{
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .highlight{
        background-color: rgba(255, 255, 255, 0.1);
    }

    .divide{
        height: 30px;
    }


    /*=================================================================================*/
    /*=================================================================================*/
    .song-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 3;
        padding: 5px;
        position: sticky;
        top: 0;
        overflow: auto;
        /*区域背景*/
        border-radius: 10px;
    }
    .add-background-modal{
        background-color: rgba(0, 0, 0, 0.2);
    }
    .song-info.expanded {
        width: 30%; /* 设置宽度为 30% 或根据需要的宽度 */
    }
    .cover-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 66.66%;
        border-radius: 18px;
        overflow: hidden;
        margin-bottom: 10px;
        margin-top: 15px;
    }

    .cover {
        transition: ease-in-out 0.3s;
        max-width: 95%;
        max-height: 95%;
        object-fit: contain;
        border-radius: 18px;
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
    .format{
        font-size: 15px;
    }
    .display:hover{
        text-decoration: underline;
        cursor: pointer;
    }
</style>
