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
        async displayArtistDetail(artist) {
            await this.changeArtistCover(artist.songs,artist)
        }
    }
}
export  const mix4 = {
    //根据album，点击后跳转到专辑详情界面，album有name和数组songs
    methods: {
        async displayAlbumDetail(album) {
            await this.changeAlbumCover(album.songs,album)
        }
    }
}
export  const mix3 = {
    //获取正在播放的歌曲信息
    computed : {
        ...mapGetters(['nowSong'])
    }
}

export  const mix6 = {
    //修改专辑封面
    methods : {
        async changeAlbumCover(albumSongs,album){
            const path = albumSongs[0].path
            const coverData = await window.myAPI.getSongCover(path,1);
            // 更新封面
            this.$store.state.nowAlbumCover = coverData;
            this.$router.push({
                name: 'AlbumDetail',
                params: {
                    album: album,
                },
            });
        },
    }
}
export  const mix7 = {
    // 修改艺术家封面
    methods : {
        async changeArtistCover(artistSongs,artist){
            const randomIndex = (Math.floor(Math.random() * artistSongs.length));
            const path = artistSongs[randomIndex].path
            const coverData = await window.myAPI.getSongCover(path,1);
            // 更新封面
            this.$store.state.nowArtistCover = coverData;
            this.$router.push({
                name: 'ArtistDetail',
                params: {
                    artist: artist,
                },
            });
        },
    }
}

export  const mix5 = {
    //改变播放模式并播放
    methods: {

        setNextSongToPlay(song, index){
            if (this.$store.state.playNextSongs) {
                this.$store.state.notChangeNextSong = true
                this.$store.state.nextSongs.splice(this.$store.state.nextSongsIndex + 1, 0, song[index]);
            }else{
                this.$store.state.nextSongs.unshift(song[index])
            }
        },
        changeQueueAndPlay(songs, index) {
            if (this.$store.state.selectMode) {
                return
            }
            this.$store.state.playNextSongs = false
            this.$store.state.nextSongsIndex = -1
            this.$store.state.nextSongs = []
            this.$store.commit('CHANGE_QUEUE_AND_PLAY', { songs, index });
            this.$store.state.showContextMenu =false
            if (this.$store.state.toHomeAfterChangeQueue) {
                setTimeout(()=>{
                    this.$router.push({ name: 'Home' });
                },5)

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

