<template>
    <div class="music-library unselectable "  @click="closeContext" @contextmenu="closeSelectMode">
        <div class="song-table " >
            <!--            :style动态获取浏览器进度条宽度，修改右页边距-->
            <div class="song-table-header" :style="{ 'margin-right': scrollbarWidth + 'px' }">
                <div class="song-table-header-row">
                    <div class="song-cover-head ellipsis"><b style="font-size: 20px;margin-left: 5px">封 面</b></div>
                    <div class="song-title-head ellipsis"><b style="font-size: 20px">标 题</b></div>
                    <div class="song-artist-head ellipsis"><b style="font-size: 20px">艺 术 家</b></div>
                    <div class="song-album-head ellipsis"><b style="font-size: 20px">专 辑</b></div>
                    <div class="song-time-head ellipsis"><b style="font-size: 20px;margin-left: 2px">时 长</b></div>
                </div>
            </div>
            <!-- 右键菜单框 -->
            <div
                    v-show="showContextMenu"
                    class="context-menu"
                    :style="{ top: contextMenuTop, left: contextMenuLeft }"
                    ref="contextMenu"
            >
                <div class="choice" @click="changeQueueAndPlay(filteredSongs, contextIndex);clearShuffledIndex()">
                    <img src="../assets/play2.png" alt="Logo" class="choiceIco">
                    <span style="margin-left: 7px">播放</span>
                </div>
                <div class="choice" @click="setNextSongToPlay(filteredSongs, contextIndex);">
                    <img src="../assets/nextSongs.png" alt="Logo" class="choiceIco">
                    <span style="margin-left: 7px">下一首播放</span>
                </div>
                <div class="choice" @click="showAddToPlaylistFromContext()">
                    <img src="../assets/add.png" alt="Logo" class="choiceIco">
                    <span style="margin-left: 7px">添加到播放列表</span>
                </div>
                <div class="choice" @click="showSetIdM()">
                    <img src="../assets/match.png" alt="Logo" class="choiceIco">
                    <span style="margin-left: 7px">精确匹配</span>
                </div>
                <div class="choice" @click="showMoreInfo()">
                    <img src="../assets/info2.png" alt="Logo" class="choiceIco">
                    <span style="margin-left: 7px">属性信息</span>
                </div>
                <div class="choice" @click="openFile(0)">
                    <img src="../assets/file.png" alt="Logo" class="choiceIco">
                    <span style="margin-left: 7px">打开音频文件位置</span>
                </div>
                <div class="choice" @click="openFile(1)">
                    <img src="../assets/lrc2.png" alt="Logo" class="choiceIco">
                    <span style="margin-left: 7px">打开歌词文件位置</span>
                </div>
                <div class="choice" @click="startShowDeleteFromContext(false)">
                    <img src="../assets/delete2.png" alt="Logo" class="choiceIco">
                    <span style="margin-left: 7px">从音乐库删除</span>
                </div>
                <div class="choice" @click="startShowDeleteFromContext(true)">
                    <img src="../assets/delete3.png" alt="Logo" class="choiceIco">
                    <span style="margin-left: 7px">从磁盘删除</span>
                </div>
                <div class="choice" @click="targetNowSong()">
                    <img src="../assets/target.png" alt="Logo" class="choiceIco">
                    <span style="margin-left: 7px">定位到当前播放</span>
                </div>
                <div class="choice" @click="startSelectMode()">
                    <img src="../assets/choice.png" alt="Logo" class="choiceIco">
                    <span style="margin-left: 7px">选择模式</span>

                </div>
            </div>
            <!--        歌曲列表-->
            <div class="song-table-body route-container" ref="container">
                <div
                        v-for="(song, index) in songsWithSelection"
                        :key="song.id"
                        :class="['song-row', { 'selected-row': index === contextIndex || index === checkIndex}]"
                        @dblclick="changeQueueAndPlay(filteredSongs, index);clearShuffledIndex()"
                        @click="selectThisSong(index)"
                        @contextmenu.prevent="showContext(index,$event)"
                        ref="songRows"
                >
                    <div class="cover-container">
                        <img :data-src="song.path" class="song-cover" ref="images">
                    </div>
                    <div class=" song-title ellipsis">  {{ song.title }}</div>
                    <div class=" song-artist ellipsis"><span :class="{'display': !selectMode}" @click="displayArtistDetail(song.artist)">{{ song.artist }}</span></div>
                    <div class=" song-album ellipsis"><span :class="{'display': !selectMode}" @click="displayAlbumDetail(song.album)">{{ song.album }}</span></div>
                    <div class=" song-time">
                        <div class="timee">{{ formatDuration(song.duration) }}</div>
                        <!-- 歌曲选择小框 -->
                        <div
                                v-if="selectMode"
                                class="select-checkbox"
                                :class="{ selected: song.isSelected }"
                                :forceRerender="forceRerender"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 底部黑色背景div ---------------------------------------------------------------------->
        <div v-if="selectMode" class="context-menu-background">
            <div class="context-menu-options">
                <div class="context-menu-option" @click="selectAll">全选</div>
                <div class="context-menu-option" @click="rangeSelect">范围选择</div>
                <div class="context-menu-option" @click="showAddToPlaylist">添加到列表</div>
                <div class="context-menu-option" @click="startShowDeleteFromContext(false)">从库删除</div>
                <div class="context-menu-option" @click="startShowDeleteFromContext(true)">从磁盘删除</div>
                <div class="context-menu-option" @click="showSort">排序</div>
                <div class="context-menu-option" @click="exitSelectMode(false)">退出选择</div>
            </div>
        </div>
        <!--        添加到播放列表--------------------------------------------------------------------------->
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
                    <div v-for="playlist in playlists" :key="playlist.name" class="playlist-option"
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
                    <div class="playlist-option" @click="sortSongs('title')">按歌曲标题排序</div>
                    <div class="playlist-option" @click="sortSongs('album')">按歌曲专辑排序</div>
                    <div class="playlist-option" @click="sortSongs('artist')">按歌曲艺术家排序</div>
                    <div class="playlist-option" @click="sortSongs('cTime')">按文件创建时间排序</div>
                    <div class="playlist-option" @click="sortSongs('reverse')">倒序</div>
                </div>
            </div>
        </div>
        <!--        显示精确匹配ID-------------------------------------------------------------------------->
        <div v-if="showSetId" class="modal">
            <div class="playlist-panel">
                <!-- 关闭按钮 -->
                <div class="modal-close" @click="closeSetIdModal">
                    <div class="close-button">
                        <div class="close-image-2"></div>
                    </div>
                </div>
                <div class="new-playlist-name">
                    <div class="input-container">
                        <input  v-model="newId" type="text" placeholder="请输入该歌曲的网易云ID（用于精确匹配歌词）"
                                class="transparent-input" @keyup.enter="setId()"
                                @focus="blockSpace(true)"
                                @blur="blockSpace(false)"/>
                    </div>
                </div>
                <div @click="setId()" class="confirmButton">
                    <button class="confirm-button">确 认</button>
                </div>
            </div>
        </div>
        <!--        确认删除-------------------------------------------------------------------------->
        <div v-if="showDelete" class="modal">
            <div class="playlist-panel">
                <!-- 关闭按钮 -->
                <div class="modal-close" @click="closeShowDeleteFromContext(false)">
                    <div class="close-button">
                        <div class="close-image-2"></div>
                    </div>
                </div>
                <div class="new-playlist-name">
                    <span style="font-weight: bold;font-size: 25px;margin-left: 5px;white-space: nowrap">将从音乐库删除，此操作不可恢复！</span>
                </div>
                <div @click="deleteFromLibraryFromContext(false)" class="confirmButton">
                    <button class="confirm-button">确 认</button>
                </div>
            </div>
        </div>
        <!--        确认删除，文件一并删除-------------------------------------------------------------------------->
        <div v-if="showDeleteFile" class="modal">
            <div class="playlist-panel">
                <!-- 关闭按钮 -->
                <div class="modal-close" @click="closeShowDeleteFromContext(true)">
                    <div class="close-button">
                        <div class="close-image-2"></div>
                    </div>
                </div>
                <div class="new-playlist-name">
                    <span style="font-weight: bold;font-size: 25px;white-space: nowrap">将从磁盘删除文件, 此操作不可恢复！</span>
                </div>
                <div @click="deleteFromLibraryFromContext(true)" class="confirmButton">
                    <button class="confirm-button">确 认</button>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
    import {clearShuffledIndex, mix1, mix5, mix6, mix7} from '../mixin';
    import {mapGetters, mapMutations} from "vuex";

    export default {
        name: 'SongsInFolder',
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
            this.$bus.$on('updateCoverInFolder',async () => {
                const img = this.$refs.images[this.toHandleIndex]
                img.src = await myAPI.getSongCover(img.getAttribute('data-src'), 2)
            })
            this.$store.state.showContextMenu = false
            this.contextIndex = -1
            // 在导航切换进来时重新计算 filteredSongs
            this.$store.commit('SET_FILTER_TYPE','byFolder')
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
        data(){
            return{
                showPlaylistModal: false, // 控制弹出框显示状态
                selectedSongsIndex : [],
                forceRerender: false,  // 新增的变量
                selectAllState : false,  //全选状态
                showSortModal : false,
                observer: null,
                showSetId: false,
                newId:"",
                contextMenuTop: '0px', // 菜单框上边距
                contextMenuLeft: '0px', // 菜单框左边距
                contextIndex:-1,
                toHandleIndex:-1,
                showDelete:false,
                showDeleteFile:false,
                checkIndex: -1
            }
        },
        beforeRouteLeave(to, from, next) {
            this.$store.state.showContextMenu = false
            this.contextIndex = -1
            // 在路由离开前执行操作
            this.selectedSongsIndex = [];
            if (this.songsWithSelection) {
                this.songsWithSelection.forEach((song) =>{
                    song.isSelected = false
                })
            }
            this.SET_SELECT_MODE(false);
            next(); // 继续路由导航
        },
        computed : {
            showContextMenu(){
                return this.$store.state.showContextMenu
            },
            playlists(){
                return this.$store.state.playlists
            },
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
            targetNowSong(){
                const songIndex = this.filteredSongs.findIndex(song => song.id === this.$store.getters.nowSong.id);
                if (songIndex !== -1) {
                    this.openInLibrary(songIndex)
                }else{
                    this.$bus.$emit("showNoTarget")
                }
            },
            openInLibrary(index){
                const songRows = this.$refs.songRows;
                if (Array.isArray(songRows) && index >= 0 && index < songRows.length) {
                    const container = this.$refs.container; // 你的滚动容器的 ref

                    // 计算滚动条的位置，使得 song-row 定位到视窗中间
                    const offsetTop = songRows[index].offsetTop;
                    const containerHeight = container.clientHeight;
                    const songRowHeight = songRows[index].clientHeight;

                    container.scrollTop = offsetTop - (containerHeight - songRowHeight) / 2;
                    this.checkIndex = index
                }
            },
            setNextSongToPlay(song, index){
                if (this.$store.state.playNextSongs) {
                    this.$store.state.notChangeNextSong = true
                    this.$store.state.nextSongs.splice(this.$store.state.nextSongsIndex + 1, 0, song[index]);
                }else{
                    this.$store.state.nextSongs.unshift(song[index])
                }
            },
            closeSelectMode(){
                if (this.$store.state.selectMode === true && this.$store.state.showContextMenu === false) {
                    this.exitSelectMode()
                }
            },
            startShowDeleteFromContext(flag){
                if (!this.selectMode) {
                    if (!flag) {
                        this.showDelete = true
                    }else{
                        this.showDeleteFile = true
                    }
                }else{
                    if (this.selectedSongsIndex.length !== 0) {
                        if (!flag) {
                            this.showDelete = true
                        }else{
                            this.showDeleteFile = true
                        }
                    }
                }

            },
            closeShowDeleteFromContext(flag){
                if (!flag) {
                    this.showDelete = false
                }else{
                    this.showDeleteFile = false
                }
            },
            openFile(mode){
                if (mode === 0) {
                    myAPI.openFile(this.filteredSongs[this.toHandleIndex].path,null)
                }else{
                    console.log(this.$store.state.lyricDirectory)
                    myAPI.openFile(this.filteredSongs[this.toHandleIndex].path,this.$store.state.lyricDirectory)
                }

            },
            async showMoreInfo(){
                const song = this.filteredSongs[this.toHandleIndex]
                const result = await myAPI.readFileForMoreInfo(song.path,song.id)
                if (!result) {
                    return
                }
                const moreInfo = result.moreInfo
                const cover = await myAPI.getSongCover(song.path,1)
                this.$store.state.songDialogInfo = {
                    cover: cover,
                    moreInfo: moreInfo,
                    nowSong: song,
                    netId: result.netId,
                }
                this.$bus.$emit('showMoreInfo')
            },
            closeContext(){
                this.contextIndex = -1
                if (this.$store.state.showContextMenu === true) {
                    this.$store.state.showContextMenu = false
                }
            },
            showContext(index,event) {
                if (this.$store.state.selectMode) {
                    return
                }
                this.contextIndex = index
                this.toHandleIndex = index
                if (this.$store.state.showContextMenu === true) {
                    this.$store.state.showContextMenu = false;
                }
                // 鼠标位置
                const posX = event.clientX;
                const posY = event.clientY;

                // 检查是否会超出界面范围
                const menuWidth = 170; // 菜单框宽度
                const menuHeight = 385; // 菜单框高度

                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;

                // 默认菜单栏出现在鼠标右下侧
                let left = posX;
                let top = posY;

                // 判断菜单栏矩形右侧是否超出页面边界
                if (posX + menuWidth > screenWidth) {
                    left = posX - menuWidth;
                }

                // 判断菜单栏矩形下侧是否超出页面边界
                if (posY + menuHeight > screenHeight) {
                    top = posY - menuHeight;
                }

                // 设置菜单栏位置和显示状态
                this.contextMenuLeft = `${left}px`;
                this.contextMenuTop = `${top}px`;
                this.$refs.contextMenu.style.opacity = 0
                this.$store.state.showContextMenu = true
                setTimeout(()=>{
                    this.$refs.contextMenu.style.opacity = 1
                },10)

                // 阻止浏览器默认的右键菜单
                event.preventDefault();
            },
            closeSetIdModal(){
                this.showSetId = false
                this.newId = ""
            },
            setId(){
                if (this.newId !== -1 && this.newId !== "") {
                    const song = this.filteredSongs[this.toHandleIndex]
                    myAPI.setId(this.newId,song.id)
                }
                this.showSetId = false
                this.newId = ""
                if (this.newId !== -1  && this.newId !== "") {
                    myAPI.delOnlineLrc(song.path,this.$store.state.lyricDirectory)
                }
            },
            blockSpace(isBlock){
                this.$store.state.blockSpace = isBlock
            },
            getSongCover(path){
                const cover = window.myAPI.getSongCover(path)
                return cover
            },
            formatDuration(durationString) {
                const parts = durationString.split(":");
                parts.pop(); // Remove the last element (milliseconds)
                return parts.join(":");
            },
            ...mapMutations(['SET_SELECT_MODE','SET_FILTER_TYPE','SET_SELECTED_PLAYLIST_NAME']),
            startSelectMode(){
                this.SET_SELECT_MODE(true)
            },
            selectThisSong(index){
                if (!this.$store.state.selectMode) {
                    return
                }
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
            ...mapMutations(['DELETE_FROM_PLAYLIST2','DELETE_FROM_PLAYLIST','SET_SELECT_MODE','ADD_TO_PLAYLIST','DELETE_FROM_LIBRARY']),
            showAddToPlaylist(){
                if (this.selectedSongsIndex.length === 0) {
                    return
                }this.showPlaylistModal = true
            },
            showAddToPlaylistFromContext(){
                this.showPlaylistModal = true
            },
            showSort(){
                if (this.selectedSongsIndex.length !== 0) {
                    return
                }this.showSortModal = true
            },
            showSetIdM(){
                console.log("开启精确匹配框")
                this.showSetId = true
            },
            addToPlaylist(playlistName){
                if (this.selectMode) {
                    const toAddSongsId = [];
                    for (const index of this.selectedSongsIndex) {
                        const song = this.filteredSongs[index];
                        toAddSongsId.push(song.id);
                    }
                    this.ADD_TO_PLAYLIST({ playlistName, songIds: toAddSongsId });
                    this.showPlaylistModal = false;
                    this.exitSelectMode(false)
                    this.SET_SELECTED_PLAYLIST_NAME(playlistName)
                    if (this.$route.path !== "/SongsInPlaylist") {
                        setTimeout(()=>{
                            this.$router.push({ name: 'SongsInPlaylist' });
                            this.SET_FILTER_TYPE('byPlaylist')
                        },5)
                    }
                    myAPI.addToOrDeleteFromPlaylist(playlistName,toAddSongsId,true)
                }else{
                    const toAddSongsId = [];
                    const song = this.filteredSongs[this.toHandleIndex];
                    toAddSongsId.push(song.id);
                    this.ADD_TO_PLAYLIST({ playlistName, songIds: toAddSongsId });
                    this.showPlaylistModal = false;
                    this.SET_SELECTED_PLAYLIST_NAME(playlistName)
                    if (this.$route.path !== "/SongsInPlaylist") {
                        setTimeout(()=>{
                            this.$router.push({ name: 'SongsInPlaylist' });
                            this.SET_FILTER_TYPE('byPlaylist')
                        },5)
                    }
                    myAPI.addToOrDeleteFromPlaylist(playlistName,toAddSongsId,true)
                }

            },
            sortSongs(orderType) {
                this.showSortModal = false;
                this.exitSelectMode(false);
                const songsCopy = [...this.$store.state.songs.songs];

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
                this.$store.commit('SET_SONGS', songsCopy);
                //    修改本地songs.json数据
                myAPI.sortSongs(orderType,null,null)
            },

            deleteFromLibraryFromContext(deleteFile){
                if (!this.selectMode) {
                    this.showDelete = false
                    this.showDeleteFile  = false
                    const toDeleteSongsId = [];
                    const toDeleteLocalFiles = [];
                    const song = this.filteredSongs[this.toHandleIndex];
                    if (song !== undefined && song !== null) {
                        toDeleteSongsId.push(song.id);
                        toDeleteLocalFiles.push(song.path);
                        this.$store.state.songs.songs = this.$store.state.songs.songs.filter(x => x.id!==song.id);
                        this.DELETE_FROM_PLAYLIST2(toDeleteSongsId)
                        myAPI.deleteFromLibrary(toDeleteSongsId)
                        if (deleteFile) {
                            myAPI.deleteLocalFile(toDeleteLocalFiles);
                        }
                    }
                }else{
                    this.showDelete = false
                    this.showDeleteFile  = false
                    this.deleteFromLibrary(deleteFile)
                }

            },
            deleteFromLibrary(deleteFile){
                const toDeleteSongsId = [];
                const toDeleteLocalFiles = [];
                for (const index of this.selectedSongsIndex) {
                    const song = this.filteredSongs[index];
                    toDeleteSongsId.push(song.id);
                    toDeleteLocalFiles.push(song.path);
                }
                toDeleteSongsId.forEach(id => {
                    this.$store.state.songs.songs = this.$store.state.songs.songs.filter(x => x.id!==id);
                })
                this.DELETE_FROM_PLAYLIST2(toDeleteSongsId)
                this.exitSelectMode(false)
                myAPI.deleteFromLibrary(toDeleteSongsId)
                if (deleteFile) {
                    myAPI.deleteLocalFile(toDeleteLocalFiles);
                }
            },
            exitSelectMode(flag){
                this.SET_SELECT_MODE(flag)
                this.selectedSongsIndex = [];
                this.songsWithSelection.forEach((song) =>{
                    song.isSelected = false
                })
            },

            async displayArtistDetail(artistName){
                if (this.selectMode) {
                    return
                }
                const filteredArtistSong = this.$store.state.songs.songs.filter(song => song.artist === artistName);
                // 创建包含 name 和 songs 属性的对象
                const artistDetail = {
                    name: artistName,
                    songs: filteredArtistSong
                };
                await this.changeArtistCover(artistDetail.songs,artistDetail);
            },

            async displayAlbumDetail(albumName){
                if (this.selectMode) {
                    return
                }
                const filteredAlbumSong = this.$store.state.songs.songs.filter(song => song.album === albumName);
                // 创建包含 name 和 songs 属性的对象
                const albumDetail = {
                    name: albumName,
                    songs: filteredAlbumSong
                };
                await this.changeAlbumCover(albumDetail.songs,albumDetail);
            },
        },
        mixins: [mix1, mix5,clearShuffledIndex,mix6,mix7],
    };
</script>

<style scoped>
    .choiceIco{
        width: 20px;
        height: 20px;
    }
    .selected-row {
        background-color: rgba(255, 255, 255, 0.4);
        border-radius: 10px;
    }
    .choice{
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: bold;
        border-radius: 5px;
        letter-spacing: 1px;
        padding-left: 5px;
        padding-right: 5px;
        color: #f0f0f0;
    }
    .choice:hover{
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.2);
    }
    .context-menu {
        width: 175px;
        height: 385px;
        line-height: 35px;
        position: fixed;
        background-color: rgba(0, 0, 0, 0.2);
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        border-radius: 10px;
        padding: 6px 5px;
        z-index: 9999;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.4s;
    }
    .close-image-2 {
        width: 100%;
        height: 100%;
        background-image: url('../assets/close.png');
        background-size: contain; /* 保持原始比例 */
        background-repeat: no-repeat;
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
    }

    .confirm-button:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
    .confirmButton {
        display: flex;
        justify-content: center;
        margin-top: 20px;
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
    .input-container {
        display: flex;
        justify-content: center;
        border: 2px solid #f0f0f0;
        border-radius: 50px;
    }
    .new-playlist-name {
        margin-top: 60px;
    }
    .song-cover{
        object-fit: contain;
        height: 100%;
        border-radius: 7px;
        margin-left: 4px;
        transition: 1s;
        opacity: 0;
    }

    .music-library {
        overflow-x: hidden;
    }
    .music-library::-webkit-scrollbar {
        width: 0; /* 使滚动条不可见 */
    }
    .route-container{
        max-height: calc(97vh - 250px); /* 260px 是顶部导航栏和底部控制栏的总高度 */
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
    .song-row {
        margin-left: 4px;
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 5px 0;
        margin-right: 10px;
        margin-bottom: 5px;
    }

    .song-row:hover{
        background-color: rgba(255, 255, 255, 0.2); /* 鼠标悬停时的背景颜色 */
        border-radius: 10px;
    }
    .song-title-head{
        flex: 1.5;
    }
    .song-artist-head,
    .song-album-head{
        flex: 1.5;
    }
    .song-time-head {
        flex: 0.45;
    }
    .song-cover-head{
        flex: 0.4;
        padding-right: 2px;
    }
    .cover-container{
        height: 40px;
        flex: 0.4;
        padding-right: 2px;
    }
    .song-title{
        flex: 1.5;
        padding-right: 5px;
    }
    .song-artist,
    .song-album{
        flex: 1.5;
        padding-right: 5px;
    }

    .song-time {
        display: flex;
        justify-content: space-between;
        align-items: center; /* 垂直居中对齐 */
        flex: 0.45;
    }
    .select-checkbox {
        margin-right: 15px;
        width: 15px;
        height: 15px;
        border: 3px solid rgba(255, 255, 255, 0.4);
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.1s ease; /* 添加过渡效果 */
    }
    .selected {
        background-color: #f0f0f0;
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
    .display:hover{
        font-weight: bolder;
        text-decoration: underline;
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
        border-radius: 10px;
        padding: 10px;
        width: 80%;
        max-width: 400px;
        position: relative;
        backdrop-filter: blur(20px);
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
        background-color: rgba(255, 255, 255, 0.2);
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
        font-weight: bold;
        padding: 10px;
        border-radius: 10px;
    }
    .playlist-option:hover{
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
    }
    /* 选择小框的样式 */


    /* 底部黑色背景样式 */
    .context-menu-background {
        position: fixed;
        bottom: 120px;
        left: 15%;
        width: 70%;
        background-color: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(20px);
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
        border-radius: 30px;
        font-weight: bold;
        letter-spacing: 1px;
    }
    .context-menu-option:hover {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 30px;
    }
</style>
