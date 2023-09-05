const path = require('path');
const { app, BrowserWindow, ipcMain,nativeImage,dialog } = require('electron');
const fs = require('fs');
const mime = require('mime-types');
const jsmediatags = require('jsmediatags');

const WinState = require('electron-win-state').default;
const winState = new WinState({
    defaultWidth: 1000,
    defaultHeight: 800,
});

// 基本配置
const createWindow = () => {
    const win = new BrowserWindow({
       ...winState.winOptions,
        defaultWidth: 1000,
        defaultHeight: 800,
        frame: false,
        show : false,
        center : true,
        webPreferences :{
            preload : path.resolve(__dirname, './preload.js')
        }
    });
    ipcMain.handle('minimize-window', () => {
        win.minimize();
    });

    ipcMain.handle('maximize-window', () => {
        if (win.isMaximized()) {
            win.restore();
        } else {
            win.maximize();
        }
    });
    ipcMain.handle('close-window', (event,savingState) => {
        const appDataPath = path.join(process.env.APPDATA, 'Loop Sound Player');
        const coversFolderPath = path.join(appDataPath, 'savingState.json');
        if (!fs.existsSync(appDataPath)) {
            fs.mkdirSync(appDataPath);
        }
        if (!fs.existsSync(coversFolderPath)) {
            fs.writeFileSync(coversFolderPath, JSON.stringify({ savingState: {} }));
        }
        const existingData = fs.readFileSync(coversFolderPath, 'utf-8');
        const jsonData = JSON.parse(existingData);

        jsonData.savingState = savingState;
        fs.writeFileSync(coversFolderPath, JSON.stringify(jsonData));
        console.log("save success!")
        app.quit();
    });



    // 装载页面
    //win.loadURL('http://localhost:8080/');
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));


    // 加载好页面内容再打开界面
    win.on("ready-to-show", () => {
        win.show();
    });

    // 打开开发者工具
     //win.webContents.openDevTools();

    winState.manage(win);
}

//支持的音频格式
const isSupportedAudioFormat = (mimeType) => {
    const supportedMimeTypes = [
        'audio/mpeg',
        'audio/x-flac',
        'audio/wav',
        'audio/dsf',
        'audio/dsd'
    ];
    return supportedMimeTypes.includes(mimeType);
};

// 程序的打开
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
    //handleMetadata('folder',false, 'D:\\全部音乐')

});
// 程序的关闭
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


//读取音频、更多信息和歌词
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const mm = await import('music-metadata');
        const fileBuffer = await fs.promises.readFile(filePath)
        const audioDir = path.dirname(filePath); // 音频文件所在的文件夹路径
        const audioName = path.basename(filePath, path.extname(filePath)); // 音频文件的文件名（不包括扩展名）
        const lrcPath = path.join(audioDir, audioName + '.lrc'); // 构建LRC文件的路径
        //音频文件
        const songAudio = (fileBuffer).buffer;

        const metadata = await mm.parseFile(filePath);
        //更多的音频信息：格式、音轨号、年份、流派、注释
        const format = metadata.format.container
        const trackNumber = metadata.common.track.no || "无"
        const year = metadata.common.year || "无"
        const genre = metadata.common.genre || "无"
        const comment = metadata.common.comment || "无"
        const moreInfo = {
            "format": format,
            "trackNumber": trackNumber,
            "year" : year,
            "genre" : genre,
            "comment" : comment,
            "fileSize" : 100
        }
        //歌词文本
        if (metadata.format.container === "MPEG") {
            return new Promise((resolve, reject) => {
                jsmediatags.read(fileBuffer, {
                    onSuccess: function(tag) {
                        if (tag.tags.lyrics != null) {
                            const lyric = tag.tags.lyrics;
                            resolve([songAudio, moreInfo, lyric]);
                        }else{
                            let lyricData
                            let lyric
                            try {
                                // 尝试读取同文件夹下同名的LRC文件
                                lyricData = fs.readFileSync(lrcPath, 'utf-8');
                                lyric = {
                                    lyrics : lyricData
                                }
                            } catch (error) {
                                // 如果读取LRC文件失败，设置一个默认无歌词的文本
                                lyric = {
                                    lyrics : "[00:00.00]无歌词"
                                }
                            }
                            resolve([songAudio, moreInfo, lyric]);
                        }
                    },
                    onError: function(error) {
                        console.error('Error reading lyric in mp3:', error);
                        reject(error);
                    }
                });
            });
        } else {
            if(metadata.common.lyrics != null){
                const lyric = metadata.common
                return [songAudio, moreInfo, lyric];
            }else{
                let lyricData
                let lyric
                try {
                    // 尝试读取同文件夹下同名的LRC文件
                    lyricData = fs.readFileSync(lrcPath, 'utf-8');
                    lyric = {
                        lyrics : [lyricData]
                    }
                } catch (error) {
                    // 如果读取LRC文件失败，设置一个默认无歌词的文本
                    lyric = {
                        lyrics : ["[00:00.00]无歌词"]
                    }
                }
                return [songAudio, moreInfo, lyric];
            }
        }

    } catch (error) {
        console.error('Error reading file in main process:', error);
        throw error;
    }
});

//读取所有歌曲
ipcMain.handle('getAllSongs', async (event) => {
    try {
        //const filePath = path.join(process.env.APPDATA, 'Loop Sound Player\\songsInProduction.json');
        const filePath = path.join(process.env.APPDATA, 'Loop Sound Player\\songsNoSameId.json');
        //C:\Users\30595\AppData\Roaming\Loop Sound Player\songs.json

        const folderPath = path.dirname(filePath);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        if (!fs.existsSync(filePath)) {
            const initialData = {
                songs: []
            };
            fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
        }

        const rawData = await fs.promises.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(rawData);

        const songs = parsedData.songs || [];
        return songs;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error;
    }
});

//读取保存的状态
ipcMain.handle('getSavingState', async (event) => {
    try {
        const filePath = path.join(process.env.APPDATA, 'Loop Sound Player\\savingState.json');
        const rawData = await fs.promises.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(rawData);

        return parsedData.savingState || null;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error;
    }
});
//读取所有播放列表
ipcMain.handle('getAllPlaylists', async (event) => {
    try {
        const filePath = path.join(process.env.APPDATA, 'Loop Sound Player\\playlists.json');
        //C:\Users\30595\AppData\Roaming\Loop Sound Player\songs.json
        if (!fs.existsSync(filePath)) {
            return []; // 返回空数组，因为文件不存在
        }

        const playlistsData = fs.readFileSync(filePath, 'utf-8');
        const playlists = JSON.parse(playlistsData);

        return playlists;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error;
    }
});

//添加新的列表
ipcMain.handle('add-new-playlist-or-delete', (event, newPlaylist, addOrDelete) => {
    const filePath = path.join(process.env.APPDATA, 'Loop Sound Player\\playlists.json');

    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, '[]', 'utf-8');
    }

    try {
        const playlists = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (addOrDelete) {
            playlists.push(newPlaylist);
        } else {
            // 删除播放列表
            const playlistIndex = playlists.findIndex(playlist => playlist.name === newPlaylist);
            if (playlistIndex !== -1) {
                playlists.splice(playlistIndex, 1);
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(playlists, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error updating playlists:', error);
    }
});

//添加或者删除播放列表中的歌曲
ipcMain.handle('addTo-or-deleteFrom-playlist', async (event, playlistName, toModifySongsId, addOrDelete) => {
    try {
        const filePath = path.join(process.env.APPDATA, 'Loop Sound Player', 'playlists.json');

        if (!fs.existsSync(filePath)) {
            console.error('playlists.json not found');
            return;
        }

        const playlistsData = fs.readFileSync(filePath, 'utf-8');
        const playlists = JSON.parse(playlistsData);

        const playlistIndex = playlists.findIndex(playlist => playlist.name === playlistName);

        if (playlistIndex === -1) {
            console.error(`Playlist "${playlistName}" not found`);
            return;
        }

        const playlist = playlists[playlistIndex];

        if (addOrDelete) {
            // 添加歌曲到播放列表，不允许重复
            toModifySongsId.forEach(songId => {
                if (!playlist.songsId.includes(songId)) {
                    playlist.songsId.unshift(songId);
                }
            });
        } else {
            // 从播放列表中删除歌曲
            playlist.songsId = playlist.songsId.filter(songId => !toModifySongsId.includes(songId));
        }

        fs.writeFileSync(filePath, JSON.stringify(playlists, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error updating playlist:', error);
        throw error;
    }
});

//从songs.json中删除歌曲
ipcMain.handle('delete-from-library', async (event, toDeleteSongsId) => {
    try {
        const filePath = path.join(app.getPath('appData'), 'Loop Sound Player', 'songsNoSameId.json');
        const songsData = fs.readFileSync(filePath, 'utf8');
        const songsObject = JSON.parse(songsData);

        songsObject.songs = songsObject.songs.filter(song => !toDeleteSongsId.includes(song.id));

        const updatedSongsData = JSON.stringify(songsObject, null, 2);
        fs.writeFileSync(filePath, updatedSongsData, 'utf8');

        return true;
    } catch (error) {
        console.error('Error deleting songs:', error);
        return false;
    }
});

//获取歌曲封面base64数据
ipcMain.handle('getSongCover', (event, coverPath) => {
    try {
        const imageBuffer = fs.readFileSync(coverPath);
        const base64Data = nativeImage.createFromBuffer(imageBuffer).toDataURL();
        return base64Data;
    } catch (error) {
        console.error(error);
        return null;
    }
});

//对歌曲排序
ipcMain.handle('sort-songs', async (event,orderType, newArray,playlistName) => {
    try {
        if(!playlistName){
            const filePath = path.join(app.getPath('appData'), 'Loop Sound Player', 'songsNoSameId.json');
            const songsData = fs.readFileSync(filePath, 'utf8');
            const songsObject = JSON.parse(songsData);
            const songsCopy = [...songsObject.songs];
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
            songsObject.songs = songsCopy
            const updatedSongsData = JSON.stringify(songsObject, null, 2);
            fs.writeFileSync(filePath, updatedSongsData, 'utf8');
        }else{
            const filePath = path.join(process.env.APPDATA, 'Loop Sound Player', 'playlists.json');
            const playlistsData = fs.readFileSync(filePath, 'utf-8');
            const playlists = JSON.parse(playlistsData);
            const playlistIndex = playlists.findIndex(playlist => playlist.name === playlistName);
            if (playlistIndex === -1) {
                console.error(`Playlist "${playlistName}" not found`);
                return;
            }
            const playlist = playlists[playlistIndex];
            playlist.songsId = newArray
            fs.writeFileSync(filePath, JSON.stringify(playlists, null, 2), 'utf-8');
        }
        return true;
    } catch (error) {
        console.error('Error deleting songs:', error);
        return false;
    }
});

//扫描文件夹
ipcMain.handle('add-folders', async (event) => {
    dialog.showOpenDialog({ buttonLabel: '选择',properties: ['multiSelections','openDirectory'] }).then(result => {
        if (!result.canceled) {
            // 向预加载脚本发送选择结果
            // event.sender.send('selected-files', result.filePaths);
            console.log(result.filePaths)
            if (result.filePaths.length === 1) {
                handleMetadata('folder', true, result.filePaths[0])
            }else{
                handleMetadata('folders', true, result.filePaths)
            }
        }
    });
});

//扫描文件
ipcMain.handle('add-files', async (event) => {
    dialog.showOpenDialog({ buttonLabel: '选择',properties: ['multiSelections','openFile'] }).then(async result => {
        if (!result.canceled) {
            // event.sender.send('selected-files', result.filePaths);
            if (result.filePaths.length === 1) {
                await handleMetadata('file', true, result.filePaths[0])
            } else {
                await handleMetadata('files', true, result.filePaths)
            }
        }
    });
});

//异步将所需的符合格式的音频文件扫描并添加到songs.json文件中
const handleMetadata = async (type, refreshCovers, sourcePaths) => {
    try {
        const appDataPath = path.join(process.env.APPDATA, 'Loop Sound Player');
        if (!fs.existsSync(appDataPath)) {
            fs.mkdirSync(appDataPath);
        }
        //C:\Users\30595\AppData\Roaming\Loop Sound Player
        const coversFolderPath = path.join(appDataPath, 'covers');
        if (!fs.existsSync(coversFolderPath)) {
            fs.mkdirSync(coversFolderPath);
        }
        //C:\Users\30595\AppData\Roaming\Loop Sound Player\covers
        const songsJsonPath = path.join(appDataPath, 'songsNoSameId.json');
        if (!fs.existsSync(songsJsonPath) || fs.readFileSync(songsJsonPath, 'utf-8').trim() === '') {
            // Create or overwrite the file with an empty array JSON content
            const emptySongsArray = {
                songs: []
            };

            fs.writeFileSync(songsJsonPath, JSON.stringify(emptySongsArray, null, 2), 'utf-8');
        }
        //C:\Users\30595\AppData\Roaming\Loop Sound Player\songsNoSameId
        const mm = await import('music-metadata');
        const existingData = await fs.promises.readFile(songsJsonPath, 'utf8');
        const existingMetadata = JSON.parse(existingData);
        const processPath = async (filePath) => {
            try {
                const stats = await fs.promises.stat(filePath);
                if (stats.isFile()) {
                    const mimeType = mime.lookup(filePath);
                    if (isSupportedAudioFormat(mimeType)) {
                        const metadata = await mm.parseFile(filePath);
                        const cTime = stats.birthtime;
                        const fileSize = (stats.size / 1048576).toFixed(2) + "MB"

                        const cleanedMetadata = {
                            common: {
                                title: metadata.common.title || '',
                                artist: metadata.common.artist || '',
                                album: metadata.common.album || ''
                            },
                            format: {
                                duration: metadata.format.duration || 0,
                                bitrate: metadata.format.bitrate || 0,
                                sampleRate: metadata.format.sampleRate || 0,
                                bitsPerSample: metadata.format.bitsPerSample || 0
                            }
                        };
                        //信息格式化
                        function removeSpecialCharacters(str) {
                            return str.replace(/[\\/:*?<>|"]/g, '');
                        }
                        function formatDuration(durationInSeconds) {
                            const hours = Math.floor(durationInSeconds / 3600);
                            const minutes = Math.floor((durationInSeconds % 3600) / 60);
                            const seconds = Math.floor(durationInSeconds % 60);
                            const milliseconds = Math.round((durationInSeconds % 1) * 1000);

                            const formattedHours = hours > 0 ? hours.toString().padStart(2, '0') + ':' : '';
                            const formattedMinutes = minutes.toString().padStart(2, '0');
                            const formattedSeconds = seconds.toString().padStart(2, '0');
                            const formattedMilliseconds = milliseconds.toString().padStart(3, '0');

                            return `${formattedHours}${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;
                        }
                        function formatBitrate(bitrateInKbps) {
                            const formattedBitrate = Math.floor(bitrateInKbps / 1000);
                            return formattedBitrate.toString();
                        }
                        function formatSampleRate(sampleRate) {
                            const formattedSampleRate = (sampleRate / 1000).toFixed(1);
                            return formattedSampleRate;
                        }
                        const albumCoverTitle = removeSpecialCharacters(cleanedMetadata.common.title);
                        const formattedDuration = formatDuration(cleanedMetadata.format.duration)
                        const formattedBitrate = formatBitrate(cleanedMetadata.format.bitrate)
                        const formattedSampleRate = formatSampleRate(cleanedMetadata.format.sampleRate)
                        const formattedBitsPerSample = cleanedMetadata.format.bitsPerSample ? (cleanedMetadata.format.bitsPerSample+"bit") : "无"

                        //创建并添加歌曲信息
                        const newEntry = {
                            id: cleanedMetadata.common.title+cleanedMetadata.common.artist,
                            path: filePath,
                            cTime: cTime,
                            title: cleanedMetadata.common.title,
                            artist: cleanedMetadata.common.artist,
                            album: cleanedMetadata.common.album,
                            //albumCoverPath: "/covers/"+albumCoverTitle+formattedBitrate+".png",
                            albumCoverPath: coversFolderPath+"\\"+albumCoverTitle+formattedBitrate+".png",
                            duration: formattedDuration,
                            bitrate: formattedBitrate+"kbps",
                            sampleRate: formattedSampleRate+"kHz",
                            bitsPerSample: formattedBitsPerSample,
                            fileSize : fileSize,
                        };
                        const existingSongIndex = existingMetadata.songs.findIndex(song => song.id === newEntry.id);
                        if (existingSongIndex !== -1) {
                            existingMetadata.songs[existingSongIndex] = newEntry;
                        } else {
                            existingMetadata.songs.unshift(newEntry);
                        }

                        //保存封面
                        if (refreshCovers) {
                            const albumCover = metadata.common.picture[0];
                            const imageBuffer = Buffer.from(albumCover.data, 'base64')
                            const albumCoverPath = `${coversFolderPath}\\${albumCoverTitle}${formattedBitrate}.png`;
                            await  fs.promises.writeFile(albumCoverPath, imageBuffer)
                        }
                    }
                } else if (stats.isDirectory()) {
                    const dirEntries = await fs.promises.readdir(filePath);
                    for (const dirEntry of dirEntries) {
                        await processPath(path.join(filePath, dirEntry));
                    }
                }
            } catch (error) {
                console.error('Error processing path:', error);
            }
        };

        if (type === 'file') {
            await processPath(sourcePaths);
        } else if (type === 'files') {
            for (const audioFilePath of sourcePaths) {
                await processPath(audioFilePath);
            }
        } else if (type === 'folder') {
            const dirEntries = await fs.promises.readdir(sourcePaths);
            for (const dirEntry of dirEntries) {
                await processPath(path.join(sourcePaths, dirEntry));
            }
        } else if (type === 'folders') {
            for (const folderPath of sourcePaths) {
                await processPath(folderPath);
            }
        }
        //更新songs.json文件
        await fs.promises.writeFile(songsJsonPath, JSON.stringify(existingMetadata, null, 2), 'utf8');
        console.log('Metadata successfully added:', sourcePaths);
    } catch (error) {
        console.error('Error handling metadata:', error);
    }
};
