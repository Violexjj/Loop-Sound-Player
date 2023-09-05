import {mapGetters} from "vuex";

export const mix1 = {
    //从alen walker - faded获取真正的专辑名：faded
    methods : {
        getAlbumName(album) {
            const parts = album.split("-");
            return parts.length > 1 ? parts[1].trim() : album.trim();
        }
    }
}
export  const mix2 = {
    //根据artist，点击后跳转到歌手详情界面，artist有name和数组songs
    methods: {
        displayArtistDetail(artist) {
            this.$router.push({
                name: 'ArtistDetail',
                params: {
                    artist: artist
                }
            });
        }
    }
}
export  const mix4 = {
    //根据album，点击后跳转到专辑详情界面，album有name和数组songs
    methods: {
        displayAlbumDetail(album) {
            this.$router.push({
                name: 'AlbumDetail',
                params: {
                    album: album
                }
            });
        }
    }
}
export  const mix3 = {
    //获取正在播放的歌曲信息
    computed : {
        ...mapGetters(['nowSong'])
    }
}

export  const mix5 = {
    //改变播放模式并播放
    methods: {
        changeQueueAndPlay(songs, index) {
            if (this.$store.state.selectMode) {
                return
            }
            this.$store.commit('CHANGE_QUEUE_AND_PLAY', { songs, index });
            if (this.$store.state.toHomeAfterChangeQueue) {
                this.$router.push({ name: 'Home' });
            }
        }
    }
}
export  const clearShuffledIndex = {
    //改变播放模式并播放
    methods: {
        clearShuffledIndex() {
            if (this.$store.state.selectMode) {
                return
            }
            this.$store.commit('CLEAR_SHUFFLED_INDEX');
        }
    }
}
//对文本长度的处理
export const textTruncateMixin = {
    methods: {
        truncateText(text, maxWidth) {
            const ellipsisWidth = 30; // 宽度用于省略号的预估值
            const availableWidth = maxWidth - ellipsisWidth;

            if (text.length * 8 > availableWidth) {
                const truncatedText = text.substring(0, Math.floor(availableWidth / 8)) + '...';
                return truncatedText;
            }

            return text;
        }
    }
}

