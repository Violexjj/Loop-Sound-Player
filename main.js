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
const localShortcut = require('electron-localshortcut');
const axios = require('axios');


let tray = null
const store = new Store();

let win = null;
let showWelcome = null
let deskTopLyric = null

let windowState = null;
let deskTopLyricState = null;

// 基本配置
const createWindow = () => {
    // 从存储中获取窗口状态，如果不存在则使用默认值
    windowState = store.get('windowState', {
        width: 1200,  // 默认宽度
        height: 750, // 默认高度
        x: 30, // 默认 x 位置
        y: 30, // 默认 y 位置
    });
    deskTopLyricState = store.get('deskTopLyricState', {
        width: 4000,  // 默认宽度
        height: 190, // 默认高度
        x: 0, // 默认 x 位置
        y: 0, // 默认 y 位置
    });

    // 播放器主界面
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
    win.setMinimumSize(450, 450);

    win.loadURL('http://localhost:8080');
    // win.loadFile(path.join(__dirname, 'dist','index.html'));
    //win.loadURL('https://music.163.com/');
    //  win.loadFile('./test.html');

    // 打开开发者工具
    // win.webContents.openDevTools();

    // 开屏动画
    showWelcome = new BrowserWindow({
        width: 500,
        height: 200,
        transparent: true,
        frame: false,
        show: false,
        icon: path.join(__dirname, 'dist','img','logo.ico'),
    });
    showWelcome.loadFile(path.join(__dirname, 'dist','WelPageAndDeskLrc', 'Welcome.html'));

    // 桌面歌词
    deskTopLyric = new BrowserWindow({
        width: deskTopLyricState.width,
        height: deskTopLyricState.height,
        x: deskTopLyricState.x,
        y: deskTopLyricState.y,
        alwaysOnTop: true,
        show: false,
        frame: false,
        transparent: true,
        icon: path.join(__dirname, 'dist','img','logo.ico'),
        webPreferences: {
            preload: path.resolve(__dirname, './preload.js')
        }
    });
    deskTopLyric.loadFile(path.join(__dirname, 'dist', 'WelPageAndDeskLrc', 'DeskTopLyric.html'));
    deskTopLyric.setSkipTaskbar(true)
    deskTopLyric.setMinimumSize(352, 92);

    // 加载好页面内容再打开界面
    win.on("ready-to-show", () => {
        // showWelcome.show();
        win.show()
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
    ipcMain.handle('maximize-window', async (event, flag) => {
        if (flag === 1) {
            if (win.isMaximized()) {
                win.restore();
            } else {
                win.maximize();
            }
        } else {
            if (win.isFullScreen()) {
                win.setFullScreen(false)
            } else {
                win.setFullScreen(true)
            }
        }

    });
    ipcMain.handle('close-window', (event,savingState) => {
        // 在窗口关闭时获取当前窗口状态并保存到 electron-store
        const currentWindowState = win.getBounds();
        const currentDeskTopLyricState = deskTopLyric.getBounds();

        console.log("before close: ", currentWindowState)
        const rightWindowState = {
            width: Math.abs(windowState.width-currentWindowState.width)> 5?currentWindowState.width:windowState.width,
            height: Math.abs(windowState.height-currentWindowState.height)> 5?currentWindowState.height:windowState.height,
            x: Math.abs(windowState.x-currentWindowState.x)> 5?currentWindowState.x:windowState.x,
            y: Math.abs(windowState.y-currentWindowState.y)> 5?currentWindowState.y:windowState.y,
        }

        const rightDeskTopLyricState = {
            width: Math.abs(deskTopLyricState.width-currentDeskTopLyricState.width)> 5?currentDeskTopLyricState.width:deskTopLyricState.width,
            height: Math.abs(deskTopLyricState.height-currentDeskTopLyricState.height)> 5?currentDeskTopLyricState.height:deskTopLyricState.height,
            x: Math.abs(deskTopLyricState.x-currentDeskTopLyricState.x)> 5?currentDeskTopLyricState.x:deskTopLyricState.x,
            y: Math.abs(deskTopLyricState.y-currentDeskTopLyricState.y)> 5?currentDeskTopLyricState.y:deskTopLyricState.y,
        }

        console.log("after close: ", rightWindowState)
        store.set('windowState', rightWindowState);
        store.set('deskTopLyricState', rightDeskTopLyricState);

        //保存播放器设置状态
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
    ipcMain.handle('closeWelcome', ()=>{
        if (!showWelcome.isDestroyed()) {
            setTimeout(()=>{
                showWelcome.close()
                win.show();
            },1000)
        }
    })

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
}

// 查找单例以及应用的关闭
const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
    app.quit();
}else {
    app.on('second-instance', () => {
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
            localShortcut.unregisterAll(win)
            app.quit()
        }
    });

    app.on('will-quit', () => {
        globalShortcut.unregisterAll();
    });
}

// 下面所有部分，是主进程与渲染进程的通信------------------------------------------------------------------------

// 更改桌面歌词颜色
ipcMain.handle('sendColor', async (event,color, type) => {
    try {
        deskTopLyric.webContents.send('changeColor', color, type);
    } catch (error) {
        console.error('Error sending color:', error);
        throw error;
    }
});

// 更改桌面歌词粗细
ipcMain.handle('sendBold', async (event,bold) => {
    try {
        deskTopLyric.webContents.send('changeBold', bold);
    } catch (error) {
        console.error('Error sending bold:', error);
        throw error;
    }
});

// 更改桌面歌词字体
ipcMain.handle('sendFont', async (event,font) => {
    try {
        deskTopLyric.webContents.send('changeFont', font);
    } catch (error) {
        console.error('Error sending bold:', error);
        throw error;
    }
});

// 接收桌面歌词按钮的请求，对播放器进行控制
ipcMain.handle('deskTopLyricButtons', async (event,buttonNo) => {
    try {
        if (buttonNo === 1) {
            if (win) {
                if (win.isMinimized()) {
                    // 如果窗口被最小化了，将其还原
                    win.restore();
                } else {
                    // 如果窗口没有最小化，将其显示在前面
                    win.show();
                }
            }
        }else if(buttonNo === 2){
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
        }else if(buttonNo === 3){
            win.webContents.send('playLast');
        }else if(buttonNo === 4){
            win.webContents.send('toggle');
        }else if(buttonNo === 5){
            win.webContents.send('playNext');
        }else if(buttonNo === 6){
            win.webContents.send('closeDeskTopLyric');
            if (deskTopLyric) {
                deskTopLyric.hide()
            }
        }
    } catch (error) {
        console.error('Error clicking desktopLyricButtons:', error);
        throw error;
    }
});

// 接收 主界面 发送的歌词，并传给桌面歌词
ipcMain.handle('sendLyric', async (event,text1, text2) => {
    try {
        deskTopLyric.webContents.send('lyricFromWin', text1, text2);
    } catch (error) {
        console.error('Error send lyric to desktopLyric:', error);
        throw error;
    }
});

let firstOpenDesktopLyric = true
function sendIsPlaying(isPlaying){
    deskTopLyric.webContents.send('sendIsPlaying',isPlaying);
}
// 打开或关闭桌面歌词
ipcMain.handle('openDeckTopLyric', async (event,flag, isPlaying) => {
    try {
        sendIsPlaying(isPlaying)
        if (flag === true) {
            if (deskTopLyric) {
                if (firstOpenDesktopLyric) {
                    deskTopLyric.webContents.send('windowResize', deskTopLyricState.width, deskTopLyricState.height);
                    deskTopLyric.show()
                    firstOpenDesktopLyric = false
                }else{
                    deskTopLyric.show()
                }
            }
        }else if(flag === false){
            if (deskTopLyric) {
                deskTopLyric.hide()
            }
        }
    } catch (error) {
        console.error('Error opening or closing desktopLyric:', error);
        throw error;
    }
});

let lockButton = false
// 桌面歌词的锁
ipcMain.on('set-ignore-mouse-events', (event) => {
    const deskTopLyric = BrowserWindow.fromWebContents(event.sender)
    if (lockButton === false) {
        deskTopLyric.setIgnoreMouseEvents(true, { forward: true })
        deskTopLyric.webContents.send('lockButton', true );
        lockButton = true
    }else{
        deskTopLyric.setIgnoreMouseEvents(false)
        deskTopLyric.webContents.send('lockButton', false );
        lockButton = false
    }
})

// 迷你模式
ipcMain.handle('miniMode', async (event, miniMode) => {
    try {

        if (win.isFullScreen()) {
            win.setFullScreen(false);
        }

        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        if (miniMode) {
            if (win.isMaximized()) {
                win.unmaximize()
            }
            win.setAlwaysOnTop(true)
            win.setMinimumSize(270, 70);
            win.setSize(270, 70, false)
            win.setPosition(Math.floor((width-270)/2),0)
        }else{
            win.setMinimumSize(450, 450);
            win.setAlwaysOnTop(false)
            win.setSize(windowState.width, windowState.height,false)
            win.setPosition(Math.floor((width-windowState.width)/2),Math.floor((height-windowState.height)/2))
        }
    } catch (error) {
        console.error('open miniMode failed:', error);
        throw error;
    }
});

// 打开文件夹所在位置
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
        // console.log(metadata)
        //更多的音频信息：格式、音轨号、年份、流派、注释
        const format = metadata.format.container
        const trackNumber = metadata.common.track.no || 0
        const year = metadata.common.year || 0
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
ipcMain.handle('readFileForMoreInfo', async (event, filePath,songId,lyricDirectory) => {
    try {
        const mm = await import('music-metadata');
        if (filePath === null || filePath === "") {
            return []
        }

        const metadata = await mm.parseFile(filePath);
        //更多的音频信息：格式、音轨号、年份、流派、注释
        const format = metadata.format.container
        const trackNumber = metadata.common.track.no || 0
        const year = metadata.common.year || 0
        const genre = metadata.common.genre || "无"
        const comment = metadata.common.comment || "无"
        const moreInfo = {
            "format": format,
            "trackNumber": trackNumber,
            "year" : year,
            "genre" : genre,
            "comment" : comment,
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

//读取歌词
ipcMain.handle('getLyrics', async (event, filePath,lyricDirectory) => {
    try {
        let lyricsFromAudio
        let lyricsFromLrc
        // 首先获取内嵌歌词
        const nodeTagLibSharp = await import('node-taglib-sharp');
        const File = nodeTagLibSharp.File
        const myFile = File.createFromPath(filePath)

        lyricsFromAudio = myFile.tag.lyrics
        myFile.dispose()

            // 获取歌词文件的歌词
            const songDirectory = path.dirname(filePath);
            const songFileName = path.basename(filePath, path.extname(filePath));

            let lrcFilePath
            if (lyricDirectory !== "未设置") {
                lrcFilePath = path.join(lyricDirectory, `${songFileName}.lrc`);
            }else{
                lrcFilePath = path.join(songDirectory, `${songFileName}.lrc`);
            }

            if (fs.existsSync(lrcFilePath)) {
                // 读取歌词文件的歌词
                lyricsFromLrc = fs.readFileSync(lrcFilePath, 'utf-8');
            } else {
                // 没有歌词文件，返回没有找到本地歌词
                lyricsFromLrc = null
                console.log(`File not found: ${lrcFilePath}`);
            }

        return {
            lyricsFromAudio: lyricsFromAudio,
            lyricsFromLrc: lyricsFromLrc,
        }

    } catch (error) {
        console.error('Error reading file in main process:', error);
        throw error;
    }
});

// 查询在线歌曲
ipcMain.handle('searchSong', async (event,keyword) => {
    try {
        const {cloudsearch} = require('NeteaseCloudMusicApi');
        const result = await cloudsearch({keywords: keyword})
        return result
    } catch (error) {
        console.error('Error reading file in main process:', error);
        throw error;
    }
});

// 查询在线歌词
ipcMain.handle('searchLyric', async (event,songId) => {
    try {
        const {lyric} = require('NeteaseCloudMusicApi');
        const result = await lyric({id: songId})
        return result
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
                "\"lyricAlignmentMode\":0," +
                "\"showTlyric\":true," +
                "\"highlight\":true," +
                "\"otherBlur\":false," +
                "\"boldLrc\":true," +
                "\"showFormat\":true," +
                "\"matchBlank\":true," +
                "\"showFolders\":true," +
                "\"showAlbums\":true," +
                "\"showArtists\":true," +
                "\"queueModal\":true," +
                "\"showSpectrum\":false," +
                "\"lyricsModal\":false," +
                "\"infoModal\":false," +
                "\"exit\":false," +
                "\"globalShortcut\":false," +
                "\"deleteLocalFile\":false," +
                "\"usePureColor\":false," +
                "\"useEQ\":true," +
                "\"onlineLrc\":true," +
                "\"savedCurrentPlaytime\":0," +
                "\"lyricDirectory\":\"未设置\"," +
                "\"pFont\":\"微软雅黑\"," +
                "\"dFont\":\"微软雅黑\"," +
                "\"dLyricColorPure\": \"#03A9F4\","+
                "\"dLyricColor\": [\"#FFA6B7\",\"#1E2AD2\"]," +
                "\"EQParam\": [0,0,0,0,0,0,0,0,0,0]," +
                "\"biggerLyric\":10," +
                "\"blur\":40," +
                "\"shortcuts\":{\n" +
                "        \"local\":{\n" +
                "            \"lExit\":\"Escape\",\n" +
                "            \"lToggle\":\"Space\",\n" +
                "            \"lLast\":\"Ctrl+Left\",\n" +
                "            \"lNext\":\"Ctrl+Right\",\n" +
                "            \"lBack3\":\"Left\",\n" +
                "            \"lForward3\":\"Right\",\n" +
                "            \"lUpVolume\":\"Up\",\n" +
                "            \"lDownVolume\":\"Down\",\n" +
                "            \"lFullScreen\":\"F11\",\n" +
                "            \"lMiniSize\":\"Ctrl+M\",\n" +
                "            \"lToHome\":\"Ctrl+Z\",\n" +
                "            \"lSettings\":\"Ctrl+S\",\n" +
                "            \"lLoopMode\":\"Ctrl+O\",\n" +
                "            \"lMute\":\"Ctrl+N\",\n" +
                "            \"lSearch\":\"Ctrl+F\",\n" +
                "            \"lQueue\":\"Ctrl+Q\",\n" +
                "            \"lLyric\":\"Ctrl+L\",\n" +
                "            \"lInfo\":\"Ctrl+I\",\n" +
                "            \"lPlaylists\":\"Ctrl+P\",\n" +
                "            \"lDesktopLyric\":\"Ctrl+D\",\n" +
                "            \"lFocusMode\":\"Ctrl+Enter\"\n" +
                "        },\n" +
                "        \"global\":{\n" +
                "            \"gOpen\":\"Alt+F10\",\n" +
                "            \"gToggle\":\"Alt+F9\",\n" +
                "            \"gLast\":\"Alt+F11\",\n" +
                "            \"gNext\":\"Alt+F12\",\n" +
                "            \"gUpVolume\":\"Alt+F7\",\n" +
                "            \"gDownVolume\":\"Alt+F6\",\n" +
                "            \"gLoopMode\":\"Alt+F5\",\n" +
                "            \"gMute\":\"Alt+F8\",\n" +
                "            \"gDesktopLyric\":\"Alt+F1\",\n" +
                "            \"gExit\":\"Alt+E\"\n" +
                "        }\n" +
                "    }," +
                "\"bright\":100," +
                "\"lyricFont2\":20," +
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

//从网易云下载封面
ipcMain.handle('getSongCoverFromNet', async (event, filePath, netId, keywords) => {
    try {
        const { cloudsearch } = require('NeteaseCloudMusicApi');
        const searchResult = await cloudsearch({ keywords: keywords });
        if (searchResult.body.code === 200 && searchResult.body.result.songCount > 0) {
            return new Promise((resolve, reject) => {
                let songIndex = 0
                if (netId !== -1 && netId !== null && netId !== undefined) {
                    const index = searchResult.body.result.songs.findIndex(song => song.id == netId);
                    if (index !== -1) {
                        songIndex = index
                    }
                }
                console.log("Found Song Index: "+songIndex)
                axios.get(searchResult.body.result.songs[songIndex].al.picUrl, { responseType: 'arraybuffer' })
                    .then(async response => {
                        const picData = await sharp(Buffer.from(response.data, 'binary'))
                            .resize(800, 800)
                            .toBuffer()
                        const nodeTagLibSharp = await import('node-taglib-sharp');
                        const File = nodeTagLibSharp.File;
                        const myFile = File.createFromPath(filePath);
                        const pic = {
                            data: nodeTagLibSharp.ByteVector.fromByteArray(picData),
                            mimeType: 'image/png',
                            type: nodeTagLibSharp.PictureType.FrontCover
                        };
                        myFile.tag.pictures = [pic];
                        myFile.save();
                        myFile.dispose();
                        console.log("Downloaded song cover successfully");
                        resolve(nativeImage.createFromBuffer(picData).toDataURL());
                    })
                    .catch(error => {
                        console.error('Error downloading song cover:', error);
                        reject(error);
                    });
            });
        } else {
            // 没有搜索结果时返回 null
            return null;
        }
    } catch (error) {
        console.error('Error downloading song cover:', error);
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

// 选择一个临时封面
ipcMain.handle('chooseCover', async (event) => {
    try {
        // 打开文件选择对话框，限制选择的文件为图片格式（png 或 jpg）
        const fileFilters = [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }];
        const filePaths = dialog.showOpenDialogSync({
            properties: ['openFile'],
            filters: fileFilters,
            title: 'Select Cover Image',
        });

        if (filePaths && filePaths.length > 0) {
            const selectedFilePath = filePaths[0];
            const imageBuffer = fs.readFileSync(selectedFilePath);
            const imageBuffer2 = await sharp(imageBuffer)
                .resize(800, 800)
                .toBuffer()
            // const imageBuffer2 = metadata.common.picture[0].data
            return [nativeImage.createFromBuffer(imageBuffer2).toDataURL(),selectedFilePath]
        } else {
            return null; // 如果用户取消了选择，则返回 null
        }
    } catch (error) {
        console.error(error);
        return null;
    }
});

//修改元信息
ipcMain.handle('editMetadata', async (event, data, lyricDirectory) => {
    try {
        const nodeTagLibSharp = await import('node-taglib-sharp');
        const File = nodeTagLibSharp.File
        const filePath = data.nowSong.path
        const myFile = File.createFromPath(filePath)
        const oldTitle = myFile.tag.title
        const oldArtist = myFile.tag.performers[0]
        const oldAlbum = myFile.tag.album

        // 修改标题、艺术家、专辑
        myFile.tag.title = data.nowSong.title
        myFile.tag.performers = [data.nowSong.artist]
        myFile.tag.album = data.nowSong.album

        // 修改音轨号、年份、注释、流派
        myFile.tag.genres = [data.moreInfo.genre]
        myFile.tag.track = parseInt(data.moreInfo.trackNumber, 10)
        myFile.tag.year = parseInt(data.moreInfo.year, 10)
        myFile.tag.comment = data.moreInfo.comment

        // 修改内嵌歌词
        if (data.lyricsFromAudio === null || data.lyricsFromAudio === undefined || data.lyricsFromAudio === "") {
            myFile.tag.lyrics = undefined
        }else{
            myFile.tag.lyrics = data.lyricsFromAudio
        }
        // 修改歌词文件
        const songDirectory = path.dirname(data.nowSong.path);
        const songFileName = path.basename(data.nowSong.path, path.extname(data.nowSong.path));

        let lrcFilePath
        if (lyricDirectory !== "未设置") {
            lrcFilePath = path.join(lyricDirectory, `${songFileName}.lrc`);
        }else{
            lrcFilePath = path.join(songDirectory, `${songFileName}.lrc`);
        }

        if (fs.existsSync(lrcFilePath)) {
            if (!data.lyricsFromLrc) {
                fs.unlinkSync(lrcFilePath);
                console.log(`Deleted file: ${lrcFilePath}`);
            } else {
                fs.writeFileSync(lrcFilePath, data.lyricsFromLrc, "utf-8");
                console.log(`Updated file: ${lrcFilePath}`);
            }
        } else if (data.lyricsFromLrc) {
            fs.writeFileSync(lrcFilePath, data.lyricsFromLrc, "utf-8");
            console.log(`Created file: ${lrcFilePath}`);
        } else {
            console.log(`File not found: ${lrcFilePath}`);
        }


        // 修改封面
        if (data.coverPath) {
            if (data.coverPath === "删除封面") {
                console.log("delete cover")
                myFile.tag.pictures = []
            }else{
                console.log("set cover: "+data.coverPath)
                const pic = {
                    data: nodeTagLibSharp.ByteVector.fromPath(data.coverPath),
                    mimeType: 'image/png',
                    type: nodeTagLibSharp.PictureType.FrontCover
                }
                myFile.tag.pictures = [pic]
            }
        }

        // 保存
        myFile.save()
        myFile.dispose()

        // 修改音乐库，如果标题、艺术家或者专辑被改变
        if (oldTitle !== data.nowSong.title || oldArtist !== data.nowSong.artist || oldAlbum !== data.nowSong.album) {
            console.log("title or artist or album changed")
            const libraryFilePath = path.join(app.getPath('appData'), 'Sonorbit', 'songsNoSameId.json');
            const libraryData = fs.readFileSync(libraryFilePath, 'utf8');
            const libraryObject = JSON.parse(libraryData);

            const songIndexToUpdate = libraryObject.songs.findIndex(song => song.id === data.nowSong.id);
            if (songIndexToUpdate !== -1) {
                libraryObject.songs[songIndexToUpdate].title = data.nowSong.title;
                libraryObject.songs[songIndexToUpdate].artist = data.nowSong.artist;
                libraryObject.songs[songIndexToUpdate].album = data.nowSong.album;
            }
            const updatedLibraryData = JSON.stringify(libraryObject, null, 2);
            fs.writeFileSync(libraryFilePath, updatedLibraryData, 'utf8');
        }else{
            console.log("Will not change song in Library")
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

 // 修改快捷键
ipcMain.handle('changeShortcuts', async (event,type, whichKey, oldVal, newVal) => {
    try {
        console.log(whichKey+" 由 "+oldVal+" 改为 "+newVal)
        if (type === "local") {
            if (oldVal !== "未设置") {
                if (localShortcut.isRegistered(win, oldVal)) {
                    localShortcut.unregister(win,oldVal)
                }
            }
            if (newVal !== "未设置") {
                if (whichKey === "lExit") {
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('closeFromBottom');
                    });
                }else if(whichKey === "lToggle"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('toggle');
                    });
                }else if(whichKey === "lLast"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('playLast');
                    });
                }else if(whichKey === "lNext"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('playNext');
                    });
                }else if(whichKey === "lBack3"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('forwardBack',false);
                    });
                }else if(whichKey === "lForward3"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('forwardBack',true);
                    });
                }else if(whichKey === "lUpVolume"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('upVolume');
                    });
                }else if(whichKey === "lDownVolume"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('downVolume');
                    });
                }else if(whichKey === "lToHome"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('returnHome');
                    });
                }else if(whichKey === "lSettings"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('openSettings');
                    });
                }else if(whichKey === "lLoopMode"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('changeModeG');
                    });
                }else if(whichKey === "lMute"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('changeMute');
                    });
                }else if(whichKey === "lSearch"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('search');
                    });
                }else if(whichKey === "lQueue"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('showQueue');
                    });
                }else if(whichKey === "lLyric"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('showLyric');
                    });
                }else if(whichKey === "lInfo"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('showInfo');
                    });
                }else if(whichKey === "lPlaylists"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('showPlaylists');
                    });
                }else if(whichKey === "lDesktopLyric"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('changeShowDLyric');
                    });
                }else if(whichKey === "lFocusMode"){
                    localShortcut.register(win, newVal, () => {
                        win.webContents.send('focusMode');
                    });
                }
            }
        }else{
            if (oldVal !== "未设置") {
                if (globalShortcut.isRegistered(oldVal)) {
                    globalShortcut.unregister(oldVal)
                }
            }
            if (newVal !== "未设置") {
                if(whichKey === "gOpen"){
                    globalShortcut.register(newVal, () => {
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
                }else if(whichKey === "gToggle"){
                    globalShortcut.register(newVal, () => {
                        win.webContents.send('toggleG');
                    });
                }else if(whichKey === "gLast"){
                    globalShortcut.register(newVal, () => {
                        win.webContents.send('playLastG');
                    });
                }else if(whichKey === "gNext"){
                    globalShortcut.register(newVal, () => {
                        win.webContents.send('playNextG');
                    });
                }else if(whichKey === "gUpVolume"){
                    globalShortcut.register(newVal, () => {
                        win.webContents.send('upVolumeG');
                    });
                }else if(whichKey === "gDownVolume"){
                    globalShortcut.register(newVal, () => {
                        win.webContents.send('downVolumeG');
                    });
                }else if(whichKey === "gLoopMode"){
                    globalShortcut.register(newVal, () => {
                        win.webContents.send('changeModeG');
                    });
                }else if(whichKey === "gMute"){
                    globalShortcut.register(newVal, () => {
                        win.webContents.send('changeMuteG');
                    });
                }else if(whichKey === "gDesktopLyric"){
                    globalShortcut.register(newVal, () => {
                        win.webContents.send('changeShowDLyricG');
                    });
                }else if(whichKey === "gExit"){
                    globalShortcut.register(newVal, () => {
                        win.webContents.send('saveBeforeQuit',2);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error changing shortcuts:', error);
        throw error;
    }
});

// 初始化或者恢复默认的快捷键
ipcMain.handle('initializeShortcuts', async (event,shortcuts) => {
    try {
        // 注销所有快捷键
        localShortcut.unregisterAll(win)
        globalShortcut.unregisterAll()

        // 注册局部快捷键
        for (let key in shortcuts.local) {
            if (shortcuts.local[key] !== "未设置") {
                localShortcut.register(win, shortcuts.local[key], () => {
                    if (key === "lExit") {
                        win.webContents.send('closeFromBottom');
                    }else if(key === "lToggle"){
                        win.webContents.send('toggle');
                    }else if(key === "lLast"){
                        win.webContents.send('playLast');
                    }else if(key === "lNext"){
                        win.webContents.send('playNext');
                    }else if(key === "lBack3"){
                        win.webContents.send('forwardBack',false);
                    }else if(key === "lForward3"){
                        win.webContents.send('forwardBack',true);
                    }else if(key === "lUpVolume"){
                        win.webContents.send('upVolume');
                    }else if(key === "lDownVolume"){
                        win.webContents.send('downVolume');
                    }else if(key === "lSettings"){
                        win.webContents.send('openSettings');
                    }else if(key === "lLoopMode"){
                        win.webContents.send('changeModeG');
                    }else if(key === "lSearch"){
                        win.webContents.send('search');
                    }else if(key === "lQueue"){
                        win.webContents.send('showQueue');
                    }else if(key === "lLyric"){
                        win.webContents.send('showLyric');
                    }else if(key === "lInfo"){
                        win.webContents.send('showInfo');
                    }else if(key === "lPlaylists"){
                        win.webContents.send('showPlaylists');
                    }else if(key === "lFocusMode"){
                        win.webContents.send('focusMode');
                    }else if(key === "lToHome"){
                        win.webContents.send('returnHome');
                    }else if(key === "lMute"){
                        win.webContents.send('changeMute');
                    }else if(key === "lDesktopLyric"){
                        win.webContents.send('changeShowDLyric');
                    }
                });
            }
        }

        // 注册全局快捷键
        for (let key in shortcuts.global) {
            if (shortcuts.local[key] !== "未设置") {
                globalShortcut.register(shortcuts.global[key], () => {
                    if (key === "gToggle") {
                        win.webContents.send('toggleG');
                    }else if(key === "gLast"){
                        win.webContents.send('playLastG');
                    }else if(key === "gNext"){
                        win.webContents.send('playNextG');
                    }else if(key === "gUpVolume"){
                        win.webContents.send('upVolumeG');
                    }else if(key === "gDownVolume"){
                        win.webContents.send('downVolumeG');
                    }else if(key === "gLoopMode"){
                        win.webContents.send('changeModeG');
                    }else if(key === "gMute"){
                        win.webContents.send('changeMuteG');
                    }else if(key === "gDesktopLyric"){
                        win.webContents.send('changeShowDLyricG');
                    }else if(key === "gExit"){
                        win.webContents.send('saveBeforeQuit',2);
                    }else if(key === "gOpen"){
                        if (win) {
                            if (win.isMinimized()) {
                                win.restore();
                            } else {
                                win.show();
                            }
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error initializeShortcuts:', error);
        throw error;
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

// 更新任务栏绿色播放进度
ipcMain.handle('sendProgress', async (event,progress) => {
    try {
        win.setProgressBar(progress)
    } catch (error) {
        console.error('Error sendProgress:', error);
        throw error;
    }
});

// 更新任务栏暂停播放状态
ipcMain.handle('sendToggle', async (event,progress, isPlaying) => {
    try {
        const mode = isPlaying ? "normal" : "paused"
        win.setProgressBar(progress, {mode})
    } catch (error) {
        console.error('Error sendProgress:', error);
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
                    win.webContents.send('errorFile')
                    console.error('处理元数据时出错:', error);
                });
            } else {
                handleMetadata('folders', result.filePaths).then(() => {
                    win.webContents.send('finishScan');
                }).catch(error => {
                    win.webContents.send('errorFile')
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
                    win.webContents.send('errorFile')
                    console.error('处理元数据时出错:', error);
                });
            } else {
                handleMetadata('files', result.filePaths).then(() => {
                    win.webContents.send('finishScan');
                }).catch(error => {
                    win.webContents.send('errorFile')
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
                        win.webContents.send('errorFile')
                        console.error('处理元数据时出错:', error);
                    });
                } else if (stats.isDirectory()) {
                    // 单个文件夹
                    handleMetadata('folder', filePath).then(() => {
                        win.webContents.send('finishScan');
                    }).catch(error => {
                        console.error('处理元数据时出错:', error);
                        win.webContents.send('errorFile')
                    });
                }
            } catch (error) {
                win.webContents.send('errorFile')
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
                        win.webContents.send('errorFile')
                        console.error('处理元数据时出错:', error);
                    });
                }
                // 都是文件夹
                else if (firstFileType === 'folder') {
                    handleMetadata('folders', filePaths).then(() => {
                        win.webContents.send('finishScan');
                    }).catch(error => {
                        win.webContents.send('errorFile')
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
                        const fileName = path.basename(filePath, path.extname(filePath));
                        const metadata = await mm.parseFile(filePath);
                        // console.log(metadata)
                        const cTime = stats.birthtime;
                        const fileSize = (stats.size / 1048576).toFixed(2) + "MB"
                        const cleanedMetadata = {
                            common: {
                                title: (metadata.common.title || '未知标题[ERROR]').trim(),
                                artist: (metadata.common.artist || '未知艺术家[ERROR]').trim(),
                                album: (metadata.common.album || '未知专辑[ERROR]').trim()
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
                        const songId  = (cleanedMetadata.common.title === '未知标题[ERROR]' && cleanedMetadata.common.artist === '未知艺术家[ERROR]') ? fileName + '[ERROR]' : cleanedMetadata.common.title + cleanedMetadata.common.artist;

                        //创建并添加歌曲信息
                        const newEntry = {
                            id: songId,
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
                            if (newEntry.title !== "未知标题[ERROR]" && newEntry.artist !== "未知艺术家[ERROR]") {
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

