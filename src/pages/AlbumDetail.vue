<template>
    <div class="route-container unselectable">
        <h1 style="margin-left: 15px" class="centered">{{album.name}}</h1>

        <div class="album-detail-container">
                <div class="cover-container">
                    <div class="cover">
                        <img :src="this.$store.state.nowAlbumCover" alt="cover" class="albumImg">
                    </div>
                </div>

            <div class="songs-list">
                <ul>
                    <li class="songOfAlbum" v-for="(song, index) in album.songs" :key="song.id"
                        @dblclick="changeQueueAndPlay(album.songs, index);clearShuffledIndex()">
                        {{ (song.trackNumber ? song.trackNumber + '. ' : '#. ')+song.title + " - " + song.artist}}
                    </li>
                </ul>
            </div>
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
        padding: 15px;
        padding-left: 20px;
        border-radius: 10px;
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
        overflow: hidden;
    }
    .songOfAlbum:hover {
        background-color: rgba(255, 255, 255, 0.2); /* 鼠标悬停时的背景颜色 */
        border-radius: 10px;
    }

    .album-detail-container {
        height: calc(97vh - 280px);
        display: flex;
        flex-direction: row;
    }

    .cover-container {
        margin-left: 12px;
        margin-top: 40px;
        max-width: 300px;
        max-height: 300px;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
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
    .songs-list {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        overflow-x: auto;
        margin-left: 50px;
    }

    .centered {
        margin: 10px;
    }
</style>
