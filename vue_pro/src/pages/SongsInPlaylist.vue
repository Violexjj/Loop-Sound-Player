<template>
    <div class="music-library unselectable " @contextmenu.prevent="startSelectMode(true)">
        <div class="song-table " >
<!--            :style动态获取浏览器进度条宽度，修改右页边距-->
            <div class="song-table-header" :style="{ 'margin-right': scrollbarWidth + 'px' }">
                <div class="song-table-header-row">
                    <div class="song-index-head ellipsis"><b style="font-size: 20px">序号</b></div>
                    <div class="song-title-head ellipsis"><b style="font-size: 20px">标 题</b></div>
                    <div class="song-artist-head ellipsis"><b style="font-size: 20px">艺 术 家</b></div>
                    <div class="song-album-head ellipsis"><b style="font-size: 20px">专 辑</b></div>
                    <div class="song-time-head ellipsis"><b style="font-size: 20px">时 长</b></div>
                    <div v-if="selectMode" class="song-item song-select" :forceRerender="forceRerender">
                        <div class="select-checkbox2"></div>
                    </div>
                </div>
            </div>

            <div class="song-table-body route-container" >
                <div
                        v-for="(song, index) in songsWithSelection"
                        :key="song.id"
                        class="song-row"
                        @dblclick="changeQueueAndPlay(filteredSongs, index);clearShuffledIndex()"

                >

                    <div class="song-item song-index ellipsis">
                        <span class="index-style">{{ index+1 }}</span>
                    </div>
                    <div class="song-item song-title ellipsis">  {{ song.title }}</div>
                    <div class="song-item song-artist ellipsis">{{ song.artist }}</div>
                    <div class="song-item song-album ellipsis">{{song.album}}</div>
                    <div class="song-item song-time">{{ formatDuration(song.duration) }}</div>
                    <!-- 歌曲选择小框 -->
                    <div v-if="selectMode" class="song-item song-select" :forceRerender="forceRerender">
                        <div
                                class="select-checkbox"
                                :class="{ selected: song.isSelected }"
                                @click="selectThisSong(index)"
                        ></div>
                    </div>

                </div>
            </div>
        </div>
        <!-- 底部黑色背景div -->
        <div v-if="selectMode" class="context-menu-background">
            <div class="context-menu-options">
                <div class="context-menu-option" @click="selectAll">全选</div>
                <div class="context-menu-option" @click="rangeSelect">范围选择</div>
                <div class="context-menu-option" @click="showAddToPlaylist">添加到列表</div>
                <div class="context-menu-option" @dblclick="deleteFromPlaylist">从列表删除</div>
                <div class="context-menu-option" @click="showSort">排序</div>
                <div class="context-menu-option" @click="exitSelectMode(false)">退出选择</div>
            </div>
        </div>
<!--        添加到播放列表----------------------------->
        <div v-if="showPlaylistModal" class="modal">
            <div class="playlist-panel">
                <!-- 关闭按钮 -->
                <div class="modal-close" @click="showPlaylistModal = false">
                    <div class="close-button ">
                        <img src="../assets/close.png" alt="close" class="close-image">
                    </div>
                </div>
                <!-- 选项列表内容 -->
                <div class="playlist-options">
                    <div v-if="playlist.name !== thisPlaylist" v-for="playlist in playlists" :key="playlist.name" class="playlist-option"
                         @click="addToPlaylist(playlist.name)">
                        {{ playlist.name }}
                    </div>
                </div>
            </div>
        </div>

        <!--排序----------------------------------------------------------------------------------------->
        <div v-if="showSortModal" class="modal">
            <div class="playlist-panel">
                <!-- 关闭按钮 -->
                <div class="modal-close" @click="showSortModal = false">
                    <div class="close-button ">
                        <img src="../assets/close.png" alt="close" class="close-image">
                    </div>
                </div>
                <!-- 选项列表内容 -->
                <div class="playlist-options">
                    <div v-if="this.selectedSongsIndex.length===0" class="playlist-option" @click="sortSongs('title')">按歌曲标题排序</div>
                    <div v-if="this.selectedSongsIndex.length===0" class="playlist-option" @click="sortSongs('artist')">按歌曲艺术家排序</div>
                    <div v-if="this.selectedSongsIndex.length===0" class="playlist-option" @click="sortSongs('album')">按歌曲专辑排序</div>
                    <div v-if="this.selectedSongsIndex.length===0" class="playlist-option" @click="sortSongs('cTime')">按文件创建时间排序</div>
                    <div v-if="this.selectedSongsIndex.length===0" class="playlist-option" @click="sortSongs('reverse')">倒序</div>
                    <div v-if="this.selectedSongsIndex.length===1" class="playlist-option-2">
                        手动排序<br><br>
                        当前歌曲序号：{{this.selectedSongsIndex[0]+1}}<br><br>
                        请输入新的序号：<br><br>
                        <div class="newIndexContainer">
                            <input placeholder="序号" class="newIndex" type="text" v-model="manualSortIndex"
                                   @keyup.enter="manualSort">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>




<script>
    import {clearShuffledIndex, mix1, mix5} from '../mixin';
    import {mapGetters, mapMutations} from "vuex";

    export default {
        name: 'SongsInPlaylist',
        mounted() {
            // 在导航切换进来时重新计算 filteredSongs
            this.$store.commit('SET_FILTER_TYPE','byPlaylist')
        },
        data(){
            return{
                showSortModal : false,
                showPlaylistModal: false, // 控制弹出框显示状态
                playlists : this.$store.state.playlists,
                selectedSongsIndex : [],
                forceRerender: false,  // 新增的变量
                selectAllState : false,  //全选状态
                thisPlaylist : this.$store.state.selectedPlaylistName,
                manualSortIndex : null
            }
        },
        beforeRouteLeave(to, from, next) {
            // 在路由离开前执行操作
            this.SET_SELECT_MODE(false);
            next(); // 继续路由导航
        },
        computed : {
            selectMode(){
                return this.$store.state.selectMode
            },
            ...mapGetters(['filteredSongs']),
            songsWithSelection() {
                if (this.filteredSongs) {
                    return this.filteredSongs.map(song => ({
                        ...song,
                        isSelected: false
                    }));
                }
            },
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
        methods :{
            formatDuration(durationString) {
                const parts = durationString.split(":");
                parts.pop(); // Remove the last element (milliseconds)
                return parts.join(":");
            },
            ...mapMutations(['SET_SELECT_MODE']),
            startSelectMode(flag){
                this.SET_SELECT_MODE(flag)
            },
            selectThisSong(index){
                const song = this.songsWithSelection[index];
                song.isSelected = !song.isSelected;

                if (song.isSelected) {
                    this.selectedSongsIndex.push(index);
                    this.selectedSongsIndex.sort((a, b) => a - b); // 按索引从小到大排序
                } else {
                    const indexToRemove = this.selectedSongsIndex.indexOf(index);
                    if (indexToRemove !== -1) {
                        this.selectedSongsIndex.splice(indexToRemove, 1);
                    }
                }
                this.forceRerender = !this.forceRerender;
            },
            selectAll(){
                const selectAllButtonState = !this.selectAllState
                this.songsWithSelection.forEach((song) =>{
                    song.isSelected = selectAllButtonState
                })
                if (selectAllButtonState) {
                    // 添加所有歌曲的索引
                    this.selectedSongsIndex = this.songsWithSelection.map((song, index) => index);
                } else {
                    // 清空已选中的歌曲索引
                    this.selectedSongsIndex = [];
                }
                this.selectAllState = !this.selectAllState
                this.forceRerender = !this.forceRerender
            },
            rangeSelect() {
                if (this.selectedSongsIndex.length <= 1) {
                    return; // 没有需要范围选择的情况，直接返回
                }
                // 判断是否是连续的索引
                const sortedSelectedIndices = [...this.selectedSongsIndex].sort((a, b) => a - b);
                const minIndex = sortedSelectedIndices[0];
                const maxIndex = sortedSelectedIndices[sortedSelectedIndices.length - 1];
                if (maxIndex - minIndex === sortedSelectedIndices.length - 1) {
                    // 说明索引是连续的，直接清空 selectedSongsIndex
                    for (let i = minIndex ; i <= maxIndex; i++) {
                        const song = this.songsWithSelection[i];
                        song.isSelected = false;
                    }
                    this.selectedSongsIndex = [];
                    this.forceRerender = !this.forceRerender;
                } else {
                    // 非连续索引，进行范围选择
                    for (let i = minIndex + 1; i < maxIndex; i++) {
                        if (!this.selectedSongsIndex.includes(i)) {
                            const song = this.songsWithSelection[i];
                            song.isSelected = true;
                            this.selectedSongsIndex.push(i);
                        }
                    }
                    this.selectedSongsIndex.sort((a, b) => a - b); // 排序索引
                    this.forceRerender = !this.forceRerender;
                }
            },
            ...mapMutations(['DELETE_FROM_PLAYLIST','SET_SELECT_MODE','ADD_TO_PLAYLIST']),
            showAddToPlaylist(){
                if (this.selectedSongsIndex.length === 0) {
                    return
                }this.showPlaylistModal = true
            },
            showSort(){
                if (this.selectedSongsIndex.length > 1) {
                    return
                }this.showSortModal = true
                console.log(this.selectedSongsIndex[0])
            },
            addToPlaylist(playlistName){
                if (playlistName === this.$store.state.selectedPlaylistName) {
                    return
                }
                const toAddSongsId = [];
                for (const index of this.selectedSongsIndex) {
                    const song = this.filteredSongs[index];
                    toAddSongsId.push(song.id);
                }
                this.ADD_TO_PLAYLIST({ playlistName, songIds: toAddSongsId });
                this.showPlaylistModal = false;
                this.exitSelectMode(false)
                myAPI.addToOrDeleteFromPlaylist(playlistName,toAddSongsId,true)
            },
            sortSongs(orderType){
                this.showSortModal = false;
                this.exitSelectMode(false);
                if (this.selectedSongsIndex.length === 0) {
                    const songsCopy = [...this.filteredSongs];
                    if (orderType !== 'reverse') {
                        const compareFunction = (song1, song2) => {
                            const value1 = orderType === 'title' ? song1.title : orderType === 'artist' ? song1.artist : orderType === 'album' ? song1.album : song1.cTime;
                            const value2 = orderType === 'title' ? song2.title : orderType === 'artist' ? song2.artist : orderType === 'album' ? song2.album : song2.cTime;

                            if (typeof value1 === 'string' && typeof value2 === 'string') {
                                return value1.localeCompare(value2, 'zh-CN', { sensitivity: 'accent' });
                            } else if (typeof value1 === 'number' && typeof value2 === 'number') {
                                return value1 - value2;
                            }
                        };
                        songsCopy.sort(compareFunction);
                    } else if(orderType === 'reverse') {
                        songsCopy.reverse();
                    }
                    // 更新 state 中的排序后歌曲列表
                    const songIdsArray = songsCopy.map(song => song.id);
                    const selectedPlaylistName = this.$store.state.selectedPlaylistName
                    this.$store.state.playlists.find(playlist => playlist.name === selectedPlaylistName).songsId = songIdsArray

                    //    修改本地数据
                    myAPI.sortSongs(orderType,songIdsArray,selectedPlaylistName)
                }

            },
            manualSort(){
                const selectedPlaylist = this.$store.state.playlists.find(playlist => playlist.name === this.$store.state.selectedPlaylistName);
                const newIndex = parseInt(this.manualSortIndex, 10)-1; // 获取用户输入的新索引
                if (isNaN(newIndex) || newIndex < 0 || newIndex > selectedPlaylist.songsId.length-1) {
                    // 无效的新索引时，不进行手动排序
                    this.manualSortIndex = '无效的序号！'; // 清空输入框
                    return;
                }
                const songIdToMove = selectedPlaylist.songsId.splice(this.selectedSongsIndex[0], 1)[0]; // 移除选中歌曲的id
                selectedPlaylist.songsId.splice(newIndex, 0, songIdToMove); // 将歌曲id插入到新位置
                this.manualSortIndex = null; // 清空输入框
                this.showSortModal = false;//关闭排序框
                this.exitSelectMode(false);//关闭选择模式
                //    修改本地数据
                myAPI.sortSongs(null,selectedPlaylist.songsId,selectedPlaylist.name)
            },
            deleteFromPlaylist(){
                if (this.selectedSongsIndex.length === 0) {
                    return
                }
                const toDeleteSongsId = [];
                for (const index of this.selectedSongsIndex) {
                    const song = this.filteredSongs[index];
                    toDeleteSongsId.push(song.id);
                }
                this.DELETE_FROM_PLAYLIST(this.selectedSongsIndex)
                this.showPlaylistModal = false;
                this.exitSelectMode(false)
                myAPI.addToOrDeleteFromPlaylist(this.$store.state.selectedPlaylistName,toDeleteSongsId,false)
            },
            exitSelectMode(flag){
                this.SET_SELECT_MODE(flag)
                this.selectedSongsIndex = [];
                this.manualSortIndex=null
                this.songsWithSelection.forEach((song) =>{
                    song.isSelected = false
                })
            }
        },
        mixins: [mix1, mix5,clearShuffledIndex],
    };
</script>
<style scoped>
    .newIndexContainer{
        width: 50%;
        border: 2px solid lightgrey;
        padding: 5px;
        margin: 1px 1px;
        margin-right: 30px;
        color: #f0f0f0;
        text-align: center;
        cursor: pointer;
        font-size: 15px;
        transition: background-color 0.2s, color 0.2s, border-color 0.2s;
        border-radius: 100px;
        flex-grow: 1; /* 均匀填充剩余空间 */
        background-color: rgba(240, 240, 240, 0);
    }
    .newIndex{
        margin-left: 10px;
        background: none;
        border: none;
        width: 100%;
        color: #f0f0f0;
        font-size: 20px;
        padding: 0;
        outline: none;
    }
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
    .song-index-head{
        flex: 0.5;
    }
    .song-title-head,
    .song-artist-head,
    .song-album-head,
    .song-time-head {
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
    }
    .song-index{
        flex: 0.49;
    }
    .index-style{
        padding-left: 15px;
    }
    .song-title,
    .song-artist,
    .song-album,
    .song-time {
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
        background-color: rgba(0, 0, 0, 1);
        border-radius: 10px;
        padding: 10px;
        width: 80%;
        max-width: 400px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0);
        position: relative;
    }


    .modal-close {
        position: absolute;
        top: 10px;
        right: 10px;
        color: white;
        cursor: pointer;
        border-color: white;

    }
    .close-button:hover {
        background-color: rgba(255, 255, 255, 0.4);
    }
    .close-button {
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
    .close-image {
        width: 100%;
        height: 100%;
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }

    .playlist-options {
        margin-top: 40px;
    }
    .playlist-option{
        padding: 10px;
        border-radius: 10px;
        transition: background-color 0.1s ease;
    }
    .playlist-option-2{
        padding: 10px;
        border-radius: 10px;
        transition: background-color 0.1s ease;
    }
    .playlist-option:hover{
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.5); /* 鼠标悬停时的背景颜色 */
        border-radius: 10px;
    }
    /* 选择小框的样式 */
    .select-checkbox {
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.4);
        border-radius: 5px;
        cursor: pointer;
        margin-left: 80px;
        transition: background-color 0.1s ease; /* 添加过渡效果 */

    }
    .select-checkbox2 {
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0);
        border-radius: 5px;
        margin-left: 10px;
        transition: background-color 0.1s ease; /* 添加过渡效果 */

    }
    .selected {
        background-color: #f0f0f0;
    }
    /* 底部黑色背景样式 */
    .context-menu-background {
        position: fixed;
        bottom: 130px;
        left: 20%;
        width: 60%;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border-radius: 100px;
        min-height: 45px;
    }
    .context-menu-options {
        display: flex;
        gap: 1px; /* 调整选项之间的间隔 */
        width: 100%; /* 让内部选项占满宽度 */
        max-width: 100%; /* 可以根据需要进行调整 */
        background-color: rgba(0, 0, 0, 0.1);
    }
    .context-menu-options:hover {
        border-radius: 30px;
    }

    /* 底部黑色背景内部选项样式 */
    .context-menu-option {
        flex: 1;
        text-align: center;
        color: #fff;
        cursor: pointer;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0.4);
        border-radius: 30px;
        transition: background-color 0.15s ease;
    }
    .context-menu-option:hover {
        background-color: rgba(255, 255, 255, 0.4);
        border-radius: 30px;
    }
</style>
