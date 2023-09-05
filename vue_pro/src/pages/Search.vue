<template>
    <div class="search-results route-container">
        <h1 v-if="searchResults.searchedSongs.length === 0
        &&searchResults.searchedArtists.length === 0
        && searchResults.searchedAlbums.length === 0">
            未找到和相关内容</h1>
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
                            @click="clearShuffledIndex();changeQueueAndPlay(song,0)"
                    >
                        <div class="song-item song-title ellipsis">  {{ song.title }}</div>
                        <div class="song-item song-artist ellipsis">{{ song.artist}}</div>
                    </div>
                </div>
            </div>
        </div>





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
                            @click="displayAlbumDetail(album);changeAlbumCover(album.songs[0].albumCoverPath)"
                    >
                        <div class="song-item song-title ellipsis">  {{ album.name }}</div>
                        <div class="song-item song-artist ellipsis">{{ album.songs[0].artist}}</div>
                    </div>
                </div>
            </div>
        </div>
<!--search返回的album对象，name是faded，path是alen walker - faded   -->


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
                            @click="displayAlbumDetail(artist);changeAlbumCover(artist.songs[0].albumCoverPath)"
                    >
                        <div class="song-item song-title ellipsis">  {{ artist.name }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState,mapActions } from 'vuex';
    import {clearShuffledIndex, mix2, mix4, mix5, textTruncateMixin} from "@/mixin";

    export default {
        name: 'Search',
        props: ['search'],
        methods : {
            changeQueueAndPlay(song, index) {
                const songs = [song]
                this.$store.commit('CHANGE_QUEUE_AND_PLAY', { songs, index });
                if (this.$store.state.toHomeAfterChangeQueue) {
                    this.$router.push({ name: 'Home' });
                }
            },
            async changeAlbumCover(albumCoverPath){
                this.$store.state.nowAlbumCover = await myAPI.getSongCover(albumCoverPath)
            },
            async changeArtistCover(artistCoverPath){
                this.$store.state.nowArtistCover = await myAPI.getSongCover(artistCoverPath)
            }
        },
        computed: {
            ...mapState(['searchResults']),
        },
        mixins : [mix2, mix4, textTruncateMixin,clearShuffledIndex]
    };
</script>

<style scoped>
    .titlecss{
        padding-left: 15px;
    }
    .song-item {
        flex: 1;
        padding: 6px;
    }
    .song-title,
    .song-artist{
        flex: 1;
        padding: 10px;
    }
    .song-row {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 10px 0;
    }
    .song-row:hover{
        background-color: rgba(255, 255, 255, 0.3); /* 鼠标悬停时的背景颜色 */
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
    .ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }


    .route-container {
        max-height: calc(97vh - 280px); /* 100px 是顶部导航栏和底部控制栏的总高度 */
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
    }

    .song-list,
    .album-list,
    .artist-list {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        width: 100%;
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    .song-item,
    .album,
    .artist {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 150px;
    }

    .song-cover-container,
    .album-cover-container,
    .artist-cover-container {
        width: 100px;
        height: 100px;
        border-radius: 10px;
        overflow: hidden;
    }

    .song-cover,
    .album-cover,
    .artist-cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        cursor: pointer;
        transition: opacity 0.2s ease; /* 添加过渡效果 */
    }
    .song-cover:hover,
    .album-cover:hover,
    .artist-cover:hover{
        opacity: 0.5; /* 鼠标悬停时透明度增加 */
    }

    .song-details,
    .album-name,
    .artist-name {
        margin-top: 10px;
        text-align: left;
        width: 100%;
    }

    .divider {
        width: 100%;
        border: none;
        border-top: 3px solid #ccc;
        margin: 10px 0;
    }
    .song-artist{
        font-size: 14px;
    }
</style>
