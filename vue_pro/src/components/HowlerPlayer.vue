<template>

</template>

<script>
    import { Howl } from 'howler';
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'HowlerPlayer',
        computed: {
            ...mapState(['isPlaying', 'volume','modeType','nowMode','isMute']),
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
            };
        },
        created() {
                this.isInitializing = true,
                this.$bus.$on('changeProgress', newProgress => {
                // 在这里更新howlerPlayer组件的播放进度
                this.changeProgress(newProgress);
            });
        },
        mounted() {
            // 监听键盘事件
            window.addEventListener('keydown', this.handleKeyDown);
        },
        beforeDestroy() {
            // 移除键盘事件监听器，以防止内存泄漏
            window.removeEventListener('keydown', this.handleKeyDown);
        },
        watch: {
            nowSong: {
                immediate : true,
                handler(newSong) {
                    if (this.nowSong) {
                        this.playAudio(newSong.path);
                    }

                },
            },
            isPlaying: {
                handler(isPlaying) {
                    if(this.howlerInstance){
                        if (isPlaying) {
                            if (this.nowSong.path === this.$store.getters.nowSong.path) {
                                this.howlerInstance.play();
                            }
                        } else {
                            if (this.nowSong.path === this.$store.getters.nowSong.path) {
                                this.howlerInstance.pause();
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
            handleKeyDown(event) {
                if (this.howlerInstance && this.isPlaying) {
                    const currentTime = this.howlerInstance.seek();
                    const durationInSeconds = this.getDurationInSeconds();

                    if (event.key === 'ArrowLeft') {
                        // 快退一秒
                        const newTime = Math.max(currentTime - 3, 0);
                        this.howlerInstance.seek(newTime);
                        this.$store.commit('SET_CURRENT_PROGRESS', (newTime / durationInSeconds) * 100);
                    } else if (event.key === 'ArrowRight') {
                        // 快进一秒
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
            async playAudio(path) {
                if (this.howlerInstance) {
                    this.howlerInstance.unload()
                    this.howlerInstance = null
                }
                const songAudioAndInfos = await myAPI.readFile(path)
                const songAudio = songAudioAndInfos[0]
                this.$store.state.moreInfoOfNowSong = songAudioAndInfos[1]
                if (songAudioAndInfos[1].format !== "MPEG") {
                    this.$store.state.lyricOfNowSong= songAudioAndInfos[2].lyrics[0]
                }else{
                    this.$store.state.lyricOfNowSong= songAudioAndInfos[2].lyrics
                }
                const blob = new Blob([songAudio], { type: 'audio/flac' });
                const blobUrl = URL.createObjectURL(blob);

                this.howlerInstance = new Howl({
                    src: [blobUrl],
                    format: ['flac'],
                    volume: this.volume / 100,
                    mute : this.isMute,
                    onend: () => {
                        this.$store.commit('SET_PLAYING_STATE', false);
                        if (this.modeType[this.nowMode] === '循环' || this.modeType[this.nowMode] === '无序') {
                            if (this.$store.state.queue.length === 1) {
                                // 如果播放队列里只有一首歌，循环播放当前歌曲
                                //this.$store.commit('CONTINUE_CURRENT_SONG')
                                this.howlerInstance.play();
                            }
                                this.$store.dispatch('nextSong');
                                this.$store.commit('CLEAR_SHUFFLED_INDEX')
                                this.$bus.$emit('songOnTop')
                        }else if(this.modeType[this.nowMode] === '单曲'){
                            this.$store.state.isPlaying = true
                            this.howlerInstance.play();
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
                    this.isInitializing = false;
                }
            },

        },
    };
</script>

<style scoped>

</style>
