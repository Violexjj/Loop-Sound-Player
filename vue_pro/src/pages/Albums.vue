<template>
    <div class="music-library unselectable ">
        <div class="song-table " >
            <div class="song-table-header" :style="{ 'margin-right': scrollbarWidth + 'px' }">
                <div class="song-table-header-row">
                    <div class="song-title-head ellipsis"><b style="font-size: 20px">专 辑</b></div>
                    <div class="song-artist-head ellipsis"><b style="font-size: 20px">艺 术 家</b></div>
                </div>
            </div>

            <div class="song-table-body route-container" >
                <div
                        v-for="album in filteredSongs" :key="album.name"
                        class="song-row"
                        @click="displayAlbumDetail(album);changeAlbumCover(album.songs[0].albumCoverPath)"
                >
                    <div class="song-item song-title ellipsis">  {{ album.name }}</div>
                    <div class="song-item song-artist ellipsis">{{ album.songs[0].artist }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mix1, textTruncateMixin} from "@/mixin";
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: "Albums",
        computed : {
            ...mapGetters(['filteredSongs']),
            scrollbarWidth(){
                const div = document.createElement('div');
                div.style.width = '100px';
                div.style.height = '100px';
                div.style.overflow = 'scroll';
                div.style.position = 'absolute';
                div.style.top = '-9999px';
                document.body.appendChild(div);
                // 计算滚动条宽度
                const scrollbarWidth = div.offsetWidth - div.clientWidth;
                // 删除测试元素
                document.body.removeChild(div);
                return scrollbarWidth;
            },
        },
        mounted() {
            // 在导航切换进来时重新计算 filteredSongs
            this.$store.commit('SET_FILTER_TYPE','byAlbums')
        },
        methods : {
            displayAlbumDetail(album){
                console.log(album)
                this.$router.push({
                    name :'AlbumDetail',
                    params : {
                        album : album
                    }
                })
            },
            async changeAlbumCover(albumCoverPath){
                this.$store.state.nowAlbumCover = await myAPI.getSongCover(albumCoverPath)
            }
        },
        mixins : [mix1,textTruncateMixin]
    }
</script>

<style scoped>
    .music-library {
        overflow-x: hidden;
    }
    .route-container{
        max-height: calc(97vh - 300px); /* 260px 是顶部导航栏和底部控制栏的总高度 */
        overflow-y: scroll;
    }
    .song-table {
        width: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .song-table-header {
        padding: 11px;
        position: sticky;
        top: 0;
        z-index: 1;
        margin-bottom: 10px;
    }
    .song-table-header-row {
        display: flex;
        align-items: center;
    }
    .song-title-head,
    .song-artist-head{
        flex: 1;
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
    .song-item {
        flex: 1;
        padding: 6px;
        padding-left: 5px;
    }
    .song-title,
    .song-artist{
        flex: 1;
        padding: 6px;
    }
    .song-table-body {
        flex: 1;
        padding-right: 15px;
        margin-left: 5px;
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


</style>
