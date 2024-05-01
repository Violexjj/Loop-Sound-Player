<template>
    <div :class="{
                          'home-container': true,
                          'unselectable': true,
                          'route-container-focus': focusMode && focusMode2,
                          'route-container-focus2': focusMode && !focusMode2,
                          'route-container-noFocus': !focusMode
                        }">
        <transition name="slide-right-left">
            <div class="song-info" v-if="showInfo"
                 :class="{ 'add-background-modal': infoModal }">
                <div class="cover-container">
                    <img v-if="this.$store.state.nowSongCover"
                         :src="this.$store.state.nowSongCover" alt="cover" class="cover"
                         title="左键半沉浸，右键全沉浸"
                           @click="openFocusMode(1)"
                         @contextmenu="openFocusMode(2)"
                         ref="cover"
                    >

                </div>

                <div class="threeInfo-container" ref="spectrum">
<!--                    频谱-->
                    <div class="spectrum" v-if="showSpectrum">
                        <div v-for="(item, index) in spectrumData"
                             :key="index"
                             style="width: 8px;background-color: rgba(255,255,255,0.2);border-radius: 100px;transition: 0.1s"
                             :style="{ height: item/1.5+ 'px' }">
                        </div>
                    </div>

                    <b class="info title" v-if="nowSong">{{nowSong.title}}</b>
                    <b :class="{
                                      'info': true,
                                      'artist': true,
                                      'display': !focusMode,
                                    }" v-if="nowSong" @click="displayArtistDetail(nowSong.artist)">{{nowSong.artist}}</b>
                    <b :class="{
                                      'info': true,
                                      'album': true,
                                      'display': !focusMode,
                                    }" v-if="nowSong" @click="displayAlbumDetail(nowSong.album)">{{nowSong.album}}</b>
                    <b class="info format" v-if="this.$store.state.showFormat">{{Format}}</b>
                </div>
            </div>
        </transition>

        <!-- 歌词部分的内容 -->
        <transition name="slide-left-right" >
            <div class="lyrics" :class="{ 'add-background-modal': lyricsModal }" v-if="this.$store.state.showLyrics === true" >
                <div class="lyrics-container" ref="lyricsContainer" @wheel="handleBlur()">
                    <div
                            v-for="(line, index) in homeLyric"
                            :key="index"
                            ref="lyricLine"
                            @click="changeProgress(line.time)"
                            :style="{marginBottom: (index < homeLyric.length - 1) ? '5px' : '0', fontWeight: boldLrc ? 'bold' : 'normal' }"
                            :class="[
          'lyrics-line',
          {
            'current-line': (index === currentLyricIndex),
            'highlight': (index === currentLyricIndex && highlight && line.text1 !== ''),
            'divide':(line.text1 === ''),
            'gap':(index !== 0),

            'left-align': $store.state.lyricAlignmentMode === 0,
            'center-align': $store.state.lyricAlignmentMode === 1,
            'right-align': $store.state.lyricAlignmentMode === 2,
          },
        ]"
                    >
                        <div :class="{'notAllowWrap':index !== currentLyricIndex}"
                             :style="{ fontSize: (index === currentLyricIndex) ? ($store.state.lyricFont + $store.state.biggerLyric) + 'px' : $store.state.lyricFont + 'px',
                             filter: nowOtherBlur && index !== currentLyricIndex ? 'blur(' + Math.min(Math.abs((index - currentLyricIndex)/1.5), 5) + 'px)' : 'none'}"
                             style="transition: 0.5s"
                             ref="text">{{line.text1}}
                        </div>
                        <div :class="{'notAllowWrap':index !== currentLyricIndex}"
                             style="margin-top: 5px;transition: 0.5s"
                             :style="{ fontSize: (index === currentLyricIndex) ? ($store.state.lyricFont2 + $store.state.biggerLyric-2) + 'px' : $store.state.lyricFont2 + 'px',
                             filter: nowOtherBlur && index !== currentLyricIndex ? 'blur(' + Math.min(Math.abs((index - currentLyricIndex)/1.5), 5) + 'px)' : 'none'}"
                             v-if="line.hasTranslation && line.text2!=='' && $store.state.showTlyric"
                             ref="text">{{line.text2}}
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <!-- 播放队列部分的内容 -->
        <transition name="slide-left-right">
            <div class="play-queue" ref="queueTable"
                 :class="{ 'add-background-modal': queueModal }"
                 v-if="this.$store.state.showQueue === true"
                 @mouseenter="changeScrollbarColor(true)"
                 @mouseleave="changeScrollbarColor(false)">
                <table class="queue-table">
                    <tbody>
                    <tr v-for="(song, index) in nowQueue" :key="index"
                        class="table-row" @dblclick="playSelectedSong(index);clearShuffledIndex()"
                        :class="{ 'current-song': index === currentSongIndex }">
                        <td class="table-cell-num">{{ index + 1 }}</td>
                        <td class="table-cell" :title="song.title + ' - ' + song.artist">
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
    var scrollIntoView = require('scroll-into-view');


    export default {
        name: "Home",
        mixins: [mix3, textTruncateMixin],
        data(){
            return {
                songCover : null,
                nowSongTime:0,
                smoothSpeed:50,
                initial: true,
                nowOtherBlur: null,
                blurTimeout: null,
            };
        },
        computed: {
            showSpectrum(){
                return this.$store.state.showSpectrum
            },
            spectrumData(){
                return this.$store.state.dataArray
            },
            boldLrc(){
                return this.$store.state.boldLrc
            },
            homeLyric(){
                return this.$store.state.homeLyric
            },
            currentLyricIndex(){
                return this.$store.state.currentLyricIndex
            },
            focusMode2(){
                return this.$store.state.focusMode2
            },
            focusMode(){
                return this.$store.state.focusMode
            },
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

                if (this.nowSong !== null) {
                    const b = toSlash(this.nowSong.bitsPerSample)
                    const c = toSlash(this.nowSong.sampleRate)
                    const d = toSlash(this.nowSong.bitrate)
                    return a + b + c + d
                }
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
            otherBlur(){
                return this.$store.state.otherBlur
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
            this.$bus.$on('changeCover',(flag) =>{
                if (flag) {
                    if (this.$refs.cover) {
                        this.$refs.cover.style.opacity = 0.5
                        this.$refs.cover.style.filter = "brightness(0.5)"
                    }
                }else{
                    if (this.$refs.cover) {
                        this.$refs.cover.style.opacity = 1
                        this.$refs.cover.style.filter = "brightness(1)"
                    }
                }
            })
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
                    this.lyricLoaded = false
                    if (this.nowSong !== null) {
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
                }
            },
            currentLyricIndex(newTime) {
                this.updateLyricScroll();
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
            otherBlur: {
                immediate: true,
                handler(newValue) {
                    this.nowOtherBlur = newValue
                },
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
                },
            },
        },
        methods:{
            handleBlur(){
                if (this.otherBlur) {
                    clearTimeout(this.blurTimeout);
                    this.nowOtherBlur = false
                    this.blurTimeout = setTimeout(()=>{
                        this.nowOtherBlur = true
                    },2000)
                }
            },
            openFocusMode(flag){
                if (flag === 1) {
                    this.$store.state.focusMode2 = true
                    this.$store.state.focusMode = !this.$store.state.focusMode;
                }else{
                    this.$store.state.focusMode2 = false
                    this.$store.state.focusMode = !this.$store.state.focusMode;
                }
            },
            changeScrollbarColor(isHovering) {
                const scrollbars = document.getElementsByClassName('play-queue');
                if (isHovering) {
                    for (let i = 0; i < scrollbars.length; i++) {
                        scrollbars[i].style.scrollbarColor = 'white';
                    }
                } else {
                    for (let i = 0; i < scrollbars.length; i++) {
                        scrollbars[i].style.scrollbarColor = 'transparent';
                    }
                }
            },
            changeProgress(time){
                if (this.initial && this.$store.state.isPlaying === false) {
                    setTimeout(()=>{
                        this.$store.state.isPlaying = true
                    },50)

                    this.initial = false
                }
                if (this.otherBlur) {
                    this.nowOtherBlur = true
                }
                setTimeout(()=>{
                    const newProgress = (time / this.nowSongTime) * 100;
                    this.$bus.$emit('changeProgress', newProgress);
                },10)
            },
            async displayArtistDetail(artistName){
                if (this.focusMode) {
                    return
                }
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
                if (this.focusMode) {
                    return
                }
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
                this.$store.state.playNextSongs = false
                this.$store.state.nextSongsIndex = -1
                this.$store.state.nextSongs = []
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
                    const currentLine = lyricsLines[this.$store.state.currentLyricIndex];
                    if (currentLine) {
                        setTimeout(()=>{
                            // currentLine.scrollIntoView({
                            //     behavior: 'smooth',
                            //     block: 'center',
                            // });
                            scrollIntoView(currentLine,{time:500})
                        },this.smoothSpeed)

                    }
                }
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
    .spectrum{
        display: flex; /* 使用 Flexbox 布局 */
        justify-content: space-between; /* 元素之间平均分布 */
        align-items: center; /* 垂直居中 */
        position: absolute;
        gap: 4px;
        z-index: -1;
    }
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

    /* 滚动条滑块默认颜色 */
    .play-queue::-webkit-scrollbar-thumb {
        background-color: transparent; /* 默认透明颜色 */
        border-radius: 20px;
    }
    /* 鼠标悬停时滑块颜色 */
    .play-queue:hover::-webkit-scrollbar-thumb {
        background-color: white; /* 鼠标悬停时的颜色 */
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
    }
    .table-row:hover {
        background-color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
    }
    .table-cell {
        letter-spacing: 0.5px;
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
        width: 100%;
        display: flex;
        gap: 15px;
    }
    .route-container-focus {
        height: calc(97.5vh - 130px); /* 100px 是顶部导航栏和底部控制栏的总高度 */
        overflow: hidden;
    }
    .route-container-focus2 {
        height: calc(97.5vh - 35px); /* 100px 是顶部导航栏和底部控制栏的总高度 */
        overflow: hidden;
    }
    .route-container-noFocus {
        height: calc(97.5vh - 220px); /* 100px 是顶部导航栏和底部控制栏的总高度 */
        overflow: hidden;
    }
    .lyrics {
        flex: 4;
        padding: 5px;
        border-radius: 10px;
        overflow-x: hidden;
    }
    .lyrics::-webkit-scrollbar {
        width: 0; /* 使滚动条不可见 */
    }
    .lyrics-container-focus {
        margin-top: 5px;
        padding: 2px;
        height: calc(97.5vh - 150px); /* 设置合适的高度 */
    }
    .lyrics-container-noFocus {
        margin-top: 5px;
        padding: 2px;
        height: calc(97.5vh - 240px); /* 设置合适的高度 */
    }
    .lyrics-container::-webkit-scrollbar {
        width: 0; /* 使滚动条不可见 */
    }
    .lyrics-line {
        padding:5px 10px;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.35);
        letter-spacing: 1px;
        border-radius: 10px;
        scroll-behavior: smooth;
        transition: 0.2s;
    }
    .lyrics-line:active{
        transform: scale(0.97);
    }

    .lyrics-line:not(.divide):hover{
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

    .gap{
        margin-top: 10px;
    }


    /*=================================================================================*/
    /*=================================================================================*/
    .song-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 4;
        padding: 5px;
        position: sticky;
        top: 0;
        overflow: hidden;
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
        width: 95%;
        height: 68%;
        border-radius: 18px;
        overflow: hidden;
        user-select: none;
        user-drag: none;
    }

    .cover {
        transition: 0.5s;
        max-width: 95%;
        max-height: 95%;
        object-fit: contain;
        border-radius: 18px;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    }
    .cover:active {
        transform: scale(0.9);
    }

    .threeInfo-container {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        height: 32%;
        width: 95%;
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
        font-size: 30px;
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
