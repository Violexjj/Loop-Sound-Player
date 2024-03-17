<template>
    <div class="playlists-container unselectable ">
        <span class="headSpan"><b style="font-size: 20px">您拥有的播放列表</b>
        </span>
        <br>
        <div class="main route-container">
            <div class="playlist-list">
                <div id="addPlaylist" class="playlist" >
                    <div class="playlist-box" @click="showAddPlaylistPanel = true">
                        <div class="cover-container">
                            <img src="../assets/addPlaylist.png" alt="playlistCover" class="rounded-image click"
                                 >
                        </div>
                        <div class="playlist-name">添加</div>
                    </div>

                </div>

                <div class="playlist" v-for="(playlist,index) in playlists" :key="playlist.name" >
                    <div class="playlist-box"
                         @click="displaySongsInPlaylist(playlist.name)"
                         @contextmenu="displayContext(playlist.name)">
                        <div class="cover-container">
                            <img v-if="getPlaylistCover(playlist.name)"
                                 :src="getPlaylistCover(playlist.name)"
                                 alt="playlistCover"
                                 class="rounded-image click">
                            <img v-else src="../assets/playlist.png"
                                 alt="defaultPlaylistCover"
                                 class="rounded-image click">
                        </div>
                        <div class="playlist-name">{{playlist.name}} </div>
                    </div>

                </div>
            </div>
        </div>
        <!--        添加播放列表-------------------------------------------------------------------------->
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
                               class="transparent-input" @keyup.enter="addPlaylist()"
                               @focus="blockSpace(true)"
                               @blur="blockSpace(false)"/>
                    </div>
                </div>
                <div @click="addPlaylist()" class="confirmButton">
                    <button class="confirm-button">确 认</button>
                </div>
            </div>
        </div>
        <!--        显示重命名和删除-------------------------------------------------------------------------->
        <div v-if="showRenameAndDelete" class="modal-delete">
            <div class="playlist-panel-delete">
                <!-- 关闭按钮 -->
                <div class="modal-close-delete" @click="closeContext()">
                    <div class="close-button-delete close-image-delete"></div>
                </div>
                <div class="playlist-options-delete">
                    <div class="playlist-option-delete" @click="showRenameModel()">
                        重命名
                    </div>
                    <div class="playlist-option-delete" @click="setCover()">
                        设置封面
                    </div>
                    <div class="playlist-option-delete" @dblclick="deletePlaylist()">
                        删除（双击）
                    </div>
                </div>

            </div>
        </div>
        <!--        显示重命名-------------------------------------------------------------------------->
        <div v-if="showRename" class="modal">
            <div class="playlist-panel">
                <!-- 关闭按钮 -->
                <div class="modal-close" @click="closeRename()">
                    <div class="close-button">
                        <div class="close-image"></div>
                    </div>
                </div>
                <div class="new-playlist-name">
                    <div class="input-container">
                        <input  v-model="newName" type="text" placeholder="请输入新名称"
                               class="transparent-input" @keyup.enter="rename()"
                               @focus="blockSpace(true)"
                               @blur="blockSpace(false)"/>
                    </div>
                </div>
                <div @click="rename()" class="confirmButton">
                    <button class="confirm-button">确 认</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapMutations} from "vuex";
    import {textTruncateMixin} from "@/mixin";

    export default {
        name: "Playlists",
        data(){
            return{
                playlists : this.$store.state.playlists,
                showAddPlaylistPanel : false,
                showDeletePlaylistPanel :false,
                showRenameAndDelete : false,
                newPlaylistName : '',
                toChangePlaylistName : "",
                showRename : false,
                newName : ""
            }
        },
        computed:{
            getPlaylistCover() {
                return (playlistName) => {
                    const playlist = this.$store.state.playlistsCovers.find(item => item.name === playlistName);
                    if (playlist !== null && playlist.cover !== null) {
                        return  playlist.cover
                    }else{
                        return null
                    }
                };
            }
        },
        mixins:[textTruncateMixin],
        methods : {
            async setCover() {
                this.showRenameAndDelete = false
                const coverData = await myAPI.setPlaylistCover(this.toChangePlaylistName)
                if (coverData) {
                    const playlistIndex = this.$store.state.playlistsCovers.findIndex(playlist => playlist.name === this.toChangePlaylistName);
                    if (playlistIndex !== -1) {
                        // 如果找到了指定名称的 playlist 对象，则更新其 cover 属性
                        this.$store.state.playlistsCovers[playlistIndex].cover = coverData;
                    }
                }
            },
            displayContext(playlistName){
                this.showRenameAndDelete = true
                this.toChangePlaylistName = playlistName
            },
            closeContext(){
                this.showRenameAndDelete = false
                this.toChangePlaylistName = ""
            },
            showRenameModel(){
                this.showRenameAndDelete = false
                this.showRename = true
            },
            closeRename(){
                this.showRename = false
                this.toChangePlaylistName = ""
                this.newName = ""
            },
            rename(){
                if (this.newName.trim() === ""){
                    this.newName = "名称无效！"
                    return
                }else if(this.$store.state.playlists.some
                (playlist => playlist.name === this.newName.trim())){
                    this.newName = "该名称已存在！"
                    return
                }
                this.$store.commit('RENAME_PLAYLIST', {
                    oldName: this.toChangePlaylistName,
                    newName: this.newName,
                });
                const index = this.$store.state.playlistsCovers.findIndex(item => item.name === this.toChangePlaylistName);
                if (index !== -1) {
                    // 如果找到匹配的 playlistName，则从数组中删除该项
                    this.$store.state.playlistsCovers[index].name = this.newName
                }
                this.showRename = false
                myAPI.rename({
                    oldName: this.toChangePlaylistName,
                    newName: this.newName,
                })
                this.newName = ""
            },

            deletePlaylist(){
                this.$store.commit('DELETE_PLAYLIST', this.toChangePlaylistName);
                this.showRenameAndDelete = false
                myAPI.addNewPlaylistOrDelete(this.toChangePlaylistName,false)
                const index = this.$store.state.playlistsCovers.findIndex(item => item.name === this.toChangePlaylistName);
                if (index !== -1) {
                    // 如果找到匹配的 playlistName，则从数组中删除该项
                    this.$store.state.playlistsCovers.splice(index, 1);
                }
                this.toChangePlaylistName = ""
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
            blockSpace(isBlock){
                this.$store.state.blockSpace = isBlock
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
                const newPlaylistCover = {
                    name: this.newPlaylistName,
                    cover: null,
                };
                this.$store.state.playlists.push(newPlaylist)
                this.$store.state.playlistsCovers.push(newPlaylistCover);

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
    .playlist-box{
        display: flex;
        align-items: center;
        flex-direction: column;
        width: 130px;
        height: 130px;
        transition: 0.2s;
        padding: 10px;
        border-radius: 10px;
    }
    .playlist-box:hover{
        background-color:rgba(255, 255, 255, 0.2);
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
        cursor: pointer;
    }
    .modal-delete {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000; /* 确保在最上层 */
    }
    .playlist-panel-delete {
        background-color: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        border-radius: 10px;
        padding: 10px;
        width: 80%;
        max-width: 400px;
        position: relative;
    }

    .playlist-options-delete {
        margin-top: 40px;
    }
    .playlist-option-delete{
        font-weight: bold;
        padding: 10px;
        border-radius: 10px;
    }
    .playlist-option-delete:hover{
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.2);
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
        background-color: rgba(255, 255, 255, 0.2);
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
        background-color: rgba(255, 255, 255, 0.2);
    }
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000; /* 确保在最上层 */
    }
    .playlist-panel {
        background-color: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        border-radius: 10px;
        padding: 10px 10px 20px;
        width: 80%;
        max-width: 400px;
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
    .transparent-input::placeholder {
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
        background-color: rgba(255, 255, 255, 0.2);
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
        max-height: calc(97vh - 260px); /* 100px 是顶部导航栏和底部控制栏的总高度 */
        overflow-y: auto;
    }
    .main {
        flex: 1 1 auto;
        display: flex;
    }

    .playlist-list {
        display: flex;
        flex-wrap: wrap; /* 换行排列 */
        gap: 10px; /* 间距 */
    }

    .route-container::-webkit-scrollbar {
        width: 20px;
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
    .playlist {
        display: flex;
        flex-direction: column;
        align-items: center; /* 居中对齐 */
    }

    .cover-container {
        width: 100px;
        height: 100px;
        border-radius: 15px;
        overflow: hidden;
    }

    .rounded-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: 0.2s/* 添加过渡效果 */
    }

    .playlist-name {
        width: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        margin-top: 10px;
        text-align: center;
        font-weight: bold;
        letter-spacing: 1px;
    }

    .click {
        cursor: pointer;
    }
</style>

