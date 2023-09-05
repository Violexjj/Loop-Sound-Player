
const {contextBridge, ipcRenderer} = require('electron')
contextBridge.exposeInMainWorld('myAPI', {
    readFile: async (filePath) => {
        try {
            const response = await ipcRenderer.invoke('read-file', filePath);
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
    getAllSongs: async () => {
        try {
            const response = await ipcRenderer.invoke('getAllSongs');
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

    getSongCover: async (coverPath) => {
        try {
            const response = await ipcRenderer.invoke('getSongCover',coverPath);
            return response;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    },

    addNewPlaylistOrDelete:(newPlaylist, addOrDelete) =>{
        ipcRenderer.invoke('add-new-playlist-or-delete',newPlaylist,addOrDelete)
    },

    addToOrDeleteFromPlaylist:(playlistName, toModifySongsId,addOrDelete) =>{
        ipcRenderer.invoke('addTo-or-deleteFrom-playlist',playlistName,toModifySongsId,addOrDelete)
    },

    deleteFromLibrary:(toDeleteSongsId)=>{
        ipcRenderer.invoke('delete-from-library',toDeleteSongsId)
    },

    sortSongs:(orderType,newArray,playlistName) =>{
        ipcRenderer.invoke('sort-songs',orderType,newArray,playlistName)
    },

    addFolders:()=>{
        ipcRenderer.invoke('add-folders')
    },

    addFiles:()=>{
        ipcRenderer.invoke('add-files')
    }
});
