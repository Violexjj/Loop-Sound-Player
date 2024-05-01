<template>
    <div class="music-library unselectable ">
        <div class="song-table " >
            <div class="song-table-header" :style="{ 'margin-right': scrollbarWidth + 'px' }">
                <div class="song-table-header-row">
                    <div class="song-cover-head ellipsis"><b style="font-size: 20px;margin-left: 5px">封 面</b></div>
                    <div class="song-title-head ellipsis"><b style="font-size: 20px">专 辑</b></div>
                    <div class="song-artist-head ellipsis"><b style="font-size: 20px">艺 术 家</b></div>
                </div>
            </div>

            <div class="song-table-body route-container">
                <div
                        v-for="album in filteredSongs" :key="album.name"
                        class="song-row"
                        @click="displayAlbumDetail(album)"
                        ref="songRows"
                >
                    <div class="cover-container">
                        <img :data-src="album.songs[0].path"  class="song-cover">
                    </div>
                    <div class="song-title ellipsis">  {{ album.name }}</div>
                    <div class="song-artist ellipsis">{{ album.songs[0].artist }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mix1, mix4, mix6, textTruncateMixin} from "@/mixin";
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: "Albums",
        data(){
            return{
                observer: null
            }
        },
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
        updated() {
            const observer = new IntersectionObserver(
                async (entries) => {
                    for (const entry of entries) {
                        if (entry.isIntersecting) {
                            const img = entry.target.childNodes[0].childNodes[0]
                            if (img && img.getAttribute('data-src')) {
                                img.src = await myAPI.getSongCover(img.getAttribute('data-src'),2)
                                img.style.opacity = 1
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
        mounted() {
            // 在导航切换进来时重新计算 filteredSongs
            // this.$store.commit('SET_FILTER_TYPE','byAlbums')
            const observer = new IntersectionObserver(
                async (entries) => {
                    for (const entry of entries) {
                        if (entry.isIntersecting) {
                            const img = entry.target.childNodes[0].childNodes[0]
                            if (img && img.getAttribute('data-src')) {
                                img.src = await myAPI.getSongCover(img.getAttribute('data-src'),2)
                                img.style.opacity = 1
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

        mixins : [mix1,mix4,mix6,textTruncateMixin]
    }
</script>

<style scoped>

    .music-library {
        overflow-x: hidden;
    }
    .route-container{
        max-height: calc(97vh - 250px);
        overflow-y: scroll;
    }
    .song-table {
        width: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .song-table-header {
        position: sticky;
        top: 0;
        z-index: 1;
        margin-bottom: 10px;
        padding-right: 12px;
    }
    .song-table-header-row {
        display: flex;
        align-items: center;
        padding: 2px 0;
    }
    .song-cover-head{
        flex: 0.2;
    }
    .song-title-head,
    .song-artist-head{
        flex: 1;
    }
    .song-row {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 5px 0;
        margin-right: 10px;
        margin-left: 3px;
        margin-bottom: 5px;
    }
    .song-row:hover{
        background-color: rgba(255, 255, 255, 0.2); /* 鼠标悬停时的背景颜色 */
        border-radius: 10px;
    }
    .song-title,
    .song-artist{
        flex: 1;
        padding-right: 5px;
    }
    .cover-container{
        height: 40px;
        flex: 0.2;
    }
    .song-cover{
        object-fit: contain;
        height: 100%;
        border-radius: 7px;
        margin-left: 5px;
        transition: 1s;
        opacity: 0;
    }
    .song-table-body::-webkit-scrollbar {
        width: 18px;
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
