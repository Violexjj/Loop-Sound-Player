<template>
    <div class="search-results route-container">
        <h1 v-if="searchResults.searchedSongs.length === 0
        &&searchResults.searchedArtists.length === 0
        && searchResults.searchedAlbums.length === 0"
        class="notFound">
            未找到相关内容</h1>
<!--        歌曲-->
        <div v-if="searchResults.searchedSongs.length > 0" class="section">
            <div class="titlecss">
                <h1 class="section-title">歌 曲</h1>
            </div>

            <hr class="divider">
            <br>

            <div class="song-table " >
                <div class="song-table-body" >
                    <div
                            v-for="song in searchResults.searchedSongs" :key="song.name"
                            class="song-row"
                            @dblclick="clearShuffledIndex();changeQueueAndPlay(song,0)"
                            @contextmenu="showPlaylistModal = true;chooseSong(song)"
                            ref="songRows"
                    >
                        <div class="cover-container">
                            <img :data-src="song.path"  class="song-cover">
                        </div>
                        <div class="song-item song-title ellipsis">  {{ song.title }}</div>
                        <div class="song-item song-artist ellipsis">{{ song.artist}}</div>
                    </div>
                </div>
            </div>
        </div>
<!--        选项框-->
        <div v-if="showPlaylistModal" class="modal">

            <div class="playlist-panel">
                <!-- 关闭按钮 -->
                <span style="margin-left: 10px;font-weight: bold;font-size: 25px">添加至播放列表</span>
                <div class="modal-close" @click="showPlaylistModal = false">
                    <div class="close-button ">
                        <img src="../assets/close.png" alt="close" class="close-image">
                    </div>
                </div>
                <!-- 选项列表内容 -->
                <div class="playlist-options">
                    <div v-for="playlist in playlists" :key="playlist.name" class="playlist-option"
                         @click="addToPlaylist(playlist.name)">
                        {{ playlist.name }}
                    </div>
                </div>
            </div>
        </div>
<!--        专辑-->
        <div v-if="searchResults.searchedAlbums.length > 0" class="section">
            <div class="titlecss">
                <h1 class="section-title">专 辑</h1>
            </div>

            <hr class="divider">
            <br>

            <div class="song-table " >
                <div class="song-table-body" >
                    <div
                            v-for="album in searchResults.searchedAlbums" :key="album.name"
                            class="song-row"
                            @click="displayAlbumDetail(album)"
                            ref="songRows"
                    >
                        <div class="cover-container">
                            <img :data-src="album.songs[0].path"  class="song-cover">
                        </div>
                        <div class="song-item song-title ellipsis">  {{ album.name }}</div>
                        <div class="song-item song-artist ellipsis">{{ album.songs[0].artist}}</div>
                    </div>
                </div>
            </div>
        </div>
<!--        艺术家-->
        <div v-if="searchResults.searchedArtists.length > 0" class="section">
            <div class="titlecss">
                <h1 class="section-title">艺 术 家</h1>
            </div>
            <hr class="divider">
            <br>
            <div class="song-table " >
                <div class="song-table-body" >
                    <div
                            v-for="artist in searchResults.searchedArtists" :key="artist.name"
                            class="song-row"
                            @click="displayArtistDetail(artist)"
                            ref="songRows"
                    >
                        <div class="cover-container">
                            <img :data-src="artist.songs[0].path"  class="song-cover">
                        </div>
                        <div class="song-item song-title ellipsis">  {{ artist.name }}</div>
                        <div class="song-item song-title ellipsis">  {{ getArtistSongsTitle(artist.name)}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>



<style scoped>
    .cover-container{
        height: 40px;
        flex: 0.2;
        padding-right: 5px;
    }
    .song-cover{
        object-fit: contain;
        height: 100%;
        border-radius: 7px;
        margin-left: 5px;
    }
    .notFound{
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        font-size: 50px;
        letter-spacing: 5px;
    }
    .playlist-options {
        margin-top: 20px;
    }
    .playlist-option{font-weight: bold;
        padding: 10px;
        border-radius: 10px;
    }
    .playlist-option:hover{
        cursor: pointer;
        background-color: white; /* 鼠标悬停时的背景颜色 */
        border-radius: 10px;
        color: black;
    }
    .close-image {
        width: 100%;
        height: 100%;
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
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
    .close-button:hover {
        background-color: rgba(255, 255, 255, 0.4);
    }
    .modal-close {
        position: absolute;
        top: 10px;
        right: 10px;
        color: white;
        cursor: pointer;
        border-color: white;

    }
    .playlist-panel {
        background-color: rgba(0, 0, 0, 1);
        border-radius: 10px;
        padding: 10px;
        width: 80%;
        max-width: 400px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0);
        position: relative;
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
    .titlecss{
        padding-left: 15px;
    }

    .song-title,
    .song-artist{
        flex: 1;
    }
    .ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .song-row {
        width: 96%;
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 5px 0;
        transition: 0.1s;
    }
    .song-row:hover{
        background-color: rgba(255, 255, 255, 0.2); /* 鼠标悬停时的背景颜色 */
        border-radius: 10px;
    }
    .song-table-body {
        flex: 1;
        padding-right: 15px;
        margin-left: 5px;
    }
    .song-table {
        width: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .song-table-body::-webkit-scrollbar {
        width: 20px;
        background-color: rgba(0, 0, 0, 0); /* 设置为半透明的背景颜色 */
        border-radius: 10px;
    }
    .song-table-body::-webkit-scrollbar-thumb {
        background-color: white; /* 设置滑块的颜色 */
        border-radius: 20px; /* 设置滑块的圆角 */
    }
    .song-table-body::-webkit-scrollbar-track {
        background-color: rgba(255, 255, 255, 0); /* 设置轨道的颜色 */
    }



    .route-container {
        max-height: calc(97vh - 260px); /* 100px 是顶部导航栏和底部控制栏的总高度 */
        overflow-y: auto;
    }
    .search-results {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding-bottom: 50px;
    }
    .search-results::-webkit-scrollbar {
        width: 15px;
        background-color: rgba(0, 0, 0, 0); /* 设置为半透明的背景颜色 */
        border-radius: 10px;
    }

    /* 滚动条滑块 */
    .search-results::-webkit-scrollbar-thumb {
        background-color: white; /* 设置滑块的颜色 */
        border-radius: 20px; /* 设置滑块的圆角 */
    }

    /* 滚动条轨道 */
    .search-results::-webkit-scrollbar-track {
        background-color: rgba(255, 255, 255, 0); /* 设置轨道的颜色 */
    }

    .section {
        margin-top: 20px;
        width: 100%;
    }

    .section-title {
        font-weight: bold;
        margin-bottom: 20px;
        color: white;
    }
    .divider {
        width: 95%;
        border: none;
        border-radius: 100px;
        border-top: 10px solid white;
        margin: 10px 0;
    }
    .song-artist{
        font-size: 14px;
    }
</style>
<script>
    import {mapState, mapActions, mapMutations} from 'vuex';
    import {clearShuffledIndex, mix2, mix4, mix5, mix6, mix7, textTruncateMixin} from "@/mixin";

    export default {
        name: 'Search',
        data(){
            return {
                showPlaylistModal : false,
                chosenSong : null,
                observer: null
            }
        },
        mounted() {
            const observer = new IntersectionObserver(
                async (entries) => {
                    for (const entry of entries) {
                        if (entry.isIntersecting) {
                            const img = entry.target.childNodes[0].childNodes[0]
                            if (img && img.getAttribute('data-src')) {
                                img.src = await myAPI.getSongCover(img.getAttribute('data-src'),2)
                                observer.unobserve(entry.target);
                            }
                        }
                    }
                },
                { rootMargin: '0px', threshold: 0.1 }
            );

            this.$nextTick(() => {
                const songRows = this.$refs.songRows;
                if (songRows && songRows.length) {
                    songRows.forEach((row) => {
                        observer.observe(row);
                    });
                }
            });
        },
        updated() {
            const observer = new IntersectionObserver(
                async (entries) => {
                    for (const entry of entries) {
                        if (entry.isIntersecting) {
                            const img = entry.target.childNodes[0].childNodes[0]
                            if (img && img.getAttribute('data-src')) {
                                img.src = await myAPI.getSongCover(img.getAttribute('data-src'),2)
                                observer.unobserve(entry.target);
                            }
                        }
                    }
                },
                { rootMargin: '0px', threshold: 0.1 }
            );

            this.$nextTick(() => {
                const songRows = this.$refs.songRows;
                if (songRows && songRows.length) {
                    songRows.forEach((row) => {
                        observer.observe(row);
                    });
                }
            });
        },
        props: ['search'],
        methods : {
            ...mapMutations(['ADD_TO_PLAYLIST']),
            chooseSong(song){
                this.chosenSong = song
            },
            addToPlaylist(playlistName){
                const toAddSongsId = [];
                toAddSongsId.push(this.chosenSong.id);
                this.ADD_TO_PLAYLIST({ playlistName, songIds: toAddSongsId });
                this.showPlaylistModal = false;
                myAPI.addToOrDeleteFromPlaylist(playlistName,toAddSongsId,true)
            },
            getArtistSongsTitle(artistName) {
                const artist = this.searchResults.searchedArtists.find(artist => artist.name === artistName);
                if (artist) {
                    const titles = artist.songs.map(song => song.title);
                    return titles.join(' · ');
                }
                return '';
            },
            changeQueueAndPlay(song, index) {
                const songs = [song]
                this.$store.commit('CHANGE_QUEUE_AND_PLAY', { songs, index });
                if (this.$store.state.toHomeAfterChangeQueue) {
                    this.$router.push({ name: 'Home' });
                }
            },

        },
        computed: {
            ...mapState(['searchResults','playlists']),
        },
        mixins : [mix2, mix4, textTruncateMixin,clearShuffledIndex,mix6,mix7]
    };
</script>
