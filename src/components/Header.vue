<!--霞鹜文楷 GB-->
<template>
    <div class="image-and-buttons">
        <div class="button-container">
            <div :class="{ 'active': isActive('Search') }" @click="displaySearch" class="search-button">
                <div class="horizontal-container">
                    <img src="../assets/search.png" alt="Logo" class="searchIco">
                    <input type="text" v-model="search"
                           @keyup.enter="sendSearchKeyword();displaySearch();setFilterType('bySearch')"
                           @focus="blockSpace(true)"
                           @blur="search = '';blockSpace(false)"
                            ref="search"
                    >
                </div>
            </div>

            <div :class="{ 'active': isActive('Home')}" @click="displayHome" class="nav-button unselectable">
                <img class="header-img" src="../assets/home.png">
                <b>主 页</b>
            </div>
            <div :class="{ 'active': isActive('Library') }" @click="displayLibrary()" class="nav-button unselectable"><img class="header-img" src="../assets/library.png"><b>音 乐 库</b></div>
            <div :class="{ 'active': isActive(['Playlists', 'SongsInPlaylist']) }" @click="displayPlaylists" class="nav-button unselectable">
                <img class="header-img" src="../assets/playlist4.png">
                <b>播 放 列 表</b>
            </div>
            <div v-show="$store.state.showAlbums" :class="{ 'active': isActive(['Albums', 'AlbumDetail']) }" @click="displayAlbums()" class="nav-button unselectable"><img class="header-img" src="../assets/album.png"><b>专 辑</b></div>
            <div v-show="$store.state.showArtists" :class="{ 'active': isActive(['Artists', 'ArtistDetail']) }" @click="displayArtists()" class="nav-button unselectable"><img class="header-img" src="../assets/artist.png"><b>艺 术 家</b></div>
            <div v-show="$store.state.showFolders" :class="{ 'active': isActive(['Folders', 'SongsInFolder']) }" @click="displayFolders()" class="nav-button unselectable"><img class="header-img" src="../assets/folder2.png"><b>文 件 夹</b></div>
            <div :class="{ 'active': isActive('Settings') }" @click="displaySettings" class="nav-button unselectable"><img class="header-img" src="../assets/set.png"><b>设 置</b></div>
        </div>
    </div>
</template>

<style scoped>
    .image-and-buttons {
        display: flex;
        align-items: center;
        padding: 0;
    }

    .button-container {
        padding: 1px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-grow: 1; /* 填满剩余空间 */
        gap: 5px;
    }

    .nav-button {
        flex: 1;
        display: flex;
        align-items: center; /* 垂直居中 */
        justify-content: center; /* 水平居中 */
        flex-direction: row;
        white-space: nowrap;
        padding: 10px;
        margin: 0 1px;
        color: #f0f0f0;
        text-align: center;
        cursor: pointer;
        font-size: 16px;
        transition: 0.2s;
        border-radius: 100px;
        gap: 10px;
    }
    .nav-button:hover{
        background-color: rgba(255, 255, 255, 0.1);
        color: #f0f0f0;
    }
    .nav-button:hover .header-img {
        filter: brightness(100%) !important; /* 提高权重 */
    }
    .nav-button:active {
        transform: scale(0.85);
    }
    .nav-button.active .header-img {
        filter: brightness(0)
    }
    .active {
        background-color: rgba(255, 255, 255, 0.9);
        color: #333;
    }
    .header-img{
        width:20px;
        height: 20px;
        transition: 0.1s;
    }

    /* 调整输入框样式 */
    .nav-button input {
        background: none;
        border: none;
        width: 100%;
        color: #f0f0f0;
        font-size: 15px;
        padding: 0;
    }
    .horizontal-container {
        display: flex;
        align-items: center; /* 垂直居中对齐 */
    }
    .searchIco{
        width: 15px;
        height: 15px;
    }
    .search-button {
        width: 5%;
        border: 2px solid rgba(255,255,255,0.7);
        padding: 10px;
        margin: 1px 2px;
        margin-right: 5px;
        color: #f0f0f0;
        text-align: center;
        font-size: 15px;
        transition: background-color 0.2s, color 0.2s, border-color 0.2s;
        border-radius: 100px;
        flex-grow: 1; /* 均匀填充剩余空间 */
        background-color: rgba(240, 240, 240, 0); /* 初始状态下背景全透明 */
    }

    /* 调整输入框样式 */
    .search-button input {
        background: none;
        border: none;
        width: 100%;
        color: white;
        font-size: 15px;
        padding: 0 10px;
        outline: none;
    }
    .search-button input::placeholder {
        color: darkgrey;
    }
</style>

<script>
    import { mapMutations } from "vuex";
    import { mix3 } from "@/mixin";

    export default {
        name: "Header",
        data() {
            return {
                search: "",
            };
        },

        mixins: [mix3],
        mounted() {
            this.$bus.$on("toHome", this.displayHome);
            this.$bus.$on("startSearch", this.startSearch);
        },
        methods: {
            blockSpace(isBlock){
                this.$store.state.blockSpace = isBlock
            },
            setFilterType(type) {
                this.$store.commit("SET_FILTER_TYPE", type);
            },
            ...mapMutations(["SEARCHSONGS"]),
            sendSearchKeyword() {
                if (this.search.trim().length >= 1) this.SEARCHSONGS(this.search);
            },
            displaySearch() {
                setTimeout(()=>{
                    if (this.search.trim().length < 1) return;
                    if (this.$route.path !== "/Search") {
                        this.$router.push({ name: "Search" }, () => {}, () => {});
                    }
                },5)
            },
            // ... 其他方法 ...
            displayLibrary() {
                setTimeout(()=>{
                    if (this.$route.path !== "/Library") {
                        this.setFilterType('')
                        this.$router.push({
                            name: "Library",
                        });
                    }
                },5)
            },
            displayPlaylists() {
                setTimeout(()=>{
                    if (this.$route.path !== "/Playlists") {
                        this.$router.push({
                            name: "Playlists",
                        });
                    }
                },5)
            },
            displayFolders() {
                setTimeout(()=>{
                    if (this.$route.path !== "/Folders") {
                        this.$router.push({
                            name: "Folders",
                        });
                    }
                },5)
            },
            displayAlbums() {
                setTimeout(()=>{
                    if (this.$route.path !== "/Albums") {
                        this.setFilterType('byAlbums')
                        this.$router.push({
                            name: "Albums",
                        });
                    }
                },5)
            },
            displayArtists() {
                setTimeout(()=>{
                    if (this.$route.path !== "/Artists") {
                        this.setFilterType('byArtists')
                        this.$router.push({
                            name: "Artists",
                        });
                    }
                },5)
            },
            displaySettings() {
                setTimeout(()=>{
                    if (this.$route.path !== "/Settings") {
                        this.$router.push({
                            name: "Settings",
                        });
                    }
                },5)
            },
            displayHome() {
                setTimeout(()=>{
                    if (this.$route.path !== "/") {
                        this.$router.push({
                            name: "Home",
                        });
                    }
                },5)
            },
            startSearch(){
                const searchInput = this.$refs.search;
                if (searchInput) {
                    searchInput.focus();
                }
            }
        },
        computed: {
            // 判断按钮是否激活
            isActive() {
                return (routeNames) => routeNames.includes(this.$route.name);
            },
        },
    };
</script>


