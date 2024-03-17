<template>
    <div class=" route-container unselectable">
        <h1 style="margin-left: 15px" class="centered">{{artist.name}}</h1>

        <div class="artist-detail-container">
                <div class="cover-container ">
                    <div class="cover">
                        <img :src="this.$store.state.nowArtistCover" alt="cover" class="artistImg">
                    </div>
                </div>

            <div class="songs-list">
                <ul>
                    <li class="songOfArtist" v-for="(song, index) in artist.songs" :key="song.id"
                        @dblclick="changeQueueAndPlay(artist.songs, index);clearShuffledIndex()">
                        {{song.title + " - " + song.artist}}
                    </li>
                </ul>
            </div>
        </div>

    </div>
</template>
<style scoped>
    .songOfArtist {
        cursor: pointer;
        transition: background-color 0.1s ease;
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
        overflow-y: hidden
    }
    .songOfArtist:hover {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
    }

    .artist-detail-container {
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
    .artistImg {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 20px;
    }

    .songs-list {
        flex: 1;
        padding: 10px;
        margin-left: 50px;
        overflow-y: auto; /* 添加滚动条 */
        overflow-x: auto; /* 添加滚动条 */
    }

    .centered {
        margin: 10px;
    }
</style>
<script>
    import { mapState } from 'vuex';
    import { mix1, mix5, textTruncateMixin ,clearShuffledIndex} from '../mixin'

    export default {
        name: 'ArtistDetail',
        mixins: [mix1, mix5, textTruncateMixin,clearShuffledIndex],
        props: ['artist']
    };
</script>


