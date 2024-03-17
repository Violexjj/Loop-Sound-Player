<template>
    <div class="music-library unselectable " @click="closeContext" @contextmenu="closeSelectMode">
        <div class="song-table " >
<!--            :style动态获取浏览器进度条宽度，修改右页边距-->
            <div class="song-table-header" :style="{ 'margin-right': scrollbarWidth + 'px' }">
                <div class="song-table-header-row">
                    <div class="song-index-head ellipsis"><b style="font-size: 20px">序 号</b></div>
                    <div class="song-cover-head ellipsis"><b style="font-size: 20px;margin-left: 5px">封 面</b></div>
                    <div class="song-title-head ellipsis"><b style="font-size: 20px">标 题</b></div>
                    <div class="song-artist-head ellipsis"><b style="font-size: 20px">艺 术 家</b></div>
                    <div class="song-album-head ellipsis"><b style="font-size: 20px">专 辑</b></div>
                    <div class="song-time-head ellipsis"><b style="font-size: 20px;margin-left: 2px">时 长</b></div>
                </div>
            </div>
            <!-- 右键菜单框 -->
            <div
                    v-if="showContextMenu"
                    class="context-menu"
                    :style="{ top: contextMenuTop, left: contextMenuLeft }"
                    ref="contextMenu"
            >
                <div class="choice" @click="changeQueueAndPlay(filteredSongs, contextIndex);clearShuffledIndex()">
                    <img src="../assets/play2.png" alt="Logo" class="choiceIco">
                    <span style="margin-left: 7px">播放</span>
                </div>
                <div class="choice" @click="setNextSongToPlay(filteredSongs, contextIndex)">
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
                    <span style="margin-left: 7px">从列表删除</span>
                </div>
                <div class="choice" @click="startSelectMode()">
                    <img src="../assets/choice.png" alt="Logo" class="choiceIco">
                    <span style="margin-left: 7px">选择模式</span>

                </div>
            </div>
            <!--        歌曲列表-->
            <div class="song-table-body route-container" >
                <div
                        v-for="(song, index) in songsWithSelection"
                        :key="song.id"
                        :class="['song-row', { 'selected-row': index === contextIndex }]"
                        @dblclick="changeQueueAndPlay(filteredSongs, index);clearShuffledIndex()"
                        @click="selectThisSong(index)"
                        @contextmenu.prevent="showContext(index,$event)"
                        ref="songRows"
                >

                    <div class="song-index ellipsis">
                        <span class="index-style">{{ index+1 }}</span>
                    </div>
                    <div class="cover-container">
                        <img :data-src="song.path" class="song-cover">
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
        <!-- 底部黑色背景div -->
        <div v-if="selectMode" class="context-menu-background">
            <div class="context-menu-options">
                <div class="context-menu-option" @click="selectAll">全选</div>
                <div class="context-menu-option" @click="rangeSelect">范围选择</div>
                <div class="context-menu-option" @click="showAddToPlaylist">添加到列表</div>
                <div class="context-menu-option" @click="startShowDeleteFromContext()">从列表删除</div>
                <div class="context-menu-option" @click="showSort">排序</div>
                <div class="context-menu-option" @click="exitSelectMode(false)">退出选择</div>
            </div>
        </div>
        <!--添加到播放列表----------------------------->
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
                            <input class="newIndex" type="text" v-model="manualSortIndex"
                                   @keyup.enter="manualSort"
                                   @focus="blockSpace(true)"
                                   @blur="blockSpace(false)"/>
                        </div>
                        <div @click="manualSort" class="confirmButton">
                            <button class="confirm-button">确 认</button>
                        </div>
                    </div>
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
                <div class="modal-close" @click="closeShowDeleteFromContext()">
                    <div class="close-button">
                        <div class="close-image-2"></div>
                    </div>
                </div>
                <div class="new-playlist-name">
                    <span style="font-weight: bold;font-size: 25px;margin-left: 5px;white-space: nowrap">将从该列表删除，此操作不可恢复！</span>
                </div>
                <div @click="deleteFromPlaylist()" class="confirmButton">
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
        name: 'SongsInPlaylist',
        mounted() {
            this.$store.state.showContextMenu = false
            this.contextIndex = -1
            // 在导航切换进来时重新计算 filteredSongs
            const observer = new IntersectionObserver(
                async (entries) => {
                    for (const entry of entries) {
                        if (entry.isIntersecting) {
                            const img = entry.target.childNodes[1].childNodes[0]
                            if (img && img.getAttribute('data-src')) {
                                img.src = await myAPI.getSongCover(img.getAttribute('data-src'),2)
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
        updated() {
            // 在导航切换进来时重新计算 filteredSongs
            const observer = new IntersectionObserver(
                async (entries) => {
                    for (const entry of entries) {
                        if (entry.isIntersecting) {
                            const img = entry.target.childNodes[1].childNodes[0]
                            if (img && img.getAttribute('data-src')) {
                                img.src = await myAPI.getSongCover(img.getAttribute('data-src'),2)
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
                showSortModal : false,
                showPlaylistModal: false, // 控制弹出框显示状态
                selectedSongsIndex : [],
                forceRerender: false,  // 新增的变量
                selectAllState : false,  //全选状态
                thisPlaylist : this.$store.state.selectedPlaylistName,
                manualSortIndex : null,
                observer: null,
                showSetId: false,
                newId:"",
                contextMenuTop: '0px', // 菜单框上边距
                contextMenuLeft: '0px', // 菜单框左边距
                contextIndex:-1,
                toHandleIndex:-1,
                showDelete:false,
            }
        },
        beforeRouteLeave(to, from, next) {
            this.$store.state.showContextMenu = false
            this.contextIndex = -1
            // 在路由离开前执行操作
            this.selectedSongsIndex = [];
            this.songsWithSelection.forEach((song) =>{
                song.isSelected = false
            })
            this.SET_SELECT_MODE(false);
            next(); // 继续路由导航
        },
        computed : {

            playlists(){
                return this.$store.state.playlists
            },
            showContextMenu(){
                return this.$store.state.showContextMenu
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
            closeSetIdModal(){
                this.showSetId = false
                this.newId = ""
            },
            startShowDeleteFromContext(){
                if (!this.selectMode) {
                    this.showDelete = true
                }else{
                    if (this.selectedSongsIndex.length !== 0) {
                        this.showDelete = true
                    }
                }

            },
            closeShowDeleteFromContext(){
                this.showDelete = false
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
                    netId: result.netId
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
                const menuWidth = 175; // 菜单框宽度
                const menuHeight = 315; // 菜单框高度

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
                this.$store.state.showContextMenu = true

                // 阻止浏览器默认的右键菜单
                event.preventDefault();
            },
            showSetIdM(){
                console.log("开启精确匹配框")
                this.showSetId = true
            },
            closeSelectMode(){
                if (this.$store.state.selectMode === true && this.$store.state.showContextMenu === false) {
                    this.exitSelectMode()
                }
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
            ...mapMutations(['DELETE_FROM_PLAYLIST','SET_SELECT_MODE','ADD_TO_PLAYLIST']),
            showAddToPlaylist(){
                if (this.selectedSongsIndex.length === 0) {
                    return
                }this.showPlaylistModal = true
            },
            showAddToPlaylistFromContext(){
                this.showPlaylistModal = true
            },
            showSort(){
                if (this.selectedSongsIndex.length > 1) {
                    return
                }this.showSortModal = true
            },
            blockSpace(isBlock){
                this.$store.state.blockSpace = isBlock
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
                    this.SET_FILTER_TYPE('byPlaylist')
                    this.SET_SELECTED_PLAYLIST_NAME(playlistName)
                    if (this.$route.path !== "/SongsInPlaylist") {
                        this.$router.push({
                            name: "SongsInPlaylist",
                        });
                    }
                    myAPI.addToOrDeleteFromPlaylist(playlistName,toAddSongsId,true)
                }else{
                    const toAddSongsId = [];
                    const song = this.filteredSongs[this.toHandleIndex];
                    toAddSongsId.push(song.id);
                    this.ADD_TO_PLAYLIST({ playlistName, songIds: toAddSongsId });
                    this.showPlaylistModal = false;
                    this.SET_FILTER_TYPE('byPlaylist')
                    this.SET_SELECTED_PLAYLIST_NAME(playlistName)
                    if (this.$route.path !== "/SongsInPlaylist") {
                        this.$router.push({
                            name: "SongsInPlaylist",
                        });
                    }
                    myAPI.addToOrDeleteFromPlaylist(playlistName,toAddSongsId,true)
                }

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
                if (!this.selectMode) {
                    this.showDelete = false
                    const toDeleteSongsId = [];
                    const song = this.filteredSongs[this.toHandleIndex];
                    toDeleteSongsId.push(song.id);
                    this.DELETE_FROM_PLAYLIST([this.toHandleIndex])
                    myAPI.addToOrDeleteFromPlaylist(this.$store.state.selectedPlaylistName,toDeleteSongsId,false)
                }else{
                    this.showDelete = false
                    if (this.selectedSongsIndex.length === 0) {
                        return
                    }
                    const toDeleteSongsId = [];
                    for (const index of this.selectedSongsIndex) {
                        const song = this.filteredSongs[index];
                        toDeleteSongsId.push(song.id);
                    }
                    this.DELETE_FROM_PLAYLIST(this.selectedSongsIndex)
                    this.exitSelectMode(false)
                    myAPI.addToOrDeleteFromPlaylist(this.$store.state.selectedPlaylistName,toDeleteSongsId,false)
                }
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
            ...mapMutations(['SET_SELECT_MODE','SET_FILTER_TYPE','SET_SELECTED_PLAYLIST_NAME']),
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
        height: 315px;
        line-height: 35px;
        position: fixed;
        background-color: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        border-radius: 10px;
        padding: 6px 5px;
        z-index: 9999;
        white-space: nowrap;
    }
    .new-playlist-name {
        margin-top: 60px;
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
    .song-cover{
        object-fit: contain;
        height: 100%;
        border-radius: 7px;
        margin-left: 7px;
    }
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
    .song-index-head{
        flex: 0.3;
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
    .song-row {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 5px 0;
        margin-right: 10px;
        margin-bottom: 5px;
        transition: 0.1s;
    }
    .song-row:hover{
        background-color: rgba(255, 255, 255, 0.2); /* 鼠标悬停时的背景颜色 */
        border-radius: 10px;
    }

    .cover-container{
        height: 40px;
        flex: 0.4;
        padding-right: 2px;
    }
    .song-index{
        flex: 0.3;
        margin-left: 2px;
    }
    .index-style{
        padding-left: 5px;
    }
    .song-title{
        flex: 1.5;
        padding-left: 1px;
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
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        border-radius: 10px;
        padding: 10px;
        width: 80%;
        max-width: 400px;
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
    .playlist-option-2{
        padding: 10px;
        border-radius: 10px;
    }
    .playlist-option:hover{
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.2); /* 鼠标悬停时的背景颜色 */
        border-radius: 10px;
    }

    /* 底部黑色背景样式 */
    .context-menu-background {
        position: fixed;
        bottom: 120px;
        left: 15%;
        width: 70%;
        background-color: rgba(0, 0, 0, 0.6);
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
