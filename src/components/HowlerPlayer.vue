<template>
    <div v-show="needMagic" class="need-magic">
        {{ `访问 https://net-lyrics.vercel.app 获取歌词失败，需要“魔法”。` }}
    </div>
</template>

<script>
    import { Howl } from 'howler';
    import { mapState, mapGetters } from 'vuex';
    import axios from 'axios'

    export default {
        name: 'HowlerPlayer',
        computed: {
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
                paused: true
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
        watch: {
            nowSong: {
                immediate : true,
                handler(newSong) {
                    if (this.nowSong) {
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
        },
        methods: {
            showNeedMagic(){
                this.needMagic = true
                setTimeout(()=>{this.needMagic = false},5000)
            },
            handleFowardAndBack(flag) {
                if (this.howlerInstance && this.isPlaying) {
                    const currentTime = this.howlerInstance.seek();
                    const durationInSeconds = this.getDurationInSeconds();

                    if (!flag) {
                            const newTime = Math.max(currentTime - 3, 0);
                            this.howlerInstance.seek(newTime);
                            this.$store.commit('SET_CURRENT_PROGRESS', (newTime / durationInSeconds) * 100);
                    } else {
                            const newTime = Math.min(currentTime + 3, durationInSeconds);
                            this.howlerInstance.seek(newTime);
                            this.$store.commit('SET_CURRENT_PROGRESS', (newTime / durationInSeconds) * 100);
                    }
                }
            },
            changeProgress(newProgress) {
                if (this.howlerInstance && this.isPlaying) {
                    // 暂停正在播放的音频
                    this.howlerInstance.pause();

                    // 更新播放进度
                    const durationInSeconds = this.getDurationInSeconds();
                    const newCurrentTime = (newProgress / 100) * durationInSeconds;
                    this.howlerInstance.seek(newCurrentTime);

                    // 继续播放音频
                    this.howlerInstance.play();
                }else{
                    this.$store.state.isPlaying = true
                    this.howlerInstance.pause();
                    const durationInSeconds = this.getDurationInSeconds();
                    const newCurrentTime = (newProgress / 100) * durationInSeconds;
                    this.howlerInstance.seek(newCurrentTime);

                    // 继续播放音频
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
                }, 1);
            },
            // 根据 歌曲配置好的 id 来搜索歌词
            async getNetLyricByNetId(){
                console.log("当前播放歌曲ID是"+this.$store.state.nowSongNetId)
                try {
                        const lyricResult = await myAPI.searchLyric(this.$store.state.nowSongNetId)
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
                    //    访问别人的网站失败
                    console.log("访问网易云歌词失败");
                    //    翻墙搜索自己的网站
                    try{
                            const lyricResult = await axios.get("https://net-lyrics.vercel.app/lyric?id="+this.$store.state.nowSongNetId,{timeout:5000})
                        if (lyricResult.data.code === 200 && lyricResult.data.lrc!==undefined) {
                                console.log("找到了在线歌词（net-lyrics.vercel.app）")
                                this.oLyric = lyricResult.data.lrc.lyric
                                if (lyricResult.data.tlyric) {
                                    this.tLyric = lyricResult.data.tlyric.lyric
                                }
                                this.mergeLyric()
                            }else{
                                //    网易云这首歌没歌词
                                this.$store.state.lyricOfNowSong = "[00:00.00]该歌曲网易云无歌词"
                            }
                    }catch(error){
                        console.log("访问 https://net-lyrics.vercel.app 失败");
                        this.showNeedMagic()
                        this.$store.state.lyricOfNowSong = "[00:00.00]没有找到在线歌词"
                    }
                }
            },
            //下面方法根据标题艺术家获取在线歌词
            async getNetLyric(){
                try {
                    // const searchResult = await axios.get("https://autumnfish.cn/cloudsearch?keywords="+this.keywords,{timeout:3000})
                    const searchResult = await myAPI.searchSong(this.keywords)
                    // console.log(searchResult);
                    if (searchResult.body.code === 200&&searchResult.body.result.songCount>0) {
                        const searchSongId = searchResult.body.result.songs[0].id
                        // const lyricResult = await axios.get("https://autumnfish.cn/lyric?id="+searchSongId)
                        const lyricResult = await myAPI.searchLyric(searchSongId)
                        // console.log(lyricResult)
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
                    //    访问别人的网站失败
                    console.log("访问网易云歌词失败，可能网络有问题");
                    //    翻墙搜索自己的网站
                    try{
                        const searchResult = await axios.get("https://net-lyrics.vercel.app/cloudsearch?keywords="+this.keywords,{timeout:5000})
                        if (searchResult.data.code === 200&&searchResult.data.result.songCount>0) {
                            const searchSongId = searchResult.data.result.songs[0].id
                            const lyricResult = await axios.get("https://net-lyrics.vercel.app/lyric?id="+searchSongId)
                            if (lyricResult.data.code === 200 && lyricResult.data.lrc!==undefined) {
                                console.log("找到了在线歌词（net-lyrics.vercel.app）")
                                this.oLyric = lyricResult.data.lrc.lyric
                                if (lyricResult.data.tlyric) {
                                    this.tLyric = lyricResult.data.tlyric.lyric
                                }
                                this.mergeLyric()
                            }else{
                                //    网易云这首歌没歌词
                                this.$store.state.lyricOfNowSong = "[00:00.00]该歌曲网易云无歌词"
                            }
                        }else{
                            //    通过自己的网站搜索结果是空的
                            this.$store.state.lyricOfNowSong = "[00:00.00]没有找到在线歌词"
                        }
                    }catch(error){
                        console.log("访问 https://net-lyrics.vercel.app 失败");
                        this.showNeedMagic()
                        this.$store.state.lyricOfNowSong = "[00:00.00]没有找到在线歌词"
                    }
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
                        netId: songAudioAndInfos[3]
                    }
                    this.$store.state.nowSongDialogInfo={
                        cover:this.$store.state.nowSongCover,
                        moreInfo: songAudioAndInfos[1],
                        nowSong: this.$store.getters.nowSong,
                        netId: songAudioAndInfos[3]
                    }

                },1000)


                const blob = new Blob([songAudio], { type: 'audio/flac' });
                const blobUrl = URL.createObjectURL(blob);
                this.howlerInstance = new Howl({
                    src: [blobUrl],
                    format: ['flac'],
                    volume: this.volume / 100,
                    mute : this.isMute,
                    onend: () => {
                        this.$store.commit('SET_PLAYING_STATE', false);
                        //                                                                                                        4
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
