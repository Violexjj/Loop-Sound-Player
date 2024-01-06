// 引入Vue，因为下面使用Vuex插件的时候需要Vue
import Vue from 'vue'
//引入歌曲json文件

// const songsModule = await import('@allSourcesOfSongs/songsNoSameId.json');
// const songs = songsModule.default; // 注意这里使用 .default 获取导出的数组
// console.log('@allSourcesOfSongs/songsNoSameId.json');
// console.log(songs);

// 引入vuex插件
import Vuex from 'vuex'
// 使用插件
Vue.use(Vuex)
//引入播放列表
//import loveSong from '../../public/playlists/loveSong.json'

const actions = {
    // setPlaylist({ commit }, playlist) {
    //     commit('SET_PLAYLIST', playlist);
    // },
    // playSong({ commit, state }, index) {
    //     const newIndex = state.shuffledIndexList[index]; // 使用乱序索引
    //     if (newIndex >= 0 && newIndex < state.queue.length) {
    //         commit('SET_CURRENT_INDEX', newIndex);
    //         commit('SET_PLAYING_STATE', true);
    //     }
    // },
    prevSong({ commit, state }) {
        if (state.modeType[state.nowMode] === "无序") {
            if (state.shuffledIndex.length === 0) {
                // 如果无序队列索引为空，重新生成

                commit('SHUFFLE_INDEX_LIST');
            }
            const currentShuffledIndex = state.shuffledIndex[state.currentIndex];
            let prevShuffledIndex = currentShuffledIndex - 1;
            if (prevShuffledIndex < 0) {
                prevShuffledIndex = state.shuffledIndex.length - 1; // 重新从末尾开始
            }
            const prevQueueIndex = state.shuffledIndex.indexOf(prevShuffledIndex);
            commit('SET_CURRENT_INDEX', prevQueueIndex);
            commit('SET_PLAYING_STATE', true);
        }else{
            const prevIndex = (state.currentIndex - 1 + state.queue.length) % state.queue.length;
            commit('SET_CURRENT_INDEX', prevIndex);
            commit('SET_PLAYING_STATE', true);
        }
    },

    nextSong({ commit, state }) {
        if (state.modeType[state.nowMode] === "循环" || state.modeType[state.nowMode] === "单曲") {
            const nextIndex = (state.currentIndex + 1) % state.queue.length;
            commit('SET_CURRENT_INDEX', nextIndex);
            commit('SET_PLAYING_STATE', true);

        }
        else if(state.modeType[state.nowMode] === "无序"){
            if (state.shuffledIndex.length === 0) {
                // 如果无序队列索引为空，重新生成
                commit('SHUFFLE_INDEX_LIST');
            }
            const currentShuffledIndex = state.shuffledIndex[state.currentIndex];
            // 计算下一首歌的无序索引
            let nextShuffledIndex = currentShuffledIndex + 1;
            if (nextShuffledIndex >= state.shuffledIndex.length) {
                nextShuffledIndex = 0; // 重新从头开始
            }
            // 根据无序索引获取在队列中的索引
            const nextQueueIndex = state.shuffledIndex.indexOf(nextShuffledIndex);
            commit('SET_CURRENT_INDEX', nextQueueIndex);
            commit('SET_PLAYING_STATE', true);
        }

    },
    togglePlay({ commit, state }) {
        commit('SET_PLAYING_STATE', !state.isPlaying);
    }
}

const mutations = {
    SET_SONGS(state, songs){
        state.songs.songs = songs
    },
    SET_PLAYLISTS(state, playlists){
        state.playlists = playlists
    },
    SET_VOLUME(state, volume) {
        state.volume = volume;
    },
    SET_FILTER_TYPE(state, value){
        state.filterType = value;
    },
    SET_SELECTED_PLAYLIST_NAME(state,playlistName){
        state.selectedPlaylistName = playlistName
    },
    SEARCHSONGS(state, value){
        const keyword = value.toLowerCase();

        state.searchResults = {
            searchedArtists: [],
            searchedAlbums: [],
            searchedSongs: []
        };

        state.songs.songs.forEach(song => {
            if (song.artist.toLowerCase().includes(keyword)) {
                const existingArtist = state.searchResults.searchedArtists.find(artist => artist.name === song.artist);

                if (!existingArtist) {
                    state.searchResults.searchedArtists.push({
                        name: song.artist,
                        songs: [song]
                    });
                } else {
                    existingArtist.songs.push(song);
                }
            }

            if (song.title.toLowerCase().includes(keyword)) {
                state.searchResults.searchedSongs.push(song);
            }

            // Process album name to extract only the album part
            // const albumParts = song.album.split('-').map(part => part.trim());
            // const albumName = albumParts.length > 1 ? albumParts[1] : albumParts[0];

            if (song.album.toLowerCase().includes(keyword)) {
                const existingAlbum = state.searchResults.searchedAlbums.find(album => album.name === song.album);

                if (!existingAlbum) {
                    state.searchResults.searchedAlbums.push({
                        name: song.album,
                        songs: [song]
                    });
                } else {
                    existingAlbum.songs.push(song);
                }
            }
        });
    },
    CHANGE_QUEUE_AND_PLAY(state, {songs, index}){
        state.queue = songs;
        state.currentIndex = index;
        state.isPlaying = true;
    },
    CLEAR_SHUFFLED_INDEX(){
        state.shuffledIndex.splice(0, state.shuffledIndex.length);
    },

    SET_CURRENT_INDEX(state, index) {
        state.currentIndex = index;
    },

    SET_NOW_MODE(state, nowMode) {
        state.nowMode = nowMode;
    },
    SET_IS_MUTE(state, isMute) {
        state.isMute = isMute;
    },
    SET_QUEUE(state, queue) {
        state.queue = queue;
    },
    SET_SHOW_LYRICS(state, showLyrics) {
        state.showLyrics = showLyrics;
    },
    SET_SHOW_QUEUE(state, showQueue){
        state.showQueue = showQueue;
    },
    SET_SHOW_FORMAT(state, showFormat){
        state.showFormat = showFormat
    },
    SET_LYRIC_ALIGNMENT_MODE(state, lyricAlignmentMode){
        state.lyricAlignmentMode = lyricAlignmentMode;
    },
    SET_TO_HOME_AFTER_CHANGE_QUEUE(state, toHomeAfterChangeQueue) {
        state.toHomeAfterChangeQueue = toHomeAfterChangeQueue;
    },
    SET_AUTO_HIDE_LRC(state, autoHideLrc) {
        state.autoHideLrc = autoHideLrc;
    },
    SET_NOW_SONG_COVER(state, nowSongCover) {
        state.nowSongCover = nowSongCover;
    },

    SET_PLAYING_STATE(state, isPlaying) {
        state.isPlaying = isPlaying;
        console.log(state.isPlaying?"播放":"暂停")
    },
    CHANGE_LYRIC_ALIGNMENT_MODE(state, no){
        state.lyricAlignmentMode = no
    },
    CHANGE_MODE_AND_INDEX(state){
        //改变当前mode
        state.nowMode < (state.modeType.length-1) ? state.nowMode++ : state.nowMode = 0
        //更新乱序队列索引
        if (state.modeType[state.nowMode] === "无序") {
            let unShuffledIndex = []
            for (let i = 0; i < state.queue.length; i++) {
                unShuffledIndex.push(i)
            }
            //Fisher-Yates洗牌算法，用来打乱unShuffledIndex
            for (let i = unShuffledIndex.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [unShuffledIndex[i], unShuffledIndex[j]] = [unShuffledIndex[j], unShuffledIndex[i]];
            }
            state.shuffledIndex = unShuffledIndex
        }
    },
    //初始化无序播放
    SHUFFLE_INDEX_LIST(state) {
        const totalSongs = state.queue.length;
        state.shuffledIndex = Array.from({ length: totalSongs }, (_, index) => index);
        for (let i = totalSongs - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [state.shuffledIndex[i], state.shuffledIndex[j]] = [state.shuffledIndex[j], state.shuffledIndex[i]];
        }
    },
    SET_SELECT_MODE(state,value){
        state.selectMode = value
    },
    SET_HIGHLIGHT(state,value){
        state.highlight = value
    },
    SET_INFO_MODAL(state,value){
        state.infoModal = value
    },
    SET_LYRICS_MODAL(state,value){
        state.lyricsModal = value
    },
    SET_QUEUE_MODAL(state,value){
        state.queueModal = value
    },
    SET_GLOBAL_SHORTCUT(state,value){
        state.globalShortcut = value
    },
    SET_DELETE_LOCAL_FILE(state,value){
        state.deleteLocalFile = value
    },
    SET_SAVED_CURRENT_PLAYTIME(state, value){
        state.savedCurrentPlaytime = value
    },
    SET_EXIT(state,value){
        state.exit = value
    },
    DELETE_FROM_PLAYLIST(state,indexArray){
        const playlistName = state.selectedPlaylistName; // 获取选中的播放列表名称
        const playlistIndex = state.playlists.findIndex(playlist => playlist.name === playlistName); // 找到播放列表的索引

        if (playlistIndex !== -1) {
            const playlist = state.playlists[playlistIndex];

            // 从后往前删除，以免删除后的索引影响后续元素的删除
            indexArray.sort((a, b) => b - a);
            indexArray.forEach(index => {
                if (index >= 0 && index < playlist.songsId.length) {
                    playlist.songsId.splice(index, 1); // 删除歌曲 ID
                }
            });
        }
    },
    DELETE_FROM_LIBRARY(state,indexArray){
        indexArray.sort((a, b) => b - a);
        indexArray.forEach(index => {
            if (index >= 0 && index < state.songs.songs.length) {
                state.songs.songs.splice(index, 1); // Delete song object from songs array
            }
        });
    },
    DELETE_FROM_PLAYLIST2(state,toDeleteSongsId){
        for (let i = 0; i < state.playlists.length; i++) {
            const playlist = state.playlists[i];
            playlist.songsId = playlist.songsId.filter(id => !toDeleteSongsId.includes(id));
        }
    },
    ADD_TO_PLAYLIST(state, payload) {
        const { playlistName, songIds } = payload;
        // 找到指定的播放列表
        const playlist = state.playlists.find((pl) => pl.name === playlistName);
        // 将歌曲 ID 添加到播放列表中
        for (const songId of songIds) {
            if (!playlist.songsId.includes(songId)) {
                playlist.songsId.unshift(songId);
            }else{
                state.showIsExist = true
                setTimeout(()=>{
                    state.showIsExist = false
                },2000)
            }
        }
    },
    DELETE_PLAYLIST(state, playlistName) {
        const playlistIndex = state.playlists.findIndex(playlist => playlist.name === playlistName);
        if (playlistIndex !== -1) {
            state.playlists.splice(playlistIndex, 1);
        }
    },
    SET_CURRENT_PROGRESS(state, progress) {
        state.currentProgress = progress;
    },
    SET_LYRIC_FONT(state, value) {
        state.lyricFont = value;
    },
    SET_ONLINE_LRC(state, value) {
        state.onlineLrc = value;
    },
    SET_LYRIC_DIRECTORY(state, value) {
        if (value) {
            state.lyricDirectory = value;
        }
    },
    SET_BIGGER_LYRIC(state, value) {
        if (value>=0&&value<=15) {
            state.biggerLyric = value;
        }
    },
    SET_SHOW_TLYRIC(state, value) {
            state.showTlyric = value;
    },
    SET_BRIGHT(state, value) {
        state.bright = value;
    },
    SET_BLUR(state, value) {
        state.blur = value;
    },
    SET_CHECK(state, value) {
        state.check = value;
    },
    RENAME_PLAYLIST(state, { oldName, newName }){
        const playlistIndex = state.playlists.findIndex(playlist => playlist.name === oldName);
        if (playlistIndex !== -1) {
            Vue.set(state.playlists, playlistIndex, { ...state.playlists[playlistIndex], name: newName });
        } else {
            console.log("未找到匹配的播放列表");
        }
    },
}

const state = {
    check: null,
    nowVersion: "0.8.2",
    latestVersion: null,
    latestVersionInfo: "",
    errorMessage:"请开启自动检查更新",
    songs : {songs :[]},
    miniMode: false,
    playlists : [],   //用户拥有的列表
    playlistsCovers: [],
    defaultCover: null,
    selectedPlaylistName :'',
    //过滤方式
    filterType : '',
    searchResults : {
        searchedArtists : [],
        searchedAlbums : [],
        searchedSongs : []
    },
    queue: [
    ],                     //当前播放队列
    shuffledIndex : [],   //无序队列索引
    currentIndex: 0,    // 当前播放索引
    isPlaying: false,    // 播放状态
    modeType : ['循环','无序','单曲'],     //播放模式类型
    nowMode : 0,                                      //当前播放模式
    volume: 18,
    isMute : false,
    selectMode: false,
    currentProgress: 0,
    showIsExist : false,
    moreInfoOfNowSong : null,
    lyricOfNowSong : "加载歌词中",
    currentPlayTime : 0,
    showLyrics : true,
    lyricFont : 20,
    biggerLyric : 5,
    showQueue : true,
    nowSongCover : null,
    nowArtistCover : null,
    nowAlbumCover : null,
    toHomeAfterChangeQueue : true,
    autoHideLrc : true,
    lyricAlignmentType : ["left","center","right"],
    lyricAlignmentMode : 1,
    highlight : false,
    showInfo : true,
    showFormat : true,
    blockSpace : false,
    queueModal : true,
    infoModal : false,
    lyricsModal : false,
    exit : false,
    globalShortcut : false,
    deleteLocalFile : false,
    savedCurrentProgress : 0,
    onlineLrc:false,
    lyricDirectory:"未设置",
    nowSongNetId: -1,
    showContextMenu:false,
    songDialogInfo:null,
    nowSongDialogInfo:null,
    playNextSongs: false,
    nextSongs:[],
    nextSongsIndex:-1,
    showTlyric: true,
    bright: 100,
    blur: 40
}

const getters = {
    filteredSongs: state => {
        if (state.filterType === 'byAlbums') {
            const albumsMap = new Map();
            // Group songs by album name
            state.songs.songs.forEach((song) => {
                if (!albumsMap.has(song.album)) {
                    albumsMap.set(song.album, []);
                }
                albumsMap.get(song.album).push(song);
            });
            // Create albums array
            const albums = [];
            albumsMap.forEach((songs, album) => {
                albums.push({
                    name: album,
                    songs
                });
            });

            return albums;

        }
        else if (state.filterType === 'byArtists') {
            const artistsMap = new Map();
            // Group songs by artist name
            state.songs.songs.forEach((song) => {
                if (!artistsMap.has(song.artist)) {
                    artistsMap.set(song.artist, []);
                }
                artistsMap.get(song.artist).push(song);
            });
            // Create artists array
            const artists = [];
            artistsMap.forEach((songs, artist) => {
                artists.push({
                    name: artist,
                    songs
                });
            });

            return artists;
        }
        else if(state.filterType === 'byPlaylist'){
            if (state.selectedPlaylistName != null) {
                const selectedPlaylist = state.playlists.find(playlist => playlist.name === state.selectedPlaylistName);
                if (selectedPlaylist) {
                    const songsInSelectedPlaylist = selectedPlaylist.songsId.map(songId => {
                        const song = state.songs.songs.find(song => song.id === songId);
                        return song ? song : null; // Return song if found, otherwise null
                    });

                    // Filter out null values from the array
                    return songsInSelectedPlaylist.filter(song => song !== null);
                }
            }
        }else {
            return state.songs.songs; // Return all songs if no filter applied
        }
    },
    nowSong(state) {
        if (state.playNextSongs) {
            return state.nextSongs[state.nextSongsIndex]
        }else{
            if (state.currentIndex >= 0 && state.currentIndex < state.queue.length) {
                return state.queue[state.currentIndex];
            }
            return null;
        }

    }
}
// 简写形式
export default new Vuex.Store({actions,mutations,state,getters})
