<template>
    <div class="image-and-buttons">
        <div class="button-container">
            <div :class="{ 'active': isActive('Search') }" @click="displaySearch" class="nav-button search-button">
                <input type="text" v-model="search"
                       @keyup.enter="sendSearchKeyword();displaySearch();setFilterType('bySearch')"
                       @blur="search = ''" placeholder="搜索">
            </div>
            <div :class="{ 'active': isActive('Home') }" @click="displayHome" class="nav-button unselectable"><b>主页</b></div>
            <div :class="{ 'active': isActive('Library') }" @click="displayLibrary(); setFilterType('')" class="nav-button unselectable"><b>音乐库</b></div>
            <div :class="{ 'active': isActive('Playlists') }" @click="displayPlaylists" class="nav-button unselectable"><b>播放列表</b></div>
            <div :class="{ 'active': isActive('Albums') }" @click="displayAlbums(); setFilterType('byAlbums')" class="nav-button unselectable"><b>专辑</b></div>
            <div :class="{ 'active': isActive('Artists') }" @click="displayArtists(); setFilterType('byArtists')" class="nav-button unselectable"><b>艺术家</b></div>
            <div :class="{ 'active': isActive('Settings') }" @click="displaySettings" class="nav-button unselectable"><b>设置</b></div>
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
        margin-left: 1%;
        margin-right: 1%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-grow: 1; /* 填满剩余空间 */
    }

    .nav-button {
        padding: 10px;
        margin: 0 10px;
        color: #f0f0f0;
        text-align: center;
        cursor: pointer;
        font-size: 15px;
        transition: background-color 0.2s, color 0.2s;
        border-radius: 100px;
        flex-grow: 1; /* 均匀填充剩余空间 */
    }

    .active {
        background-color: #f0f0f0;
        color: #333;
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
    .search-button {
        width: 10%;
        border: 2px solid lightgrey;
        padding: 10px;
        margin: 1px 1px;
        margin-right: 30px;
        color: #f0f0f0;
        text-align: center;
        cursor: pointer;
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
        outline: none; /* 移除默认的外部轮廓 */
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
        },
        methods: {
            setFilterType(type) {
                this.$store.commit("SET_FILTER_TYPE", type);
            },
            ...mapMutations(["SEARCHSONGS"]),
            sendSearchKeyword() {
                if (this.search.trim().length >= 1) this.SEARCHSONGS(this.search);
            },
            displaySearch() {
                if (this.search.trim().length < 1) return;
                if (this.$route.path !== "/Search") {
                    this.$router.push({ name: "Search" }, () => {}, () => {});
                }
            },
            // ... 其他方法 ...
            displayLibrary() {
                if (this.$route.path !== "/Library") {
                    this.$router.push({
                        name: "Library",
                    });
                }
            },
            displayPlaylists() {
                if (this.$route.path !== "/Playlists") {
                    this.$router.push({
                        name: "Playlists",
                    });
                }
            },
            displayAlbums() {
                if (this.$route.path !== "/Albums") {
                    this.$router.push({
                        name: "Albums",
                    });
                }
            },
            displayArtists() {
                if (this.$route.path !== "/Artists") {
                    this.$router.push({
                        name: "Artists",
                    });
                }
            },
            displaySettings() {
                if (this.$route.path !== "/Settings") {
                    this.$router.push({
                        name: "Settings",
                    });
                }
            },
            displayHome() {
                if (this.$route.path !== "/") {
                    this.$router.push({
                        name: "Home",
                    });
                }
            },
        },
        computed: {
            // 判断按钮是否激活
            isActive() {
                return (routeName) => this.$route.name === routeName;
            },
        },
    };
</script>


