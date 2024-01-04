
const {contextBridge, ipcRenderer} = require('electron')




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

    onSaveBeforeQuit: (callback,arg) => ipcRenderer.on('saveBeforeQuit', callback, arg),
    onCloseFromBottom: (callback) => ipcRenderer.on('closeFromBottom', callback),
    onLoop: (callback) => ipcRenderer.on('loop', callback),
    onRandom: (callback) => ipcRenderer.on('random', callback),
    onOne: (callback) => ipcRenderer.on('one', callback),
    onFinishScan: (callback) => ipcRenderer.on('finishScan', callback),
    onCancelScan: (callback) => ipcRenderer.on('cancelScan', callback),
    onOpenSettings: (callback) => ipcRenderer.on('openSettings', callback),


    rename:({oldName,newName})=>{
        ipcRenderer.invoke('rename',{oldName,newName})
    },
    openFile:(filePath,directory)=>{
        ipcRenderer.invoke('openFile',filePath,directory)
    },
    readFile: async (filePath,lyricDirectory,songId) => {
        try {
            const response = await ipcRenderer.invoke('read-file', filePath,lyricDirectory,songId);
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },
    readFileForMoreInfo: async (filePath,songId) => {
        try {
            const response = await ipcRenderer.invoke('readFileForMoreInfo', filePath,songId);
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },
    minimize:()=>{
        ipcRenderer.invoke('minimize-window')
    },
    maximize:()=>{
        ipcRenderer.invoke('maximize-window')
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

    addNewPlaylistOrDelete:(newPlaylist, addOrDelete) =>{
        ipcRenderer.invoke('add-new-playlist-or-delete',newPlaylist,addOrDelete)
    },

    setId:(netId, songId) =>{
        ipcRenderer.invoke('setId',netId, songId)
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
    miniMode:(miniMode)=>{
        ipcRenderer.invoke('miniMode',miniMode)
    }
});
