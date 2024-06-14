<template>
    <div class="music-library unselectable ">
        <div class="main route-container">
            <div class="main2">
                <div class="album"
                     @click="displayAlbumDetail(album)"
                     ref="songRows"
                     v-for="album in filteredSongs"
                     :key="album.name">
                    <div class="album-box">
                        <div class="cover-container">
                            <img :data-src="album.songs[0].path"  class="rounded-image">
                        </div>
                        <div class="album-name" style="font-size: 20px;margin-top: 8px">{{album.name}} </div>
                        <div class="album-name" style="font-size: 15px;margin-top: 5px;font-weight: normal">{{album.songs[0].artist}} </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
    .music-library {
        overflow-x: hidden;
    }
    .main{
        padding: 5px;
        display: flex;
    }
    .main2 {
        margin-right: 5px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 5px;
    }
    .route-container {
        max-height: calc(97vh - 223px);
        overflow-y: auto;
    }
    .album-box{
        display: flex;
        align-items: center;
        flex-direction: column;
        width: 160px;
        height: 180px;
        transition: 0.4s;
        padding-top: 16px;
        padding-bottom: 8px;
        border-radius: 15px;
    }
    .album-box:hover{
        background-color:rgba(255, 255, 255, 0.2);
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
        cursor: pointer;
    }
    .album-box:hover .rounded-image {
        width: 125%;
        height: 125%;
    }
    .route-container::-webkit-scrollbar {
        width: 18px;
        background-color: rgba(0, 0, 0, 0); /* 设置为半透明的背景颜色 */
        border-radius: 10px;
    }
    .route-container::-webkit-scrollbar-thumb {
        background-color: white; /* 设置滑块的颜色 */
        border-radius: 20px; /* 设置滑块的圆角 */
    }
    .route-container::-webkit-scrollbar-track {
        background-color: rgba(255, 255, 255, 0); /* 设置轨道的颜色 */
    }
    .album {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .cover-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 120px;
        height: 120px;
        border-radius: 15px;
        overflow: hidden;
    }

    .rounded-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 1s, width 0.3s, height 0.3s;
        opacity: 0;
    }

    .album-name {
        width: 80%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        font-weight: bold;
        letter-spacing: 1px;
        text-align: center;
    }
</style>

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
                            const img = entry.target.childNodes[0].childNodes[0].childNodes[0]
                            if (img && img.getAttribute('data-src')) {
                                img.src = await myAPI.getSongCover(img.getAttribute('data-src'),3)
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
                            const img = entry.target.childNodes[0].childNodes[0].childNodes[0]
                            if (img && img.getAttribute('data-src')) {
                                img.src = await myAPI.getSongCover(img.getAttribute('data-src'),3)
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
