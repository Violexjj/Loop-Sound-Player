<template>
    <div class="artist-detail-container route-container unselectable">
        <div class="left-content">
            <div class="artistDetailHeader">
                <div class="header-content">
                    <h1 class="centered">{{ truncateText(artist.name, 140) }}</h1>
                </div>
            </div>
            <div class="cover-container centered2">
                <div class="cover">
                    <img :src="this.$store.state.nowArtistCover" alt="cover" class="artistImg">
                </div>
            </div>
        </div>

        <div class="songs-list ">
            <ul>
                <li class="songOfArtist" v-for="(song, index) in artist.songs" :key="song.id"
                    @dblclick="changeQueueAndPlay(artist.songs, index);clearShuffledIndex()">
                    {{ truncateText((song.title + " - " + song.artist), 500) }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { mix1, mix5, textTruncateMixin ,clearShuffledIndex} from '../mixin'

    export default {
        name: 'ArtistDetail',
        mixins: [mix1, mix5, textTruncateMixin,clearShuffledIndex],
        props: ['artist']
    };
</script>

<style scoped>
    .songOfArtist {
        cursor: pointer;
        transition: background-color 0.1s ease;
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
    .songOfArtist:hover {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 30px;
    }

    .artist-detail-container {
        display: flex;
        flex-direction: row;
    }

    .left-content {
        flex:0.5;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-left: 50px;
        gap: 20px;
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
    .artistImg {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 20px;
    }

    .artistDetailHeader {
        flex: 0 0 auto;
        margin-top: 30px;
    }

    .songs-list {
        flex: 1;
        padding: 10px;
        margin-left: 50px;
        margin-top: 50px;
        overflow-y: auto; /* 添加滚动条 */
        overflow-x: auto; /* 添加滚动条 */
    }

    .centered {
        margin: 10px;
    }

    .centered2 {
        margin: 30px;
    }
</style>
