<template>
    <div class="unselectable settings">
        <div v-show="showReboot" class="showReboot">
            {{info}}
        </div>
        <h1 class="title">设置 & 说明</h1><br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">
        <br>
        <div class="button-container">
            <div class="custom-button" @click="addFolders"><b>添加文件夹</b></div>
            <div class="custom-button" @click="addFiles"><b>添加文件</b></div>
        </div>
        <br>
        <br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">
        <table>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">关闭时缩小到托盘：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setExit">
                        <input type="checkbox" v-model="exit" />
                        <label ></label>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">启用全局快捷键：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setGlobalShortcut">
                        <input type="checkbox" v-model="globalShortcut" />
                        <label ></label>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">切换队列后自动切换到主页：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setToHomeAfterChangeQueue">
                        <input type="checkbox" v-model="toHomeAfterChangeQueue" />
                        <label ></label>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">主页显示歌曲格式：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setShowFormat">
                        <input type="checkbox" v-model="showFormat" />
                        <label ></label>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">主页封面信息深色背景：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setInfoModal">
                        <input type="checkbox" v-model="infoModal" />
                        <label ></label>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">主页歌词区域深色背景：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setLyricsModal">
                        <input type="checkbox" v-model="lyricsModal" />
                        <label ></label>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">主页播放队列深色背景：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setQueueModal">
                        <input type="checkbox" v-model="queueModal" />
                        <label ></label>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">当前歌词背景高亮：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setHighlight">
                        <input type="checkbox" v-model="highlight" />
                        <label ></label>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">显示翻译：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setShowTlyric">
                        <input type="checkbox" v-model="showTlyric" />
                        <label ></label>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">歌曲为纯音乐 / 无歌词时自动隐藏歌词显示：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setAutoHideLrc">
                        <input type="checkbox" v-model="autoHideLrc" />
                        <label ></label>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">无本地歌词自动搜索在线歌词并保存lrc文件：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setOnlineLrc">
                        <input type="checkbox" v-model="onlineLrc" />
                        <label ></label>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">歌词文件夹：{{this.$store.state.lyricDirectory}}</b>
                </td>
                <td>
                    <div class="custom-button align"  @click="changeLyricDirectory(true)"><b>{{"设置文件夹"}}</b></div>
                </td>
                <td>
                    <div class="custom-button align"  @click="changeLyricDirectory(false)"><b>{{"重置文件夹"}}</b></div>
                </td>
            </tr>
            <tr style="height: 60px;" >
                <td>
                    <b style="font-size: 20px">歌词文本对齐方式：</b>
                </td>
                <td>
                    <div class="custom-button align" :class="{'activee':(this.$store.state.lyricAlignmentMode === 0)}" @click="changeLyricAlignmentMode(0)"><b>{{"左对齐"}}</b></div>
                </td>
                <td>
                    <div class="custom-button align" :class="{'activee':(this.$store.state.lyricAlignmentMode === 1)}" @click="changeLyricAlignmentMode(1)"><b>{{"居中对齐"}}</b></div>
                </td>
                <td>
                    <div class="custom-button align" :class="{'activee':(this.$store.state.lyricAlignmentMode === 2)}" @click="changeLyricAlignmentMode(2)"><b>{{"右对齐"}}</b></div>
                </td>
            </tr>
            <tr style="height: 60px;" >
                <td>
                    <b style="font-size: 20px">歌词字体大小：</b>
                </td>
                <td>
                    <div class="custom-button align" @click="downFontSize()">
                        <div class="centered-content">
                            <img src="../assets/downVolume.png" alt="down" class="centered-img">
                        </div>
                    </div>

                </td>
                <td>
                    <div class="custom-button-font align"><b style="font-size: 25px">{{ this.$store.state.lyricFont-15 }}</b></div>
                </td>
                <td>
                    <div class="custom-button align" @click="upFontSize()">
                        <div class="centered-content">
                            <img src="../assets/addPlaylist.png" alt="down" class="centered-img">
                        </div>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;" >
                <td>
                    <b style="font-size: 20px">当前歌词字体放大：</b>
                </td>
                <td>
                    <div class="custom-button align" @click="downFontSize2()">
                        <div class="centered-content">
                            <img src="../assets/downVolume.png" alt="down" class="centered-img">
                        </div>
                    </div>

                </td>
                <td>
                    <div class="custom-button-font align"><b style="font-size: 25px">{{ this.$store.state.biggerLyric }}</b></div>
                </td>
                <td>
                    <div class="custom-button align" @click="upFontSize2()">
                        <div class="centered-content">
                            <img src="../assets/addPlaylist.png" alt="down" class="centered-img">
                        </div>
                    </div>
                </td>
            </tr>


        </table>

        <br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">
        <h1 class="title">属性说明</h1><br>
        <span><b>• 本播放器仅为实践小项目，如若出现问题页面爆红请重启播放器，大概率能恢复。</b></span><br><br>
        <span><b>• 仅支持 FLAC、MP3、WAV 格式的音频文件。</b></span><br><br>
        <span><b>• WAV 格式所有播放器默认都是缺少很多信息的，可以去操作说明第 1 点的目录里的“songsNoSameId.json”文件手动编辑信息。</b></span><br><br>
        <span><b>• 目前由于性能问题，时间过长的歌曲（超过 1 小时）大概率会卡死，歌曲时长计算也会出错，请谅解。</b></span><br><br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">

        <h1 class="title">操作说明</h1><br>
        <span><b>• 如若要手动更改歌曲信息、播放列表信息，请在 C:\Users\（本机用户）\AppData\Roaming\Loop Sound Player下修改文件内容，建议不要修改文件名。</b></span><br><br>
        <span><b>• 不要快速连续地切换暂停播放，否则会和淡入淡出冲入，造成总是从头播放歌曲。如果出现了，重启播放器即可。</b></span><br><br>
        <span><b>• 从音乐库删除会一并删除播放列表中对应歌曲。</b></span><br><br>
        <span><b>• 调节音量可以点击音量条，也可在音量条滚动鼠标，还可在音量按钮处滚动鼠标，或者使用↑↓快捷键以及全局快捷键，每次滚动调节音量数为3。</b></span><br><br>
        <span><b>• 点击底部控制栏最左边的圆形封面也可显示主页。</b></span><br><br>
        <span><b>• 主页右边的播放队列不会随播放列表更新而更新，如果修改了播放列表数据请重新在底部控制栏切换播放列表。</b></span><br><br>
        <span><b>• 播放列表右键可进行重命名或者删除。</b></span><br><br>
        <span><b>• 选择模式下，除手动排序，其他排序功能必须是未选中歌曲才可以使用。</b></span><br><br>
        <span><b>• 选择模式下，播放列表选中一首歌曲可进行手动排序，输入要设置的新序号即可。音乐库不支持手动排序</b></span><br><br>
        <span><b>• 搜索界面的歌曲搜索结果，双击播放，右键添加到播放列表。</b></span><br><br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">

        <h1 class="title">歌词说明</h1><br>
        <span><b>• 建议先设置歌词文件夹！</b></span><br><br>
        <span><b>• 歌词匹配优先级别：内嵌歌词 > 歌曲同文件夹同名歌词或自定义的歌词文件夹 > 在线搜索歌词。</b></span><br><br>
        <span><b>• 如果没有内嵌歌词，会从自定义设置的文件夹找同名lrc文件，没有自定义则从同文件夹查找。</b></span><br><br>
        <span><b>• 如果没有找到本地歌词会进行在线搜索，如果弹出需要"魔法"，懂的都懂。</b></span><br><br>
        <span><b>• 如果开了魔法还遇到弹窗，网络问题，多切到那首歌几次即可成功。</b></span><br><br>
        <span><b>• 在线搜索默认使用歌曲“标题+艺术家”的格式搜索，如果匹配不满意，可以在音乐库和播放列表进行精确匹配。</b></span><br><br>
        <span><b>• 在线搜索到歌词之后，会将lrc文件保存到自定义的文件夹，如果未设置会保存到歌曲同文件夹下。</b></span><br><br>
        <span><b>• 精确匹配需要输入歌曲ID，获取方法就是找到网易云对应的歌曲，复制链接，找到“song?”后面的id，输入对应的数字即可。</b></span><br><br>
        <span><b>• 精确匹配后会自动删除原来下载的歌词，以便更新。</b></span><br><br>
        <span><b>• 原则上，开了魔法和精确匹配是（ID正确）一定能找到歌词的，除非网易云那首歌真的没有歌词。</b></span><br><br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">

        <div class="shortcuts-container">
            <div class="shortcut-section">
                <h1 class="快捷键">局部快捷键</h1><br>
                <table class="queue-table">
                    <tbody >
                    <tr>
                        <td class="table-cell-num">Esc</td>
                        <td class="table-cell-num">缩小至托盘或退出</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Space（空格）</td>
                        <td class="table-cell-num">暂停 / 播放</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Ctrl + ←</td>
                        <td class="table-cell-num">上一曲</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Ctrl + →</td>
                        <td class="table-cell-num">下一曲</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">←</td>
                        <td class="table-cell-num">快退3s</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">→</td>
                        <td class="table-cell-num">快进3s</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">↑</td>
                        <td class="table-cell-num">音量 + 3</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">↓</td>
                        <td class="table-cell-num">音量 - 3</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">F11</td>
                        <td class="table-cell-num">窗口全屏</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Ctrl + M</td>
                        <td class="table-cell-num">窗口最小化</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Ctrl + Z</td>
                        <td class="table-cell-num">回到主页</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Ctrl + S</td>
                        <td class="table-cell-num">打开设置</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Ctrl + O</td>
                        <td class="table-cell-num">切换循环模式</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Ctrl + N</td>
                        <td class="table-cell-num">静音</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Ctrl + Q</td>
                        <td class="table-cell-num">显示或隐藏主页播放队列</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Ctrl + L</td>
                        <td class="table-cell-num">显示或隐藏主页歌词</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Ctrl + I</td>
                        <td class="table-cell-num">显示或隐藏主页歌曲详情</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Ctrl + P</td>
                        <td class="table-cell-num">显示或隐藏主页播放列表</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div class="shortcut-section2">
                <h1 class="快捷键">全局快捷键</h1><br>
                <table class="queue-table">
                    <tbody >
                    <tr>
                        <td class="table-cell-num">Alt + F10&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                        <td class="table-cell-num">打开播放器</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Alt + F9</td>
                        <td class="table-cell-num">暂停 / 播放</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Alt + F11</td>
                        <td class="table-cell-num">上一曲</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Alt + F12</td>
                        <td class="table-cell-num">下一曲</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Alt + F7</td>
                        <td class="table-cell-num">音量 + 3</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Alt + F6</td>
                        <td class="table-cell-num">音量 - 3</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Alt + F5</td>
                        <td class="table-cell-num">切换循环模式</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Alt + F8</td>
                        <td class="table-cell-num">静音</td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">Alt + E</td>
                        <td class="table-cell-num">退出播放器</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .快捷键{
        margin-left: 2px;
    }
    .align{
        margin-left: 10px;
    }
    .custom-switch {
        margin-left: 10px;
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
    }

    .custom-switch input {
        display: none;
    }

    .custom-switch label {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.2);;
        border-radius: 34px;
        cursor: pointer;
    }

    .custom-switch label:after {
        content: "";
        position: absolute;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background-color: white;
        top: 4px;
        left: 4px;
        transition: 0.2s;
    }

    .custom-switch input:checked + label {
        background-color: rgba(255, 255, 255, 0.6)
    }

    .custom-switch input:checked + label:after {
        transform: translateX(26px);
    }

    .shortcut-section2{
        margin-left: 20px;
    }
    .shortcuts-container{
        display: flex;
    }
    .title{
        left: 50%;
        text-align: center;
    }
    .showReboot {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 8px 16px;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 20px;
        font-size: 16px;
        z-index: 1000;
    }
    .queue-table {
        left: 50%;
        width: 100%;
        margin-bottom: 5px;
        marigin-top: 5px;
        border-collapse: collapse;
    }
    .table-cell-num {
        padding: 6px;
        border: 1px solid rgba(255, 255, 255, 0);;
    }

    .settings::-webkit-scrollbar {
        width: 20px;
        background-color: rgba(0, 0, 0, 0); /* 设置为半透明的背景颜色 */
        border-radius: 10px;
    }
    .settings::-webkit-scrollbar-thumb {
        background-color: white; /* 设置滑块的颜色 */
        border-radius: 20px; /* 设置滑块的圆角 */
    }
    .settings::-webkit-scrollbar-track {
        background-color: rgba(255, 255, 255, 0); /* 设置轨道的颜色 */
    }
    .settings{
        height: calc(97.5vh - 220px); /* 100px 是顶部导航栏和底部控制栏的总高度 */
        overflow: auto;
    }
    .button-container {
        display: flex;
        align-items: center;
        margin-top: 20px;
        gap: 50px;
    }

    .custom-button {
        position: relative;
        width: 100px;
        height: 40px;
        background: transparent;
        border: 3px solid #f0f0f0;
        border-radius: 50px;
        text-align: center;
        line-height: 40px;
        cursor: pointer;
        color: #f0f0f0;
        transition: 0.3s;
    }

    .custom-button:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
    .centered-content {
        position: absolute;
        top: 65%;
        left: 50%;
        transform: translate(-50%, -50%); /* 将元素水平和垂直居中 */
        /* 其他样式 */
    }
    .centered-img {
        max-width: 80%; /* 图片最大宽度为父元素的宽度 */
        max-height: 80%; /* 图片最大高度为父元素的高度 */
        /* 其他样式 */
    }
    .custom-button-font {
        width: 100px;
        height: 40px;
        background: transparent;
        border: 3px solid #f0f0f0;
        border-radius: 50px;
        text-align: center;
        line-height: 40px;
        cursor: pointer;
        color: #f0f0f0;
    }
    .activee{
        background-color: rgba(255, 255, 255, 0.5);
    }
</style>

<script>
    import {mapState,mapMutations} from "vuex";
    export default {
        name: "Settings",
        created() {
            myAPI.onFinishScan((_event) => {
                this.finishScan()
            })
            myAPI.onCancelScan((_event) => {
                this.info = "扫描已取消"
                setTimeout(()=>{
                    this.showReboot = false
                },2000)

            })
        },
        data(){
            return{
                folderPath : 0,
                showReboot : false,
                info : "",
            }
        },
        computed:{
            hasTranslation(){
              return this.$store.getters.nowSong.hasTranslation
            },
            ...mapState(['showTlyric','lyricDirectory','onlineLrc','deleteLocalFile','globalShortcut','exit','toHomeAfterChangeQueue', 'autoHideLrc','highlight','showFormat','queueModal','lyricsModal','infoModal']),
            lyricAlignmentMode(){
                return this.$store.state.lyricAlignmentMode
            }
        },
        methods : {
            downFontSize(){
                if (this.$store.state.lyricFont > 15) {
                    this.$store.state.lyricFont--
                }
            },
            upFontSize(){
                if (this.$store.state.lyricFont < 30) {
                    this.$store.state.lyricFont++
                }
            },
            downFontSize2(){
                if (this.$store.state.biggerLyric > 0) {
                    this.$store.state.biggerLyric--
                }
            },
            upFontSize2(){
                if (this.$store.state.biggerLyric < 15) {
                    this.$store.state.biggerLyric++
                }
            },
            ...mapMutations(['CHANGE_LYRIC_ALIGNMENT_MODE']),
            setToHomeAfterChangeQueue(){
                this.$store.state.toHomeAfterChangeQueue = !this.$store.state.toHomeAfterChangeQueue
            },
            setAutoHideLrc(){
                this.$store.state.autoHideLrc = !this.$store.state.autoHideLrc
            },
            setExit(){
                this.$store.state.exit = !this.$store.state.exit
            },
            setShowTlyric(){
                this.$store.state.showTlyric = !this.$store.state.showTlyric
                console.log(this.$store.state.showTlyric)
            },
            setGlobalShortcut(){
                this.$store.state.globalShortcut = !this.$store.state.globalShortcut
            },
            setDeleteLocalFile(){
                this.$store.state.deleteLocalFile = !this.$store.state.deleteLocalFile
            },
            setShowFormat(){
                this.$store.state.showFormat = !this.$store.state.showFormat
            },
            setInfoModal(){
                this.$store.state.infoModal = !this.$store.state.infoModal
            },
            setLyricsModal(){
                this.$store.state.lyricsModal = !this.$store.state.lyricsModal
            },
            setQueueModal(){
                this.$store.state.queueModal = !this.$store.state.queueModal
            },
            setHighlight(){
                this.$store.state.highlight = !this.$store.state.highlight
            },
            changeLyricAlignmentMode(no){
                this.CHANGE_LYRIC_ALIGNMENT_MODE(no)
            },
            setAllowWrap(){
                this.$store.state.allowWrap = !this.$store.state.allowWrap
            },
            setOnlineLrc(){
                this.$store.state.onlineLrc = !this.$store.state.onlineLrc
            },
            addFolders(){
                this.info = "等待扫描中"
                this.showReboot = true
                setTimeout(()=>{
                    myAPI.addFolders()
                },500)
            },
            addFiles(){
                this.info = "等待扫描中"
                this.showReboot = true
                setTimeout(()=>{
                    myAPI.addFiles();
                },500)
            },
            changeLyricDirectory(flag){
                if (flag) {
                    myAPI.changeLyricDirectory().then(directory => {
                        console.log(directory)
                        if (directory !== null) {
                            this.$store.state.lyricDirectory = directory
                        }
                    });
                }else{
                    this.$store.state.lyricDirectory = "未设置"
                }

            },
            finishScan(){
                this.info = "扫描结束，音乐库已更新，即将跳转至音乐库"
                myAPI.getAllSongs().then(songs => {
                    this.$store.commit('SET_SONGS', songs);
                });
                setTimeout(()=>{
                    this.showReboot = false
                    if (this.$route.path !== "/Library") {
                        this.$router.push({
                            name: "Library",
                        });
                    }
                },2000)

            }
        }
    }
</script>

<!--
vuex里面加属性
setting里面设置按钮修改属性
 App里面保存的时候添加
vue的main.js启动时读取（要加mutation：SET...）
electron的main.js存入时添加
-->
