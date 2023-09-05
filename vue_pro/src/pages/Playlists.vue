<template>
    <div class="playlists-container unselectable ">
        <span class="headSpan"><b style="font-size: 20px">您拥有的播放列表</b>
        </span>
        <br>
        <div class="main route-container">
            <div class="playlist-list">
                <div id="addPlaylist" class="playlist" >
                    <div class="cover-container">
                        <img src="../assets/addPlaylist.png" alt="playlistCover" class="rounded-image click"
                             @click="showAddPlaylistPanel = true">
                    </div>
                    <div class="playlist-name">添加</div>
                </div>
                <div id="deletePlaylist" class="playlist" >
                    <div class="cover-container">
                        <img src="../assets/delete.png" alt="playlistCover" class="rounded-image click"
                             @click="showDeletePlaylistPanel = true">
                    </div>
                    <div class="playlist-name">删除</div>
                </div>
                <div class="playlist" v-for="playlist in playlists" :key="playlist.name" >
                    <div class="cover-container">
                        <img src="../assets/playlist.png" alt="playlistCover" class="rounded-image click"
                             @click="displaySongsInPlaylist(playlist.name)">
                    </div>
                    <div class="playlist-name">{{playlist.name}} </div>
                </div>
            </div>
        </div>
        <!--        -------------------------------------------------------------------------->
        <div v-if="showAddPlaylistPanel" class="modal">
            <div class="playlist-panel">
                <!-- 关闭按钮 -->
                <div class="modal-close" @click="showAddPlaylistPanel = false;clearNewPlaylistName()">
                    <div class="close-button">
                        <div class="close-image"></div>
                    </div>
                </div>
                <div class="new-playlist-name">
                    <div class="input-container">
                        <input v-model="newPlaylistName" type="text" placeholder="请输入需要添加播放列表的名称"
                               class="transparent-input" @keyup.enter="addPlaylist()"/>
                    </div>
                </div>
                <div @click="addPlaylist()" class="confirmButton">
                    <button class="confirm-button">确 认</button>
                </div>
            </div>
        </div>
<!--        -------------------------------------------------------------------------->
        <div v-if="showDeletePlaylistPanel" class="modal-delete">
            <div class="playlist-panel-delete">
                <!-- 关闭按钮 -->
                <div class="modal-close-delete" @click="showDeletePlaylistPanel = false">
                    <div class="close-button-delete close-image-delete"></div>
                </div>
                <!-- 选项列表内容 -->
                <div class="playlist-options-delete">
                    <div v-for="playlist in playlists" :key="playlist.name" class="playlist-option-delete"
                         @dblclick="deletePlaylist(playlist.name)">
                        {{ playlist.name }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapMutations} from "vuex";

    export default {
        name: "Playlists",
        data(){
            return{
                playlists : this.$store.state.playlists,
                showAddPlaylistPanel : false,
                showDeletePlaylistPanel :false,
                newPlaylistName : ''
            }
        },
        methods : {
            deletePlaylist(toDeletePlaylistName){
                this.$store.commit('DELETE_PLAYLIST', toDeletePlaylistName);
                this.showDeletePlaylistPanel = false
                myAPI.addNewPlaylistOrDelete(toDeletePlaylistName,false)
            },
            ...mapMutations(['SET_FILTER_TYPE','SET_SELECTED_PLAYLIST_NAME']),
            displaySongsInPlaylist(playlistName){
                this.SET_FILTER_TYPE('byPlaylist')
                this.SET_SELECTED_PLAYLIST_NAME(playlistName)
                if (this.$route.path !== "/SongsInPlaylist") {
                    this.$router.push({
                        name: "SongsInPlaylist",
                    });
                }
            },
            addPlaylist(){
                if (this.newPlaylistName.trim() === ""){
                    return
                }else if(this.$store.state.playlists.some
                (playlist => playlist.name === this.newPlaylistName.trim())){
                    this.newPlaylistName = "播放列表已存在！"
                    return
                }else if(this.newPlaylistName === "播放列表已存在！"){
                    return
                }
                    const newPlaylist = {
                        name : this.newPlaylistName,
                        songsId : []
                    }
                this.$store.state.playlists.push(newPlaylist)
                    myAPI.addNewPlaylistOrDelete(newPlaylist,true)

                this.clearNewPlaylistName()
            },
            clearNewPlaylistName(){
                this.newPlaylistName = ''
                this.showAddPlaylistPanel=false
            }
        }
    }
</script>

<style scoped>
    .modal-delete {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3); /* 半透明黑色背景 */
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000; /* 确保在最上层 */
    }
    .playlist-panel-delete {
        background-color: rgba(0, 0, 0, 0.7);
        border-radius: 10px;
        padding: 10px;
        width: 80%;
        max-width: 400px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0);
        position: relative;
    }

    .playlist-options-delete {
        /* 选项列表的样式 */

        margin-top: 40px;
    }
    .playlist-option-delete{
        padding: 10px;
        border-radius: 10px;
        transition: background-color 0.1s ease;
    }
    .playlist-option-delete:hover{
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.5); /* 鼠标悬停时的背景颜色 */
        border-radius: 10px;
    }

    .modal-close-delete {
        position: absolute;
        top: 10px;
        right: 10px;
        color: white;
        cursor: pointer;
        border-color: white;
        z-index: 1001;
    }
    .close-button-delete:hover {
        background-color: rgba(255, 255, 255, 0.4);
    }
    .close-button-delete {
        width: 30px;
        height: 30px;
        border: 2px solid white; /* 设置边框为白色 */
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        color: white;
    }
    .close-image-delete {
        width: 30px;
        height: 30px;
        background-image: url('../assets/close.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }

    .confirmButton {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }

    .confirm-button {
        background-color: transparent;
        border: 2px solid #f0f0f0;
        border-radius: 50px;
        padding: 5px 15px;
        color: #f0f0f0;
        font-weight: bold;
        font-size: 20px;
        cursor: pointer;
        transition: background-color 0.1s ease;
    }

    .confirm-button:hover {
        background-color: rgba(255, 255, 255, 0.4);
    }
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3); /* 半透明黑色背景 */
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000; /* 确保在最上层 */
    }
    .playlist-panel {
        background-color: rgba(0, 0, 0, 0.7);
        border-radius: 10px;
        padding: 10px 10px 20px;
        width: 80%;
        max-width: 400px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0);
        position: relative;
    }


    .new-playlist-name {
        margin-top: 60px;
    }
    .input-container {
        display: flex;
        justify-content: center;
        border: 2px solid #f0f0f0;
        border-radius: 50px;
    }

    .transparent-input {
        font-size: 15px;
        background-color: transparent;
        border: none;
        outline: none;
        padding: 15px;
        width: 100%;
        color: #f0f0f0;
    }

    .modal-close {
        position: absolute;
        top: 10px;
        right: 10px;
        color: white;
        cursor: pointer;
        border-color: white;
        z-index: 1001;
    }
    .close-button {
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        background-color: transparent;
        transition: background-color 0.1s ease;
        border-radius: 50%;
        border: 2px solid white;
    }

    .close-button:hover {
        background-color: rgba(255, 255, 255, 0.4);
    }

    .close-image {
        width: 100%;
        height: 100%;
        background-image: url('../assets/close.png');
        background-size: contain; /* 保持原始比例 */
        background-repeat: no-repeat;
    }



    .headSpan{
        align-items: center;
        justify-content: center;
    }

    .playlists-container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .route-container {
        max-height: calc(97vh - 300px); /* 100px 是顶部导航栏和底部控制栏的总高度 */
        overflow-y: auto;
    }
    .main {
        flex: 1 1 auto;
        display: flex;
    }

    .playlist-list {
        display: flex;
        flex-wrap: wrap; /* 换行排列 */
        gap: 40px; /* 间距 */
    }

    .playlist {
        display: flex;
        flex-direction: column;
        align-items: center; /* 居中对齐 */
    }

    .cover-container {
        width: 100px;
        height: 100px;
        border-radius: 20px;
        overflow: hidden;
    }

    .rounded-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.2s ease; /* 添加过渡效果 */
    }

    .rounded-image:hover {
        opacity: 0.5; /* 鼠标悬停时透明度增加 */
    }

    .playlist-name {
        margin-top: 10px;
        text-align: center;
    }

    .click {
        cursor: pointer;
    }
</style>

