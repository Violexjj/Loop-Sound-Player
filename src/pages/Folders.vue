<template>
    <div class="playlists-container unselectable ">
        <span class="headSpan"><b style="font-size: 20px">您拥有的文件夹</b>
        </span>
        <br>
        <div class="main route-container">
            <div class="playlist-list">
                <div class="playlist" v-for="(folder,index) in folders" :key="folder.path" >
                    <div class="playlist-box"
                         @click="displaySongsInFolder(folder.path)"
                         @contextmenu="displayContext(folder.path)">
                        <div class="cover-container">
                            <img src="../assets/folder.png"
                                 alt="defaultFolderCover"
                                 class="rounded-image click">
                        </div>
                        <div class="playlist-name">{{folder.name}} </div>
                    </div>

                </div>
            </div>
        </div>
        <!--        确认删除-------------------------------------------------------------------------->
        <div v-if="showDelete" class="modal">
            <div class="playlist-panel">
                <!-- 关闭按钮 -->
                <div class="modal-close" @click="showDelete = false">
                    <div class="close-button">
                        <div class="close-image-2"></div>
                    </div>
                </div>
                <div class="new-playlist-name">
                    <span style="font-weight: bold;font-size: 25px;margin-left: 5px;white-space: nowrap">将从音乐库删除，此操作不可恢复！</span>
                </div>
                <div @click="deleteFolder()" class="confirmButton">
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
                    <div class="playlist-option-delete" @click="openFolderPosition()">
                        打开文件夹所在位置
                    </div>
                    <div class="playlist-option-delete" @click="showDeleteModal()">
                        从音乐库删除文件夹
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
    import {mapMutations} from "vuex";
    import {textTruncateMixin} from "@/mixin";

    export default {
        name: "Folders",
        data(){
            return{
                showDelete: false,
                showRenameAndDelete : false,
                toChangeFolderPath : "",
            }
        },
        computed:{
            folders(){
                return this.$store.state.folders
            }
        },
        mixins:[textTruncateMixin],
        methods : {
            ...mapMutations(['DELETE_FROM_PLAYLIST2']),
            deleteFolder(){
                console.log("删除"+this.toChangeFolderPath)
                const toDeleteSongsId = [];
                const index = this.$store.state.folders.findIndex(folder => folder.path === this.toChangeFolderPath);
                if (index !== -1) {
                    this.$store.state.folders[index].songs.forEach(song => {
                        toDeleteSongsId.push(song.id)
                    })
                }
                this.$store.state.songs.songs = this.$store.state.songs.songs.filter(song => !song.path.startsWith(this.toChangeFolderPath + '\\'));
                this.showDelete = false
                this.DELETE_FROM_PLAYLIST2(toDeleteSongsId)
                myAPI.deleteFromLibrary(toDeleteSongsId)
            },
            showDeleteModal(){
                this.showRenameAndDelete = false
                this.showDelete = true
            },
            openFolderPosition(){
                myAPI.openFolder(this.toChangeFolderPath)
                this.showRenameAndDelete = false
                this.toChangeFolderPath = ""
            },
            displayContext(folderPath){
                this.showRenameAndDelete = true
                this.toChangeFolderPath = folderPath
            },
            closeContext(){
                this.showRenameAndDelete = false
                this.toChangeFolderPath = ""
            },
            ...mapMutations(['SET_FILTER_TYPE','SET_SELECTED_PLAYLIST_NAME']),

            displaySongsInFolder(folderPath){
                this.SET_FILTER_TYPE('byFolder')
                this.$store.state.selectedFolderPath = folderPath
                if (this.$route.path !== "/SongsInFolder") {
                    this.$router.push({
                        name: "SongsInFolder",
                    });
                }
            },
            blockSpace(isBlock){
                this.$store.state.blockSpace = isBlock
            },
        }
    }
</script>

<style scoped>
    .close-image-2 {
        width: 100%;
        height: 100%;
        background-image: url('../assets/close.png');
        background-size: contain; /* 保持原始比例 */
        background-repeat: no-repeat;
    }
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
        cursor: pointer;
    }
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
        background-color: rgba(0, 0, 0, 0.9);
        border-radius: 10px;
        padding: 10px;
        width: 80%;
        max-width: 400px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0);
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
        background-color: white; /* 鼠标悬停时的背景颜色 */
        border-radius: 10px;
        color: black;
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

