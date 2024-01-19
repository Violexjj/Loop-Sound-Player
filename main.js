
//运行vue，执行 npm run serve
// 打开界面，npm start
// 打包vue为dist，npm run build
// 打包electron，cnpm run dist

const path = require('path');
const { shell, app, BrowserWindow, ipcMain,nativeImage,dialog, Tray,Menu, globalShortcut,screen} = require('electron');
const fs = require('fs');
const mime = require('mime-types');
const jsmediatags = require('jsmediatags');
const Store = require('electron-store');
const sharp = require('sharp');




let tray = null

const store = new Store();
let win = null;
let windowState = null;

// 基本配置
const createWindow = () => {
    // 从存储中获取窗口状态，如果不存在则使用默认值
    windowState = store.get('windowState', {
        width: 1000,  // 默认宽度
        height: 780, // 默认高度
        x: 30, // 默认 x 位置
        y: 30, // 默认 y 位置
    });
    win = new BrowserWindow({
        width: windowState.width,
        height: windowState.height,
        frame: false,
        show: false,
        icon: path.join(__dirname, 'dist','img','logo.ico'),
        webPreferences: {
            preload: path.resolve(__dirname, './preload.js')
        }
    });
        win.setMinimumSize(642, 629);

    // 装载页面
    win.loadURL('http://192.168.41.6:8080');
    //win.loadURL('https://music.163.com/');
    // win.loadFile('./index.html');
    //win.loadFile(path.join(__dirname, 'dist', 'index.html'));

    // 打开开发者工具
    // win.webContents.openDevTools();

    // 加载好页面内容再打开界面
    win.on("ready-to-show", () => {
            win.show();
    });

    win.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            win.webContents.send('closeFromBottom');
        }
    });

    ipcMain.handle('minimize-window', () => {
        win.minimize();
    });
    ipcMain.handle('hide-window', () => {
        win.hide();
    });
    ipcMain.handle('maximize-window', () => {
        if (win.isMaximized()) {
            win.restore();
        }else{
            win.maximize();
        }
    });
    ipcMain.handle('close-window', (event,savingState) => {
        // 在窗口关闭时获取当前窗口状态并保存到 electron-store
        const currentWindowState = win.getBounds();
        console.log("before close: ", currentWindowState)
        const rightWindowState = {
            width: Math.abs(windowState.width-currentWindowState.width)> 5?currentWindowState.width:windowState.width,
            height: Math.abs(windowState.height-currentWindowState.height)> 5?currentWindowState.height:windowState.height,
            x: Math.abs(windowState.x-currentWindowState.x)> 5?currentWindowState.x:windowState.x,
            y: Math.abs(windowState.y-currentWindowState.y)> 5?currentWindowState.y:windowState.y,
        }
        console.log("after close: ", rightWindowState)
        store.set('windowState', rightWindowState);
        //保存设置状态
        const appDataPath = path.join(process.env.APPDATA, 'Sonorbit');
        const savingStatePath = path.join(appDataPath, 'savingState.json');
        if (!fs.existsSync(appDataPath)) {
            fs.mkdirSync(appDataPath);
        }
        if (!fs.existsSync(savingStatePath)) {
            fs.writeFileSync(savingStatePath, JSON.stringify({ savingState: {} }));
        }
        const existingData = fs.readFileSync(savingStatePath, 'utf-8');
        const jsonData = JSON.parse(existingData);

        jsonData.savingState = savingState;
        fs.writeFileSync(savingStatePath, JSON.stringify(jsonData));
        app.isQuitting = true;
        app.quit()
    });

    //设置托盘
    const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'dist','img','logo2.ico'));
    tray = new Tray(trayIcon);
    // 设置托盘右键菜单
    tray.setToolTip('Sonorbit');
    const contextMenu = Menu.buildFromTemplate([
        { label: '打开播放器', click: () => {
                if (win) {
                    if (win.isMinimized()) {
                        // 如果窗口被最小化了，将其还原
                        win.restore();
                    } else {
                        // 如果窗口没有最小化，将其显示在前面
                        win.show();
                    }
                }
            } },
        { type: 'separator' },
        { label: '音量 + 3', click: () => {
                if (win) {
                    win.webContents.send('upVolume');
                }
            }},
        { label: '音量 - 3', click: () => {
                if (win) {
                    win.webContents.send('downVolume');
                }
            }},
        { label: '静音 / 取消静音', click: () => {
                if (win) {
                    win.webContents.send('changeMute');
                }
            }},
        { type: 'separator' },
        {
            label: '循环模式',
            submenu: [
                { label: '队列循环', click: () => { win.webContents.send('loop'); } },
                { label: '无序循环', click: () => { win.webContents.send('random'); } },
                { label: '单曲循环', click: () => { win.webContents.send('one'); } },
            ],
        },
        { type: 'separator' },
        { label: '上一曲', click: () => {
                if (win) {
                    win.webContents.send('playLast');
                }
            }},
        { label: '暂停 / 播放', click: () => {
                if (win) {
                    win.webContents.send('toggle');
                }
            }}, { label: '下一曲', click: () => {
                if (win) {
                    win.webContents.send('playNext');
                }
            }},
        { type: 'separator' },
        { label: '设置', click: () => {
                win.webContents.send('openSettings');
                if (win) {
                    if (win.isMinimized()) {
                        // 如果窗口被最小化了，将其还原
                        win.restore();
                    } else {
                        // 如果窗口没有最小化，将其显示在前面
                        win.show();
                    }
                }
            } },
        { type: 'separator' },
        { label: '退出', click: () => {
                win.webContents.send('saveBeforeQuit',1);
            } },
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        if (win) {
            if (win.isMinimized()) {
                // 如果窗口被最小化了，将其还原
                win.restore();
            } else {
                // 如果窗口没有最小化，将其显示在前面
                win.show();
            }
        }
    });

    //--------------------------------------------------------------------------
    //设置快捷键
    globalShortcut.register('Alt+E', () => {
        win.webContents.send('saveBeforeQuit',2);
    });
    globalShortcut.register('Alt+F9', () => {
        win.webContents.send('toggleG');
    });
    globalShortcut.register('Alt+F11', () => {
        win.webContents.send('playLastG');
    });
    globalShortcut.register('Alt+F12', () => {
        win.webContents.send('playNextG');
    });
    globalShortcut.register('Alt+F6', () => {
        win.webContents.send('downVolumeG');
    });
    globalShortcut.register('Alt+F7', () => {
        win.webContents.send('upVolumeG');
    });
    globalShortcut.register('Alt+F8', () => {
        win.webContents.send('changeMuteG');
    });
    globalShortcut.register('Alt+F5', () => {
        win.webContents.send('changeModeG');
    });
    globalShortcut.register('Alt+F10', () => {
        if (win) {
            if (win.isMinimized()) {
                // 如果窗口被最小化了，将其还原
                win.restore();
            } else {
                // 如果窗口没有最小化，将其显示在前面
                win.show();
            }
        }
    });


}

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
    // 如果无法获得单实例锁，说明已经有一个应用实例在运行，直接退出当前应用
    app.quit();
}
else {
    // 如果获得了单实例锁，就继续创建主窗口
    app.on('second-instance', () => {
        // 当尝试打开第二个实例时，激活第一个实例的窗口
        if (win) {
            if (win.isMinimized()) {
                win.restore();
            }else{
                win.show();
            }
        }
    });

    // Electron 应用准备就绪后创建主窗口
    app.whenReady().then(() => {
        createWindow();
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    });

    // 程序的关闭
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            if (tray) {
                tray.destroy();
            }
            app.quit()
        }
    });

    app.on('will-quit', () => {
        globalShortcut.unregisterAll();
    });
}

// 修改元数据
ipcMain.handle('changeInfo', async (event, path) => {
    // console.log(path)
    // const NodeID3 = require('node-id3')
    // const tags = NodeID3.read(path)
    // console.log(tags);
    // tags.comment.text = "Sun"
    // const success = NodeID3.write(tags, path)
    // console.log(success)
    // const fileBuffer = await fs.promises.readFile(path)
    // const tag = require('flac-tagger')
    // const tags = tag.readFlacTags(fileBuffer)
    // console.log((await tags).tagMap.ARTIST)
    // const tagMap = {
    //     FlacTagMap:{
    //         title: 'hhh'
    //     }
    // }
    // await tag.writeFlacTags(tagMap, path)
    // 读取 FLAC 文件的内容
    const fileBuffer = await fs.promises.readFile(path);

    // 读取 FLAC 文件的标签信息
    // const tags = await tag.readFlacTags(fileBuffer);
    // tags.tagMap.TITLE = "fds"
    // await tag.writeFlacTags(tags, path)
});

// 迷你模式
ipcMain.handle('miniMode', async (event, miniMode) => {
    try {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        if (miniMode) {
            win.setAlwaysOnTop(true)
            win.setMinimumSize(270, 70);
            win.setSize(270, 70, false)
            win.setPosition(Math.floor((width-270)/2),0)
        }else{
            win.setAlwaysOnTop(false)
            win.setSize(windowState.width, windowState.height,false)
            win.setPosition(Math.floor((width-windowState.width)/2),Math.floor((height-windowState.height)/2))
            win.setMinimumSize(632, 629);
        }
    } catch (error) {
        console.error('open miniMode failed:', error);
        throw error;
    }
});

ipcMain.handle('openFolder', (event, folderPath) => {
    try {
        shell.showItemInFolder(folderPath);
    } catch (error) {
        console.error('Error opening and highlighting folder:', error);
    }
});

// 监听来自渲染进程的打开文件夹并高亮文件请求
ipcMain.handle('openFile', (event, filePath, lyricDirectory) => {
    if (!lyricDirectory) {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error('File does not exist or is inaccessible');
                return; // 文件不存在或不可访问
            }
            shell.showItemInFolder(filePath);
        });
    }else{
        const songDirectory = path.dirname(filePath);
        const songFileName = path.basename(filePath, path.extname(filePath));

        let lrcFilePath
        if (lyricDirectory !== "未设置") {
            lrcFilePath = path.join(lyricDirectory, `${songFileName}.lrc`);
        }else{
            lrcFilePath = path.join(songDirectory, `${songFileName}.lrc`);
        }
        console.log(lrcFilePath)
        fs.access(lrcFilePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error('File does not exist or is inaccessible');
                return; // 文件不存在或不可访问
            }
            shell.showItemInFolder(lrcFilePath);
        });
    }
});

//读取音频、更多信息和歌词
ipcMain.handle('read-file', async (event, filePath,lyricDirectory,songId) => {
    try {
        const mm = await import('music-metadata');
        if (filePath === null || filePath === "") {
            return []
        }
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

        //网易云id
        const netIdFilePath = path.join(process.env.APPDATA, 'Sonorbit', 'songNetId.json');

        if (!fs.existsSync(netIdFilePath)) {
            fs.writeFileSync(netIdFilePath, '[]', 'utf-8');
        }

        let netId = -1
        const netIdData = fs.readFileSync(netIdFilePath, 'utf-8');
        const data = JSON.parse(netIdData);

        const index = data.findIndex(item => item.songId === songId)
        if (index!==-1) {
            // 找到了
            netId = data[index].netId
        }

        //歌词文本
        if (metadata.format.container === "MPEG") {
            return new Promise((resolve, reject) => {
                jsmediatags.read(fileBuffer, {
                    onSuccess: function(tag) {
                        if (tag.tags.lyrics != null) {
                            const lyric = tag.tags.lyrics;
                            resolve([songAudio, moreInfo, lyric, netId]);
                        }else{
                            if (lyricDirectory !== "未设置") {
                                let lyricData
                                let lyric
                                const lrcFilePath = path.join(lyricDirectory,audioName+'.lrc'); // 构建LRC文件的路径
                                try {
                                    // 尝试读取lyricDirectory文件夹下的 lrcFilePath
                                    lyricData = fs.readFileSync(lrcFilePath, 'utf-8');
                                    lyric = {
                                        lyrics : lyricData
                                    }
                                } catch (error) {
                                    // 如果读取LRC文件失败，设置歌词为“没有找到本地歌词”
                                    lyric = {
                                        lyrics : "[00:00.00]没有找到本地歌词"
                                    }
                                }
                                resolve([songAudio, moreInfo, lyric, netId]);
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
                                    // 如果读取LRC文件失败，设置歌词为“没有找到本地歌词”
                                    lyric = {
                                        lyrics : "[00:00.00]没有找到本地歌词"
                                    }
                                }
                                resolve([songAudio, moreInfo, lyric, netId]);
                            }

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
                return [songAudio, moreInfo, lyric, netId];
            }else{
                if (lyricDirectory !== "未设置") {
                    let lyricData
                    let lyric
                    const lrcFilePath = path.join(lyricDirectory,audioName+'.lrc'); // 构建LRC文件的路径

                    try {
                        // 尝试读取lyricDirectory文件夹下的 lrcFilePath
                        lyricData = fs.readFileSync(lrcFilePath, 'utf-8');
                        lyric = {
                            lyrics : [lyricData]
                        }
                    } catch (error) {
                        // 如果读取LRC文件失败，设置歌词为“没有找到本地歌词”
                        lyric = {
                            lyrics : ["[00:00.00]没有找到本地歌词"]
                        }
                    }
                    return [songAudio, moreInfo, lyric, netId];
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
                        // 如果读取同文件夹下同名的LRC文件失败，设置歌词为“没有找到本地歌词”
                        lyric = {
                            lyrics : ["[00:00.00]没有找到本地歌词"]
                        }
                    }
                    return [songAudio, moreInfo, lyric, netId];
                }
            }
        }

    } catch (error) {
        console.error('Error reading file in main process:', error);
        throw error;
    }
});

//读取更多信息和netId
ipcMain.handle('readFileForMoreInfo', async (event, filePath,songId) => {
    try {
        const mm = await import('music-metadata');
        if (filePath === null || filePath === "") {
            return []
        }

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

        //网易云id
        const netIdFilePath = path.join(process.env.APPDATA, 'Sonorbit', 'songNetId.json');

        if (!fs.existsSync(netIdFilePath)) {
            fs.writeFileSync(netIdFilePath, '[]', 'utf-8');
        }

        let netId = -1
        const netIdData = fs.readFileSync(netIdFilePath, 'utf-8');
        const data = JSON.parse(netIdData);

        const index = data.findIndex(item => item.songId === songId)
        if (index!==-1) {
            // 找到了
            netId = data[index].netId
        }

        return {
            moreInfo: moreInfo,
            netId: netId
        }

    } catch (error) {
        console.error('Error reading file in main process:', error);
        throw error;
    }
});

//写入在线歌词
ipcMain.handle('writeOnlineLrc', async (event,onlineLrc, songPath,lyricDirectory) => {
    const songDirectory = path.dirname(songPath);
    const songFileName = path.basename(songPath, path.extname(songPath));

    let lrcFilePath
    if (lyricDirectory !== "未设置") {
        lrcFilePath = path.join(lyricDirectory, `${songFileName}.lrc`);
    }else{
        lrcFilePath = path.join(songDirectory, `${songFileName}.lrc`);
    }
    console.log("write file: "+lrcFilePath)
    fs.writeFileSync(lrcFilePath, onlineLrc, "utf-8");
});

//删除在线歌词
ipcMain.handle('delOnlineLrc', async (event,songPath,lyricDirectory) => {
    const songDirectory = path.dirname(songPath);
    const songFileName = path.basename(songPath, path.extname(songPath));

    let lrcFilePath
    if (lyricDirectory !== "未设置") {
        lrcFilePath = path.join(lyricDirectory, `${songFileName}.lrc`);
    }else{
        lrcFilePath = path.join(songDirectory, `${songFileName}.lrc`);
    }

    if (fs.existsSync(lrcFilePath)) {
        fs.unlinkSync(lrcFilePath);
        console.log(`Deleted file: ${lrcFilePath}`);
    } else {
        console.log(`File not found: ${lrcFilePath}`);
    }
});

//更改歌词文件夹
ipcMain.handle('changeLyricDirectory', async (event) => {
    let directory = null;
    try {
        const result = await dialog.showOpenDialog({ buttonLabel: '选择', properties: ['openDirectory'] });
        if (!result.canceled) {
            directory = result.filePaths[0];
        }
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
    return directory;
});

//读取所有歌曲
ipcMain.handle('getAllSongs', async (event) => {
    try {
        //const filePath = path.join(process.env.APPDATA, 'Sonorbit\\songsInProduction.json');
        const filePath = path.join(process.env.APPDATA, 'Sonorbit\\songsNoSameId.json');
        //C:\Users\30595\AppData\Roaming\Sonorbit\songs.json

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
        const filePath = path.join(process.env.APPDATA, 'Sonorbit\\savingState.json');
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            const rawDate  = "{\"savingState\":{\"queue\":[{\"id\":\"\",\"path\":\"\",\"cTime\":\"\",\"title\":\"\",\"artist\":\"\",\"album\":\"\",\"duration\":\"\",\"bitrate\":\"\",\"sampleRate\":\"\",\"bitsPerSample\":\"\",\"fileSize\":\"\"}]," +
                "\"currentIndex\":0," +
                "\"nowMode\":1," +
                "\"volume\":18," +
                "\"isMute\":false," +
                "\"showLyrics\":true," +
                "\"check\":true," +
                "\"toHomeAfterChangeQueue\":true," +
                "\"autoHideLrc\":true," +
                "\"showQueue\":true," +
                "\"lyricAlignmentMode\":1," +
                "\"showTlyric\":true," +
                "\"highlight\":true," +
                "\"showFormat\":true," +
                "\"showFolders\":true," +
                "\"showAlbums\":true," +
                "\"showArtists\":true," +
                "\"queueModal\":true," +
                "\"lyricsModal\":false," +
                "\"infoModal\":false," +
                "\"exit\":false," +
                "\"globalShortcut\":false," +
                "\"deleteLocalFile\":false," +
                "\"onlineLrc\":true," +
                "\"savedCurrentPlaytime\":0," +
                "\"lyricDirectory\":\"未设置\"," +
                "\"biggerLyric\":10," +
                "\"blur\":40," +
                "\"bright\":100," +
                "\"lyricFont\":20}}"
            fs.writeFileSync(filePath, rawDate, 'utf-8');
        }
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
        const filePath = path.join(process.env.APPDATA, 'Sonorbit\\playlists.json');
        //C:\Users\30595\AppData\Roaming\Sonorbit\songs.json
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
ipcMain.handle('add-new-playlist-or-delete', async (event, newPlaylist, addOrDelete) => {
    const filePath = path.join(process.env.APPDATA, 'Sonorbit\\playlists.json');
    const coverDir = path.join(app.getPath('appData'), 'Sonorbit', 'cover');
    const coverPath = path.join(coverDir, newPlaylist + '.jpg'); // 假设使用 jpg 格式的封面图片

    // 如果封面文件夹不存在，则创建一个名为 `cover` 的文件夹
    if (!fs.existsSync(coverDir)) {
        fs.mkdirSync(coverDir);
    }
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(path.dirname(filePath), {recursive: true});
        fs.writeFileSync(filePath, '[]', 'utf-8');
    }
    try {
        const playlists = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (addOrDelete) {
            playlists.push(newPlaylist);
        }
        else {
            // 删除播放列表及其封面
            if (fs.existsSync(coverPath)) {
                fs.unlinkSync(coverPath);
            }
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

//修改播放列表名称
ipcMain.handle('rename', (event, {oldName,newName}) => {
    const filePath = path.join(process.env.APPDATA, 'Sonorbit\\playlists.json');
    const coverDir = path.join(app.getPath('appData'), 'Sonorbit', 'cover');
    const oldCoverPath = path.join(coverDir, oldName + '.jpg'); // 假设使用 jpg 格式的封面图片
    const newCoverPath = path.join(coverDir, newName + '.jpg'); // 假设使用 jpg 格式的封面图片

    // 如果封面文件夹不存在，则创建一个名为 `cover` 的文件夹
    if (!fs.existsSync(coverDir)) {
        fs.mkdirSync(coverDir);
    }
    fs.rename(oldCoverPath, newCoverPath, (err) => {
        if (err) {
            console.error('Error renaming file:', err);
        } else {
            console.log('File renamed successfully!');
        }
    });

    try {
        const playlists = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const playlistIndex = playlists.findIndex(playlist => playlist.name === oldName);
            if (playlistIndex !== -1) {
                playlists[playlistIndex].name = newName
            }
        fs.writeFileSync(filePath, JSON.stringify(playlists, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error updating playlists:', error);
    }
});

//添加或者删除播放列表中的歌曲
ipcMain.handle('addTo-or-deleteFrom-playlist', async (event, playlistName, toModifySongsId, addOrDelete) => {
    try {
        const filePath = path.join(process.env.APPDATA, 'Sonorbit', 'playlists.json');

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
        const libraryFilePath = path.join(app.getPath('appData'), 'Sonorbit', 'songsNoSameId.json');
        const libraryData = fs.readFileSync(libraryFilePath, 'utf8');
        const libraryObject = JSON.parse(libraryData);

        libraryObject.songs = libraryObject.songs.filter(song => !toDeleteSongsId.includes(song.id));

        const updatedLibraryData = JSON.stringify(libraryObject, null, 2);
        fs.writeFileSync(libraryFilePath, updatedLibraryData, 'utf8');

        // 删除播放列表中id
        const playlistsFilePath = path.join(app.getPath('appData'), 'Sonorbit', 'playlists.json');
        if (fs.existsSync(playlistsFilePath)) {
            const playlistsData = fs.readFileSync(playlistsFilePath, 'utf8');
            const playlistsObject = JSON.parse(playlistsData);

            for (const playlist of playlistsObject) {
                if (playlist.songsId) {
                    playlist.songsId = playlist.songsId.filter(id => !toDeleteSongsId.includes(id));
                }
            }

            const updatedPlaylistsData = JSON.stringify(playlistsObject, null, 2);
            fs.writeFileSync(playlistsFilePath, updatedPlaylistsData, 'utf8');
        }

        return true;
    } catch (error) {
        console.error('Error deleting songs:', error);
        return false;
    }
});

// 删除本地音频文件
ipcMain.handle('deleteLocalFile', async (event, toDeleteLocalFile) => {
    toDeleteLocalFile.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        } else {
            console.log(`File not found: ${filePath}`);
        }
    });
});

//获取歌曲封面base64数据
ipcMain.handle('getSongCover', async (event, filePath,type) => {
    try {
        const mm = await import('music-metadata');
        const metadata = await mm.parseFile(filePath);
        const size = type === 1 ? 800 : 150
        const imageBuffer = await sharp(metadata.common.picture[0].data)
            .resize(size, size)
            .toBuffer()
        // const imageBuffer2 = metadata.common.picture[0].data
        return nativeImage.createFromBuffer(imageBuffer).toDataURL();
    } catch (error) {
        console.error(error);
        return null;
    }
});

//获取播放列表的封面base64数据
ipcMain.handle('getPlaylistCover', async (event, playlistName) => {
    try {
        const coverDir = path.join(app.getPath('appData'), 'Sonorbit', 'cover');
        const coverPath = path.join(coverDir, playlistName + '.jpg'); // 假设使用 jpg 格式的封面图片

        // 如果封面文件夹不存在，则创建一个名为 `cover` 的文件夹
        if (!fs.existsSync(coverDir)) {
            fs.mkdirSync(coverDir);
        }

        if (!fs.existsSync(coverPath)) {
            return null
        }else{
            const imageBuffer = await sharp(fs.readFileSync(coverPath))
                .resize(300, 300)
                .toBuffer()
            return nativeImage.createFromBuffer(imageBuffer).toDataURL();
        }
    } catch (error) {
        console.error(error);
        return null;
    }
});

// 设置播放列表的封面
ipcMain.handle('setPlaylistCover', async (event, playlistName) => {
    try {
        const coverDir = path.join(app.getPath('appData'), 'Sonorbit', 'cover');
        const coverPath = path.join(coverDir, playlistName + '.jpg'); // 假设使用 jpg 格式的封面图片

        // 如果封面文件夹不存在，则创建一个名为 `cover` 的文件夹
        if (!fs.existsSync(coverDir)) {
            fs.mkdirSync(coverDir);
        }

        // 打开文件选择对话框，限制选择的文件为图片格式（png 或 jpg）
        const fileFilters = [{ name: 'Images', extensions: ['png', 'jpg'] }];
        const filePaths = dialog.showOpenDialogSync({
            properties: ['openFile'],
            filters: fileFilters,
            title: 'Select Playlist Cover Image',
        });

        if (filePaths && filePaths.length > 0) {
            const selectedFilePath = filePaths[0];

            // 读取选择的图片文件
            const imageBuffer = fs.readFileSync(selectedFilePath);

            // 将图片写入封面文件夹中
            fs.writeFileSync(coverPath, imageBuffer);

            const imageBuffer2 = await sharp(imageBuffer)
                .resize(300, 300)
                .toBuffer()
            // const imageBuffer2 = metadata.common.picture[0].data
            return nativeImage.createFromBuffer(imageBuffer2).toDataURL();
        } else {
            return null; // 如果用户取消了选择，则返回 null
        }
    } catch (error) {
        console.error(error);
        return null;
    }
});


//对歌曲排序
ipcMain.handle('sort-songs', async (event,orderType, newArray,playlistName) => {
    try {
        if(!playlistName){
            const filePath = path.join(app.getPath('appData'), 'Sonorbit', 'songsNoSameId.json');
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
            const filePath = path.join(process.env.APPDATA, 'Sonorbit', 'playlists.json');
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

//写入歌曲的网易云netId
ipcMain.handle('setId', async (event,netId, songId) => {
    try {
        const filePath = path.join(process.env.APPDATA, 'Sonorbit', 'songNetId.json');

        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '[]', 'utf-8');
        }

        const netIdData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(netIdData);

        const index = data.findIndex(item => item.songId === songId)
        if (index!==-1) {
            // 有重复的
            data.forEach(item => {
                if (item.songId === songId) {
                    item.netId = netId; // 更新netId
                }
            });
        } else {
            //没有重复的
            data.push({songId,netId }); // 新增数据
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error updating playlist:', error);
        throw error;
    }
});

//扫描文件夹
ipcMain.handle('add-folders', async (event) => {
    dialog.showOpenDialog({ buttonLabel: '选择', properties: ['multiSelections', 'openDirectory'] }).then(result => {
        if (!result.canceled) {
            if (result.filePaths.length === 1) {
                handleMetadata('folder', result.filePaths[0]).then(() => {
                    win.webContents.send('finishScan');
                }).catch(error => {
                    console.error('处理元数据时出错:', error);
                });
            } else {
                handleMetadata('folders', result.filePaths).then(() => {
                    win.webContents.send('finishScan');
                }).catch(error => {
                    console.error('处理元数据时出错:', error);
                });
            }
        }else{
            win.webContents.send('cancelScan');
        }
    });
});

//扫描文件
ipcMain.handle('add-files', async (event) => {
    dialog.showOpenDialog({ buttonLabel: '选择',properties: ['multiSelections','openFile'] }).then(async result => {
        if (!result.canceled) {
            // event.sender.send('selected-files', result.filePaths);
            if (result.filePaths.length === 1) {
                handleMetadata('file', result.filePaths[0]).then(() => {
                    win.webContents.send('finishScan');
                }).catch(error => {
                    console.error('处理元数据时出错:', error);
                });
            } else {
                handleMetadata('files', result.filePaths).then(() => {
                    win.webContents.send('finishScan');
                }).catch(error => {
                    console.error('处理元数据时出错:', error);
                });
            }
        }else{
            win.webContents.send('cancelScan');
        }
    });
});

// 处理外部拖拽的文件或者文件夹
    ipcMain.handle('dragFile', async (event, filePaths) => {
        if (filePaths.length === 1) {
            const filePath = filePaths[0];
            try {
                const stats = fs.statSync(filePath);
                if (stats.isFile()) {
                    // 单个文件
                    handleMetadata('file', filePath).then(() => {
                        win.webContents.send('finishScan');
                    }).catch(error => {
                        console.error('处理元数据时出错:', error);
                    });
                } else if (stats.isDirectory()) {
                    // 单个文件夹
                    handleMetadata('folder', filePath).then(() => {
                        win.webContents.send('finishScan');
                    }).catch(error => {
                        console.error('处理元数据时出错:', error);
                    });
                }
            } catch (error) {
                console.error(`Error while processing ${filePath}: ${error.message}`);
            }
        } else if (filePaths.length > 1) {
            const firstFileType = fs.statSync(filePaths[0]).isFile() ? 'file' : 'folder';

            // 检查是否都是一样的类型
            if (filePaths.every(filePath => (fs.statSync(filePath).isFile() ? 'file' : 'folder') === firstFileType)) {
                // 都是文件
                if (firstFileType === 'file') {
                    handleMetadata('files', filePaths).then(() => {
                        win.webContents.send('finishScan');
                    }).catch(error => {
                        console.error('处理元数据时出错:', error);
                    });
                }
                // 都是文件夹
                else if (firstFileType === 'folder') {
                    handleMetadata('folders', filePaths).then(() => {
                        win.webContents.send('finishScan');
                    }).catch(error => {
                        console.error('处理元数据时出错:', error);
                    });
                }
            } else {
                console.log('Not same type: Cannot mix files and folders.');
                win.webContents.send('finishScanErrorMix');
            }
        }
    });
//支持的音频格式
const isSupportedAudioFormat = (mimeType) => {
    const supportedMimeTypes = [
        'audio/mpeg',
        'audio/x-flac',
        'audio/wave'
    ];
    return supportedMimeTypes.includes(mimeType);
};

//异步将所需的符合格式的音频文件扫描并添加到songs.json文件中
const handleMetadata = async (type,  sourcePaths) => {
    try {
        const appDataPath = path.join(process.env.APPDATA, 'Sonorbit');
        if (!fs.existsSync(appDataPath)) {
            fs.mkdirSync(appDataPath);
        }
        const songsJsonPath = path.join(appDataPath, 'songsNoSameId.json');
        if (!fs.existsSync(songsJsonPath) || fs.readFileSync(songsJsonPath, 'utf-8').trim() === '') {
            // Create or overwrite the file with an empty array JSON content
            const emptySongsArray = {
                songs: []
            };

            fs.writeFileSync(songsJsonPath, JSON.stringify(emptySongsArray, null, 2), 'utf-8');
        }
        //C:\Users\30595\AppData\Roaming\Sonorbit\songsNoSameId
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
                        // console.log(metadata)
                        const cTime = stats.birthtime;
                        const fileSize = (stats.size / 1048576).toFixed(2) + "MB"
                        const cleanedMetadata = {
                            common: {
                                title: (metadata.common.title || '未知标题ERROR').trim(),
                                artist: (metadata.common.artist || '').trim(),
                                album: (metadata.common.album || '').trim()
                            },
                            format: {
                                duration: metadata.format.duration || 0,
                                bitrate: metadata.format.bitrate || 0,
                                sampleRate: metadata.format.sampleRate || 0,
                                bitsPerSample: metadata.format.bitsPerSample || 0
                            }
                        };
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
                            duration: formattedDuration,
                            bitrate: formattedBitrate+"kbps",
                            sampleRate: formattedSampleRate+"kHz",
                            bitsPerSample: formattedBitsPerSample,
                            fileSize : fileSize,
                        };
                        const existingSongIndex = existingMetadata.songs.findIndex(song => song.id === newEntry.id);
                        if (existingSongIndex !== -1) {
                            if (newEntry.title !== "未知标题ERROR") {
                                existingMetadata.songs[existingSongIndex] = newEntry;
                            }else{
                                existingMetadata.songs.unshift(newEntry);
                            }
                        } else {
                            existingMetadata.songs.unshift(newEntry);
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

