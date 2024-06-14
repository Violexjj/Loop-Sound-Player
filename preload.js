
const {contextBridge, ipcRenderer} = require('electron')


window.addEventListener('DOMContentLoaded', () => {
    const lock = document.getElementById('lockButton')
    const unlock = document.getElementById('unlockButton')

    if (lock) {
        lock.addEventListener('mouseenter', () => {
            setTimeout(()=>{
                ipcRenderer.send('set-ignore-mouse-events')
            },1000)
        })
    }

    if (unlock) {
        unlock.addEventListener('mouseenter', () => {
            setTimeout(()=>{
                ipcRenderer.send('set-ignore-mouse-events')
            },1000)
        })
    }
})

contextBridge.exposeInMainWorld('myAPI', {

    onPlayLast: (callback) => ipcRenderer.on('playLast', callback),
    onPlayLastG: (callback) => ipcRenderer.on('playLastG', callback),
    onToggle: (callback) => ipcRenderer.on('toggle', callback),
    onToggleG: (callback) => ipcRenderer.on('toggleG', callback),
    onPlayNext: (callback) => ipcRenderer.on('playNext', callback),
    onPlayNextG: (callback) => ipcRenderer.on('playNextG', callback),
    onDownVolume: (callback) => ipcRenderer.on('downVolume', callback),
    onDownVolumeG: (callback) => ipcRenderer.on('downVolumeG', callback),
    onUpVolume: (callback) => ipcRenderer.on('upVolume', callback),
    onUpVolumeG: (callback) => ipcRenderer.on('upVolumeG', callback),
    onChangeMute: (callback) => ipcRenderer.on('changeMute', callback),
    onChangeMuteG: (callback) => ipcRenderer.on('changeMuteG', callback),
    onChangeModeG: (callback) => ipcRenderer.on('changeModeG', callback),
    onChangeShowDLyric: (callback) => ipcRenderer.on('changeShowDLyric', callback),
    onChangeShowDLyricG: (callback) => ipcRenderer.on('changeShowDLyricG', callback),

    onSaveBeforeQuit: (callback,arg) => ipcRenderer.on('saveBeforeQuit', callback, arg),
    onForwardBack: (callback,arg) => ipcRenderer.on('forwardBack', callback, arg),
    onCloseFromBottom: (callback) => ipcRenderer.on('closeFromBottom', callback),
    onLoop: (callback) => ipcRenderer.on('loop', callback),
    onRandom: (callback) => ipcRenderer.on('random', callback),
    onOne: (callback) => ipcRenderer.on('one', callback),
    onFinishScan: (callback, arg, arg2) => ipcRenderer.on('finishScan', callback,arg,arg2),
    onFinishScanErrorMix: (callback) => ipcRenderer.on('finishScanErrorMix', callback),
    onErrorFile: (callback) => ipcRenderer.on('errorFile', callback),
    onCancelScan: (callback) => ipcRenderer.on('cancelScan', callback),
    onOpenSettings: (callback) => ipcRenderer.on('openSettings', callback),
    onShowInfo: (callback) => ipcRenderer.on('showInfo', callback),
    onShowPlaylists: (callback) => ipcRenderer.on('showPlaylists', callback),
    onShowLyric: (callback) => ipcRenderer.on('showLyric', callback),
    onReturnHome: (callback) => ipcRenderer.on('returnHome', callback),
    onShowQueue: (callback) => ipcRenderer.on('showQueue', callback),
    onSearch: (callback) => ipcRenderer.on('search', callback),
    onFocusMode: (callback) => ipcRenderer.on('focusMode', callback),

    onLyricFromWin: (callback,arg1, arg2) => ipcRenderer.on('lyricFromWin', callback, arg1, arg2),
    onLockButton: (callback,arg) => ipcRenderer.on('lockButton', callback, arg),
    onCloseDeskTopLyric: (callback) => ipcRenderer.on('closeDeskTopLyric', callback),
    onSendIsPlaying: (callback,arg) => ipcRenderer.on('sendIsPlaying', callback, arg),
    onChangeBold: (callback,arg) => ipcRenderer.on('changeBold', callback, arg),
    onChangeFont: (callback,arg) => ipcRenderer.on('changeFont', callback, arg),
    onChangeColor: (callback,arg1,arg2) => ipcRenderer.on('changeColor', callback, arg1, arg2),


    rename:({oldName,newName})=>{
        ipcRenderer.invoke('rename',{oldName,newName})
    },

    sendProgress:(progress)=>{
        ipcRenderer.invoke('sendProgress',progress)
    },

    sendToggle:(progress, isPlaying)=>{
        ipcRenderer.invoke('sendToggle', progress, isPlaying)
    },

    openFile:(filePath,directory)=>{
        ipcRenderer.invoke('openFile',filePath,directory)
    },
    openFolder:(folderPath)=>{
        ipcRenderer.invoke('openFolder', folderPath)
    },
    readFile: async (filePath,lyricDirectory,songId) => {
        try {
            const response = await ipcRenderer.invoke('read-file', filePath,lyricDirectory,songId);
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            return "[00:00.00]加载歌曲文件错误"
        }
    },
    searchSong: async (keyword) => {
        try {
            const response = await ipcRenderer.invoke('searchSong', keyword);
            return response;
        } catch (error) {
            return "未知错误"
        }
    },
    searchLyric: async (songId) => {
        try {
            const response = await ipcRenderer.invoke('searchLyric',songId);
            return response;
        } catch (error) {
            return "未知错误"
        }
    },
    readFileForMoreInfo: async (filePath,songId,lyricDirectory) => {
        try {
            const response = await ipcRenderer.invoke('readFileForMoreInfo', filePath,songId,lyricDirectory);
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },
    getLyrics: async (filePath,lyricDirectory) => {
        try {
            const response = await ipcRenderer.invoke('getLyrics', filePath,lyricDirectory);
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },
    editMetadata:(data, lyricDirectory)=>{
        ipcRenderer.invoke('editMetadata',data, lyricDirectory)
    },
    changeInfo:(filePath)=>{
        ipcRenderer.invoke('changeInfo',filePath)
    },
    closeWelcome:()=>{
        ipcRenderer.invoke('closeWelcome')
    },
    minimize:()=>{
        ipcRenderer.invoke('minimize-window')
    },
    maximize:(flag)=>{
        ipcRenderer.invoke('maximize-window',flag)
    },
    closeWindow:(savingState)=>{
        ipcRenderer.invoke('close-window',savingState)
    },
    writeOnlineLrc:(onlineLrc, songPath,lyricDirectory)=>{
        ipcRenderer.invoke('writeOnlineLrc',onlineLrc, songPath,lyricDirectory)
    },
    hideWindow:()=>{
        ipcRenderer.invoke('hide-window')
    },
    saveNow:(savingState)=>{
        ipcRenderer.invoke('save-now',savingState)
    },
    getAllSongs: async () => {
        try {
            const response = await ipcRenderer.invoke('getAllSongs');
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },
    changeLyricDirectory: async () => {
        try {
            const response = await ipcRenderer.invoke('changeLyricDirectory');
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },
    getSavingState: async () => {
        try {
            const response = await ipcRenderer.invoke('getSavingState');
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },
    getAllPlaylists: async () => {
        try {
            const response = await ipcRenderer.invoke('getAllPlaylists');
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },
    getSongCover: async (filePath,type) => {
        try {
            const response = await ipcRenderer.invoke('getSongCover',filePath,type);
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },
    getSongCoverFromNet: async (filePath,netId, keywords) => {
        try {
            const response = await ipcRenderer.invoke('getSongCoverFromNet',filePath,netId, keywords);
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },
    getPlaylistCover: async (playlistName) => {
        try {
            const response = await ipcRenderer.invoke('getPlaylistCover',playlistName);
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },
    getBackCover: async (backCoverPath) => {
        try {
            const response = await ipcRenderer.invoke('getBackCover',backCoverPath);
            return response;
        } catch (error) {
            console.error('Error reading cover:', error);
            throw error;
        }
    },

    setPlaylistCover: async (playlistName) => {
        try {
            const response = await ipcRenderer.invoke('setPlaylistCover',playlistName);
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },

    refreshLibrary: async () => {
        try {
            const response = await ipcRenderer.invoke('refreshLibrary');
            return response;
        } catch (error) {
            console.error('Error refresh library:', error);
            throw error;
        }
    },

    chooseCover: async (flag) => {
        try {
            const response = await ipcRenderer.invoke('chooseCover',flag);
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },

    addNewPlaylistOrDelete:(newPlaylist, addOrDelete) =>{
        ipcRenderer.invoke('add-new-playlist-or-delete',newPlaylist,addOrDelete)
    },

    setId:(netId, songId) =>{
        ipcRenderer.invoke('setId',netId, songId)
    },

    sendColor:(color, type) =>{
        ipcRenderer.invoke('sendColor',color, type)
    },

    sendBold:(bold) =>{
        ipcRenderer.invoke('sendBold',bold)
    },

    sendFont:(font) =>{
        ipcRenderer.invoke('sendFont',font)
    },

    deskTopLyricButtons:(buttonNo) =>{
        ipcRenderer.invoke('deskTopLyricButtons',buttonNo)
    },

    sendLyric:(text1, text2) =>{
        ipcRenderer.invoke('sendLyric', text1, text2)
    },


    openDeckTopLyric:(flag, isPlaying) =>{
        ipcRenderer.invoke('openDeckTopLyric',flag, isPlaying)
    },

    changeShortcuts:(type, whichKey, oldVal, newVal) =>{
        ipcRenderer.invoke('changeShortcuts',type, whichKey, oldVal, newVal)
    },

    initializeShortcuts:(shortcuts) =>{
        ipcRenderer.invoke('initializeShortcuts',shortcuts)
    },

    delOnlineLrc:(songPath, lrcDirectory)=>{
        ipcRenderer.invoke('delOnlineLrc',songPath, lrcDirectory)
    },

    addToOrDeleteFromPlaylist:(playlistName, toModifySongsId,addOrDelete) =>{
        ipcRenderer.invoke('addTo-or-deleteFrom-playlist',playlistName,toModifySongsId,addOrDelete)
    },

    deleteFromLibrary:(toDeleteSongsId)=>{
        ipcRenderer.invoke('delete-from-library',toDeleteSongsId)
    },

    deleteLocalFile:(toDeleteLocalFile)=>{
        ipcRenderer.invoke('deleteLocalFile',toDeleteLocalFile)
    },
    sortSongs:(orderType,newArray,playlistName) =>{
        ipcRenderer.invoke('sort-songs',orderType,newArray,playlistName)
    },
    addFolders:()=>{
        ipcRenderer.invoke('add-folders')
    },

    addFiles:()=>{
        ipcRenderer.invoke('add-files')
    },
    dragFile:(filePaths)=>{
        ipcRenderer.invoke('dragFile', filePaths)
    },
    miniMode:(miniMode)=>{
        ipcRenderer.invoke('miniMode',miniMode)
    },

    enableDrag:()=>{
        ipcRenderer.invoke('enableDrag')
    }
});
