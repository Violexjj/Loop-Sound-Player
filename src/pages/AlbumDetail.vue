<template>
    <div class="album-detail-container route-container unselectable">
        <div class="left-content">
            <div class="albumsDetailHeader">
                <div class="header-content">
                    <h1 class="centered">{{ truncateText(album.name, 140) }}</h1>
                </div>
            </div>
            <div class="cover-container centered2">
                <div class="cover">
                    <img :src="this.$store.state.nowAlbumCover" alt="cover" class="albumImg">
                </div>
            </div>
        </div>

        <div class="songs-list">
            <ul>
                <li class="songOfAlbum" v-for="(song, index) in album.songs" :key="song.id"
                    @dblclick="changeQueueAndPlay(album.songs, index);clearShuffledIndex()">
                    {{ truncateText((song.title + " - " + song.artist), 500) }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import {clearShuffledIndex, mix1, mix4, mix5, textTruncateMixin} from '../mixin'

    export default {
        name: 'AlbumDetail',
        computed: {
            ...mapState(['filteredSongs']),
        },

        // 使用混入获取专辑名
        mixins: [mix1, mix4, mix5, textTruncateMixin,clearShuffledIndex],
        // 接收用户点击的特定的专辑，从Albums传过来的
        props: ['album']
    };
</script>

<style scoped>
    .songOfAlbum {
        cursor: pointer;
        transition: background-color 0.1s ease; /* 添加过渡效果 */
        padding: 10px;
        padding-left: 20px;
        border-radius: 30px;
    }
    .songs-list::-webkit-scrollbar {
        width: 15px;
        background-color: rgba(0, 0, 0, 0); /* 设置为半透明的背景颜色 */
        border-radius: 10px;
    }

    /* 滚动条滑块 */
    .songs-list::-webkit-scrollbar-thumb {
        background-color: white; /* 设置滑块的颜色 */
        border-radius: 20px; /* 设置滑块的圆角 */
    }

    /* 滚动条轨道 */
    .songs-list::-webkit-scrollbar-track {
        background-color: rgba(255, 255, 255, 0); /* 设置轨道的颜色 */
    }
    .route-container{
        max-height: calc(97vh - 280px); /* 100px 是顶部导航栏和底部控制栏的总高度 */
        overflow: hidden;
    }
    .songOfAlbum:hover {
        background-color: rgba(255, 255, 255, 0.2); /* 鼠标悬停时的背景颜色 */
        border-radius: 30px;
    }

    .album-detail-container {
        display: flex;
        flex-direction: row;
    }

    .left-content {
        flex: 0.5;
        display: flex;
        flex-direction: column;
        padding-left: 50px;
        gap: 20px;
        align-items: center;
    }

    .header-content {
        display: flex;
        flex-direction: column;
    }

    .cover-container {
        max-width: 300px;
        max-height: 300px;
        border-radius: 20px;
        overflow: hidden;
    }

    .cover {
        width: 100%;
        height: 100%;
        border-radius: 20px;
        overflow: hidden;
    }

    .albumImg {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 20px;
    }

    .albumsDetailHeader {
        flex: 0 0 auto;
        margin-top: 30px;
    }

    .songs-list {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        overflow-x: auto; /* 添加滚动条 */
        margin-left: 50px;
        margin-top: 50px;
    }

    .centered {
        margin: 10px;
    }

    .centered2 {
        margin: 30px;
    }
</style>
