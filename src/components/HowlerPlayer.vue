<template>
    <div v-show="needMagic" class="need-magic">
        {{ `访问网易云歌词失败，可能网络有问题` }}
    </div>
</template>

<script>
    import { Howl } from 'howler';
    import { mapState, mapGetters } from 'vuex';
    import axios from 'axios'
    import { WebAudioApi } from './WebAudioApi';

    export default {
        name: 'HowlerPlayer',
        computed: {
            currentLyricIndex(){
                return this.$store.state.currentLyricIndex
            },
            currentPlayTime(){
                return this.$store.state.currentPlayTime
            },
            keywords(){
                return this.nowSong.title+this.nowSong.artist
            },
            ...mapState(['playNextSongs','nextSongs','nextSongsIndex','lyricOfNowSong','isPlaying', 'volume','modeType','nowMode','isMute','savedCurrentPlaytime']),
            ...mapGetters(['nowSong']),
            currentProgress() {
                return this.$store.state.currentProgress;
            },
        },
        data() {
            return {
                howlerInstance: null,
                progressUpdateInterval: null,
                isInitializing: true,
                oLyric: "",
                tLyric:"",
                needMagic:false,
                paused: true,
                parsedLyrics: [],
                webAudioApi: null,
                analyser: null,
                spectrumInterval: null
            };
        },
        created() {
                myAPI.onForwardBack((_event,arg) => {
                    if (arg) {
                        this.handleFowardAndBack(true)
                    }else{
                        this.handleFowardAndBack(false)
                    }
                })
                this.isInitializing = true,
                this.$bus.$on('changeProgress', newProgress => {
                // 在这里更新howlerPlayer组件的播放进度
                this.changeProgress(newProgress);
            });
        },
        mounted() {
            this.$bus.$on('changeEQ',(EQParam)=>{
                if (this.webAudioApi) {
                    console.log(EQParam)
                    this.webAudioApi.updateEQ(EQParam)
                }
            })
        },
        watch: {
            nowSong: {
                immediate : true,
                handler(newSong) {
                    if (this.nowSong) {
                        myAPI.sendLyric(newSong.title+" - "+newSong.artist, null)
                        if (!this.$store.state.notChangeNextSong) {
                            this.playAudio(newSong.path,newSong.id);
                        }else{
                            this.$store.state.notChangeNextSong = false
                        }
                    }
                },
            },
            isPlaying: {
                handler(isPlaying) {
                    myAPI.sendToggle(Math.floor(this.$store.state.currentProgress)/100,isPlaying)
                    myAPI.openDeckTopLyric(null, this.$store.state.isPlaying)
                    if(this.howlerInstance){
                        if (isPlaying) {
                            if (this.$store.state.showSpectrum) {
                                this.analyseSpectrumData()
                            }
                            if (this.nowSong.path === this.$store.getters.nowSong.path) {
                                if (this.paused) {
                                    this.howlerInstance.play();
                                    this.paused =false
                                    this.howlerInstance.once('play', () => {
                                        this.howlerInstance.fade(0, this.volume/100,500)
                                    });
                                }else{
                                    this.howlerInstance.fade(0, this.volume/100,500)
                                }
                            }
                        } else {

                            if (this.nowSong.path === this.$store.getters.nowSong.path) {
                                this.howlerInstance.fade(this.volume / 100, 0, 500);
                                this.howlerInstance.once('fade', () => {
                                    if (!this.isPlaying) {
                                        this.howlerInstance.pause();
                                        this.paused = true
                                    }
                                });
                            }

                        }
                    }
                },
            },
            volume: {
                handler(newVolume) {
                    if (this.howlerInstance) {
                        this.howlerInstance.volume(newVolume / 100);
                    }
                },
            },
            isMute: {
                immediate: true,
                handler(newIsMute) {
                    if (this.howlerInstance) {
                        this.howlerInstance.mute(newIsMute);
                    }
                },
            },
            '$store.state.showSpectrum':{
                handler(value){
                    if (!value) {
                        clearInterval(this.spectrumInterval);
                        this.$store.state.dataArray = []
                    }else{
                        if (this.$store.state.isPlaying) {
                            this.analyseSpectrumData()
                        }
                    }
                }
            },
            '$store.state.lyricOfNowSong':{
                handler(newLyricText){
                    this.parsedLyrics = this.parseLyrics(newLyricText);
                    this.$store.state.homeLyric = this.parsedLyrics
                    this.$store.state.currentLyricIndex = 0
                    if (this.parsedLyrics[0].text1 !== "") {
                        if (this.parsedLyrics[0].hasTranslation) {
                            myAPI.sendLyric(this.parsedLyrics[0].text1, this.parsedLyrics[0].text2)
                        }else{
                            myAPI.sendLyric(this.parsedLyrics[0].text1, null)
                        }
                    }
                }
            },
            '$store.state.EQParam':{
                deep: true,
                handler(EQParam){
                    if (this.$store.state.useEQ) {
                        if (this.webAudioApi) {
                            this.webAudioApi.updateEQ(EQParam)
                        }
                    }
                }
            },
            '$store.state.useEQ':{
                handler(){
                    if (this.webAudioApi) {
                        if (this.$store.state.useEQ) {
                            this.webAudioApi.updateEQ(this.$store.state.EQParam)
                        }else{
                            this.webAudioApi.updateEQ([0,0,0,0,0,0,0,0,0,0])
                        }
                    }
                }
            },
            currentPlayTime(newTime) {
                this.updateCurrentLyricIndex();
            },
            currentLyricIndex(newVal) {
                    if (this.parsedLyrics[this.currentLyricIndex].text1 !== "" && this.$store.state.currentLyricIndex !== 0) {
                        if (this.parsedLyrics[this.currentLyricIndex].hasTranslation) {
                            myAPI.sendLyric(this.parsedLyrics[this.currentLyricIndex].text1, this.parsedLyrics[this.currentLyricIndex].text2)
                        }else{
                            myAPI.sendLyric(this.parsedLyrics[this.currentLyricIndex].text1, null)
                        }
                    }
            },
        },
        methods: {
            updateCurrentLyricIndex() {
                // 根据当前播放时间更新当前歌词行的索引
                for (let i = 0; i < this.parsedLyrics.length - 1; i++) {
                    if (this.parsedLyrics[i + 1] && this.currentPlayTime >= this.parsedLyrics[i].time && this.currentPlayTime < this.parsedLyrics[i + 1].time) {
                        this.$store.state.currentLyricIndex = i;
                        break;
                    }
                }
                // 处理最后一行歌词
                const lastIndex = this.parsedLyrics.length - 1;
                if (this.currentPlayTime >= this.parsedLyrics[lastIndex].time) {
                    this.$store.state.currentLyricIndex = lastIndex;
                }
            },
            parseLyrics(lyricsText) {
                const lines = lyricsText.split('\n');
                const lyrics = [];


                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    let matches
                    if (this.$store.state.matchBlank) {
                        matches = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
                    }else{
                        matches = line.match(/\[(\d+):(\d+\.\d+)\](.+)/);
                    }


                    if (matches) {
                        const minute = parseInt(matches[1]);
                        const second = parseFloat(matches[2]);
                        const time = minute * 60 + second;
                        const text = matches[3].trim();

                        const xiegangcount = text.match(/[^ ] \/ [^ ]/g);
                        const parts = text.split(" / ");

                        if (xiegangcount && xiegangcount.length === 1 && (parts.length === 2 && parts[0].trim() !== "" && parts[1].trim() !== "")) {
                            // 有斜杠，这行歌词是原文和译文在同一行
                            const [originalText, translatedText] = text.split(' / ');
                            lyrics.push({time, text1: originalText, text2: translatedText, hasTranslation: true});
                        }else{
                            // 这行歌词没有斜杠，可能是原文也可能是译文
                            const existingLyric = lyrics.find(lyric => lyric.time === time);
                            if (existingLyric) {
                                existingLyric.text2 = text;
                                existingLyric.hasTranslation = true;
                            } else {
                                lyrics.push({ time, text1: text, hasTranslation: false });
                            }
                            // if (previousTime === time) {
                            //     // 如果当前时间戳与上一行相同，则将当前文本视为译文，并与上一行的原文文本合并
                            //     lyrics.pop(); // 移除上一次添加的原文
                            //     const [originalText, translatedText] = [previousLine, text];
                            //     lyrics.push({ time, text1: originalText, text2: translatedText, hasTranslation: true });
                            // } else {
                            //     lyrics.push({ time, text1: text, hasTranslation: false });
                            // }
                        }
                    }
                }
                return lyrics;
            },
            showNeedMagic(){
                this.needMagic = true
                setTimeout(()=>{this.needMagic = false},5000)
            },
            handleFowardAndBack(flag) {
                if (this.howlerInstance && this.isPlaying && !this.$store.state.blockSpace) {
                    const currentTime = this.howlerInstance.seek();
                    const durationInSeconds = this.getDurationInSeconds();

                    if (!flag) {
                            const newTime = Math.max(currentTime - 3, 0);
                            this.howlerInstance.seek(newTime);
                            this.$store.commit('SET_CURRENT_PROGRESS', (newTime / this.howlerInstance.duration()) * 100);
                    } else {
                            const newTime = Math.min(currentTime + 3, this.howlerInstance.duration());
                            this.howlerInstance.seek(newTime);
                            this.$store.commit('SET_CURRENT_PROGRESS', (newTime / this.howlerInstance.duration()) * 100);
                    }
                }
            },
            changeProgress(newProgress) {
                if (this.howlerInstance && this.isPlaying) {
                    // 暂停正在播放的音频
                    this.howlerInstance.pause();

                    // 更新播放进度
                    const newCurrentTime = (newProgress / 100) * this.howlerInstance.duration();
                    this.howlerInstance.seek(newCurrentTime);

                    // 继续播放音频
                    this.howlerInstance.play();
                    this.$store.state.currentProgress = newProgress
                }else{
                    this.$store.state.isPlaying = true
                    this.howlerInstance.pause();
                    const newCurrentTime = (newProgress / 100) * this.howlerInstance.duration();
                    this.howlerInstance.seek(newCurrentTime);
                    this.$store.state.currentProgress = newProgress
                }
            },
            getDurationInSeconds() {
                if (this.nowSong) {
                    const durationParts = this.nowSong.duration.split(':');
                    const minutes = parseInt(durationParts[0]);
                    const seconds = parseInt(durationParts[1]);
                    const milliseconds = parseInt(durationParts[2]);
                    return minutes * 60 + seconds + milliseconds / 1000;
                }
            },
            startUpdatingProgress() {
                if (!this.howlerInstance) {
                    return;
                }
                const durationInSeconds = this.getDurationInSeconds();
                const newCurrentTime = (this.currentProgress / 100) * durationInSeconds;
                this.howlerInstance.seek(newCurrentTime);
            },
            startProgressUpdate() {
                this.progressUpdateInterval = setInterval(() => {
                    if (this.howlerInstance) {
                        const currentTime = this.howlerInstance.seek();
                        const durationInSeconds = this.getDurationInSeconds();
                        const newProgress = (currentTime / durationInSeconds) * 100;
                        if (!this.dragging) {
                            this.$store.commit('SET_CURRENT_PROGRESS', newProgress);
                        }
                    }
                }, 200);
            },
            // 根据 歌曲配置好的 id 来搜索歌词
            async getNetLyricByNetId(){
                console.log("当前播放歌曲ID是"+this.$store.state.nowSongNetId)
                try {
                        const lyricResult = await myAPI.searchLyric(this.$store.state.nowSongNetId)
                        console.log(lyricResult);
                        if (lyricResult.body.code === 200 && lyricResult.body.lrc!==undefined && lyricResult.body.lrc.lyric!=='') {
                            console.log("找到了在线歌词")
                            this.oLyric = lyricResult.body.lrc.lyric
                            if (lyricResult.body.tlyric) {
                                this.tLyric = lyricResult.body.tlyric.lyric
                            }
                            this.mergeLyric()
                        }else{
                            //    网易云这首歌没歌词
                            this.$store.state.lyricOfNowSong = "[00:00.00]根据精确匹配的 ID，该歌曲网易云无歌词"
                        }
                }catch (error){
                    console.log("访问网易云歌词失败，可能网络有问题");
                    this.showNeedMagic()
                    this.$store.state.lyricOfNowSong = "[00:00.00]查找在线歌词失败"
                }
            },
            //根据标题艺术家获取在线歌词
            async getNetLyric(){
                try {
                    const searchResult = await myAPI.searchSong(this.keywords)
                    console.log(searchResult);
                    if (searchResult.body.code === 200&&searchResult.body.result.songCount>0) {
                        const searchSongId = searchResult.body.result.songs[0].id
                        const lyricResult = await myAPI.searchLyric(searchSongId)
						console.log(lyricResult);
                        if (lyricResult.body.code === 200 && lyricResult.body.lrc!==undefined && lyricResult.body.lrc.lyric!=='') {
                            console.log("找到了在线歌词")
                            this.oLyric = lyricResult.body.lrc.lyric
                            if (lyricResult.body.tlyric) {
                                this.tLyric = lyricResult.body.tlyric.lyric
                            }
                            this.mergeLyric()
                        }else{
                        //    网易云这首歌没歌词
                            this.$store.state.lyricOfNowSong = "[00:00.00]该歌曲网易云无歌词"
                        }
                    }else{
                    //    通过别人的网站搜索结果是空的
                        this.$store.state.lyricOfNowSong = "[00:00.00]查找歌曲错误，可能网易云无此歌曲；或者请添加精确匹配"
                    }
                }catch (error){
                    console.log("访问网易云歌词失败，可能网络有问题");
                    this.showNeedMagic()
                    this.$store.state.lyricOfNowSong = "[00:00.00]查找在线歌词失败"
                }
            },
            // 下面方法对获取的在线歌词进行整理
            parseLRC(lrcText) {
                const lines = lrcText.split('\n');
                const lyrics = [];
                for (const line of lines) {
                    const matches = line.match(/\[(\d+:\d+\.\d+)\](.+)/);
                    if (matches) {
                        const time = matches[1];
                        const text = matches[2].trim();
                        lyrics.push({ time, text });
                    }
                }
                return lyrics;
            },
            //下面方法合并在线歌词原文和译文
            mergeLyric(){
                if (this.tLyric === "") {
                    // 没有翻译，直接赋值
                    this.$store.state.lyricOfNowSong = this.oLyric
                //    写入本地lrc文件
                    this.writeOnlineLrc(this.oLyric,this.$store.getters.nowSong.path)
                }else{
                    // 有翻译，合并原文和译文
                    const originalLyrics = this.parseLRC(this.oLyric);
                    const translatedLyrics = this.parseLRC(this.tLyric)
                    const translatedMap = new Map()
                    let mergedLyrics = ""

                    translatedLyrics.forEach(line => {
                        translatedMap.set(line.time, line.text)
                    })

                    for (let i = 0; i < originalLyrics.length; i++) {
                        const translatedText = translatedMap.get(originalLyrics[i].time)
                        if (translatedText !== null && translatedText !== "") {
                            const mergedLine = originalLyrics[i].text+(translatedText !== undefined?(" / "+translatedText):"")
                            const time = "["+originalLyrics[i].time+"]"
                            if (i === originalLyrics.length - 1) {
                                mergedLyrics += (time+mergedLine)
                            }else{
                                mergedLyrics += (time+mergedLine+"\n")
                            }
                        }
                    }
                    this.$store.state.lyricOfNowSong = mergedLyrics
                    //    写入本地lrc文件
                    this.writeOnlineLrc(mergedLyrics,this.$store.getters.nowSong.path)
                }
            },
            // 写入获取的在线歌词到本地
            writeOnlineLrc(onlineLrc, songPath){
                myAPI.writeOnlineLrc(onlineLrc, songPath,this.$store.state.lyricDirectory)
            },

            analyseSpectrumData() {
                clearInterval(this.spectrumInterval);
                const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

                const updateDataArray = () => {
                    this.analyser.getByteFrequencyData(dataArray);
                    const array = dataArray.slice(0, 200).filter((_, index) => index % 8 === 0);
                    const reversedArray = array.slice(1, 25).reverse();
                    this.$store.state.dataArray = [...reversedArray, ...array];
                };

                updateDataArray();

                this.spectrumInterval  = setInterval(updateDataArray, 50);
            },

            async playAudio(path,songId) {
                if (this.howlerInstance) {
                    this.howlerInstance.unload()
                    this.howlerInstance = null
                }
                const songAudioAndInfos = await myAPI.readFile(path,this.$store.state.lyricDirectory,songId)
                if (songAudioAndInfos === "[00:00.00]加载歌曲文件错误") {
                    this.$store.state.lyricOfNowSong = songAudioAndInfos
                    myAPI.closeWelcome()
                    return
                }
                if (songAudioAndInfos.length === 0) {
                    return
                }
                const songAudio = songAudioAndInfos[0]
                this.$store.state.moreInfoOfNowSong = songAudioAndInfos[1]

                // 当前歌曲的 netId
                    this.$store.state.nowSongNetId = songAudioAndInfos[3]

                // 获取歌词
                if (songAudioAndInfos[1].format !== "MPEG") {
                    //非mp3文件
                            if (songAudioAndInfos[2].lyrics[0].includes("没有找到本地歌词")) {
                                console.log("没有找到本地歌词")
                                if (this.$store.state.onlineLrc) {
                                    if (this.nowSong.title === "未知标题[ERROR]") {
                                        this.$store.state.lyricOfNowSong = "[00:00.00]未知标题，无法在线搜索歌词"
                                    }else{
                                        if (this.$store.state.nowSongNetId === -1) {
                                            await this.getNetLyric()
                                        }else{
                                            await this.getNetLyricByNetId()
                                        }
                                    }
                                }else{
                                    this.$store.state.lyricOfNowSong = "[00:00.00]无本地歌词，请开启在线搜索歌词功能"
                                }
                            }else{
                                this.$store.state.lyricOfNowSong= songAudioAndInfos[2].lyrics[0]
                                console.log("找到了本地歌词")
                            }
                }
                else{
                            //mp3文件
                            if (songAudioAndInfos[2].lyrics.includes("没有找到本地歌词")) {
                                console.log("没有找到本地歌词")
                                if (this.$store.state.onlineLrc) {
                                    if (this.nowSong.title === "未知标题[ERROR]") {
                                        this.$store.state.lyricOfNowSong = "[00:00.00]未知标题，无法在线搜索歌词"
                                    }else{
                                        if (this.$store.state.nowSongNetId === -1) {
                                            await this.getNetLyric()
                                        }else{
                                            await this.getNetLyricByNetId()
                                        }
                                    }
                                }else{
                                    this.$store.state.lyricOfNowSong = "[00:00.00]无本地歌词，请开启在线搜索歌词功能"
                                }
                            }else{
                                this.$store.state.lyricOfNowSong= songAudioAndInfos[2].lyrics
                                console.log("找到了本地歌词")
                            }
                }
                myAPI.closeWelcome()

                setTimeout(()=>{
                    this.$store.state.songDialogInfo= {
                        cover:this.$store.state.nowSongCover,
                        moreInfo: songAudioAndInfos[1],
                        nowSong: this.$store.getters.nowSong,
                        netId: songAudioAndInfos[3],
                    }
                    this.$store.state.nowSongDialogInfo={
                        cover:this.$store.state.nowSongCover,
                        moreInfo: songAudioAndInfos[1],
                        nowSong: this.$store.getters.nowSong,
                        netId: songAudioAndInfos[3],
                    }

                },1000)


                const blob = new Blob([songAudio], { type: 'audio/flac' });
                const blobUrl = URL.createObjectURL(blob);
                if (path !== this.$store.getters.nowSong.path) {
                    return
                }
                this.howlerInstance = new Howl({
                    src: [blobUrl],
                    format: ['flac'],
                    html5: true,
                    volume: this.volume / 100,
                    mute : this.isMute,
                    onend: () => {
                        this.$store.commit('SET_PLAYING_STATE', false);
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
                            if (this.modeType[this.nowMode] === '循环' || this.modeType[this.nowMode] === '无序') {
                                if (this.$store.state.queue.length === 1) {
                                    // 如果播放队列里只有一首歌，循环播放当前歌曲
                                    //this.$store.commit('CONTINUE_CURRENT_SONG')
                                    this.howlerInstance.play();
                                }
                                this.$store.dispatch('nextSong');
                                this.$bus.$emit('songOnTop')
                            }else if(this.modeType[this.nowMode] === '单曲'){
                                this.$store.state.isPlaying = true
                                this.howlerInstance.play();
                            }
                        }
                    },
                    // onplay: ()=>{
                    //     this.analyseSpectrum()
                    // }
                });

                    if (this.isPlaying) {
                        if (path === this.$store.getters.nowSong.path) {
                            this.howlerInstance.play();
                        }
                    }


                this.howlerInstance.once('play', () => {
                    this.startUpdatingProgress();
                    this.startProgressUpdate(); // Add this line
                });

                if (this.isInitializing) {
                    if (this.$store.state.savedCurrentPlaytime && path === this.$store.getters.nowSong.path) {
                        this.$store.commit('SET_CURRENT_PROGRESS', (this.$store.state.savedCurrentPlaytime / this.getDurationInSeconds()) * 100);
                        this.howlerInstance.seek(this.$store.state.savedCurrentPlaytime);

                        const audioCtx = Howler.ctx
                        const audioNode = this.howlerInstance._sounds[0]._node
                        this.webAudioApi = WebAudioApi.create(audioCtx, audioNode)
                        setTimeout(()=>{
                            if (this.$store.state.useEQ) {
                                this.webAudioApi.updateEQ(this.$store.state.EQParam)
                            }
                        },500)
                        this.analyser = this.webAudioApi.analyser
                        this.analyser.smoothingTimeConstant = 0.6
                        if (this.$store.state.showSpectrum) {
                            this.analyseSpectrumData()
                        }
                    }
                    this.isInitializing = false;
                }
            },

        },
    };
</script>

<style scoped>
    .need-magic {
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
</style>
