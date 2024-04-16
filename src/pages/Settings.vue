<template>
    <div class="unselectable settings">
        <!--        显示60种渐变颜色-->
        <div v-if="showSelectColor" class="modal" @click="changeShowSelectColor(1)">
            <div class="colorSelect-panel" @click.stop>
                <div class="sixtyColors">
                    <div v-for="(color, index) in colors"
                         :key="index" class="color-circle"
                         @click="changeColor(color)"
                         :style="{
                            'background-image': `linear-gradient(135deg, ${color[0]} 10%, ${color[1]} 100%)`,
                            'box-shadow': index === dLyricColorIndex ? '0 0 0 5px rgba(255, 255, 255, 1)' : 'none'
                         }">
                    </div>
                </div>
            </div>
        </div>
        <!--        显示调色板-->
        <div v-if="showSelectColorPure" class="modal" @click="changeShowSelectColor(2)">
            <div class="colorSelect-panel-pure" @click.stop>
                <div class="sixtyColors">
                <Chrome v-model="dLyricColorPure"></Chrome>
                </div>
            </div>
        </div>
<!--        显示更新信息-->
        <div v-if="showLatestInfoModal" class="modal">
            <div class="playlist-panel">
                <!-- 关闭按钮 -->
                <div class="modal-close" @click="closeShowLatestInfoModal()">
                    <div class="close-button">
                        <div class="close-image-2"></div>
                    </div>
                </div>
                <div class="new-playlist-name" style="font-weight: bold">
                    {{ this.$store.state.latestVersionInfo }}
                </div>
            </div>
        </div>
<!--        显示文件扫描情况-->
        <div v-show="showReboot" class="showReboot">
            {{info}}
        </div>
        <h1 class="title">设置 & 说明</h1><br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">
        <br>
<!--        导入歌曲-->
        <div class="button-container">
            <div class="custom-button" @click="addFolders"><b>添加文件夹</b></div>
            <div class="custom-button" @click="addFiles"><b>添加文件</b></div>
        </div>
        <br>
        <br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">
        <div class="version">
            <h3>{{this.displayVersions}}</h3>
            <div v-if="latest" class="custom-button" @click="closeShowLatestInfoModal()"><b>更新信息</b></div>
        </div>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">
        <table>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">启动时自动检查更新：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setCheck">
                        <input type="checkbox" v-model="check" />
                        <label ></label>
                    </div>
                </td>
            </tr>
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
                    <b style="font-size: 20px">主页封面信息暗色背景：</b>
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
                    <b style="font-size: 20px">主页歌词区域暗色背景：</b>
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
                    <b style="font-size: 20px">主页播放队列暗色背景：</b>
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
                    <b style="font-size: 20px">其余歌词背景模糊：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setOtherBlur">
                        <input type="checkbox" v-model="otherBlur" />
                        <label ></label>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;">
                <td>
                    <b style="font-size: 20px">歌词字体加粗：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setBoldLrc">
                        <input type="checkbox" v-model="boldLrc" />
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
                    <b style="font-size: 20px">桌面歌词使用渐变模板：</b>
                </td>
                <td>
                    <div class="custom-switch" @click="setUsePureColor">
                        <input type="checkbox" v-model="notUsePureColor" />
                        <label ></label>
                    </div>
                </td>
            </tr>
            <tr style="height: 60px;">
                <td style="display:flex;align-items:center;margin-top: 10px">
                    <b style="font-size: 20px">桌面歌词颜色：</b>
                    <div v-show="!usePureColor" class="color-circle1" :style="{ 'background-image': `linear-gradient(135deg, ${dLyricColor[0]} 10%, ${dLyricColor[1]} 100%)` }"></div>
                    <div v-show="usePureColor" class="color-circle1" :style="{ 'background-color': `${dLyricColorPure}` }"></div>
                </td>
                <td>
                    <div class="color-container" @click="changeShowSelectColor(usePureColor?2:1)" title="更改颜色">
                        <div class="color-image"></div>
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
                    <b style="font-size: 20px">导航栏板块：</b>
                </td>
                <td>
                    <div class="custom-button align" :class="{'activee':(this.$store.state.showAlbums === true)}" @click="changeShowHeader(0)"><b>{{"专辑"}}</b></div>
                </td>
                <td>
                    <div class="custom-button align" :class="{'activee':(this.$store.state.showArtists === true)}" @click="changeShowHeader(1)"><b>{{"艺术家"}}</b></div>
                </td>
                <td>
                    <div class="custom-button align" :class="{'activee':(this.$store.state.showFolders === true)}" @click="changeShowHeader(2)"><b>{{"文件夹"}}</b></div>
                </td>
            </tr>
            <tr style="height: 60px;" >
                <td>
                    <b style="font-size: 20px">所有歌词字体大小：</b>
                </td>
                <td colspan="2">
                    <div style="padding-left: 15px;padding-right: 10px;padding-top: 5px">
                        <vue-slider
                                v-model="fontSize"
                                :min="0"
                                :max="15"
                                :interval="1"
                                :dot-size="12"
                                :height="10"
                                :duration="0.2"
                        ></vue-slider>
                    </div>
                </td>
                <td>
                    <div class="custom-button-font align"><b style="font-size: 25px">{{ this.$store.state.lyricFont-15 }}</b></div>
                </td>
            </tr>
            <tr style="height: 60px;" >
                <td>
                    <b style="font-size: 20px">当前歌词字体放大：</b>
                </td>
                <td colspan="2">
                    <div style="padding-left: 15px;padding-right: 10px;padding-top: 5px">
                        <vue-slider
                            v-model="$store.state.biggerLyric"
                            :min="0"
                            :max="15"
                            :interval="1"
                            :dot-size="12"
                            :height="10"
                            :duration="0.2"
                        ></vue-slider>
                    </div>
                </td>
                <td>
                    <div class="custom-button-font align"><b style="font-size: 25px">{{ this.$store.state.biggerLyric }}</b></div>
                </td>
            </tr>
            <tr style="height: 60px;" >
                <td>
                    <b style="font-size: 20px">背景高斯模糊度：</b>
                </td>
                <td colspan="2">
                    <div style="padding-left: 15px;padding-right: 10px;padding-top: 5px">
                        <vue-slider
                                v-model="$store.state.blur"
                                :min="0"
                                :max="100"
                                :interval="1"
                                :dot-size="12"
                                :height="10"
                                :duration="0.2"
                        ></vue-slider>
                    </div>
                </td>
                <td>
                    <div class="custom-button-font align"><b style="font-size: 25px">{{ this.$store.state.blur }}</b></div>
                </td>
            </tr>
            <tr style="height: 60px;" >
                <td>
                    <b style="font-size: 20px">背景亮度：</b>
                </td>
                <td colspan="2">
                    <div style="padding-left: 15px;padding-right: 10px;padding-top: 5px">
                        <vue-slider
                                v-model="$store.state.bright"
                                :min="0"
                                :max="150"
                                :interval="1"
                                :dot-size="12"
                                :height="10"
                                :duration="0.2"
                        ></vue-slider>
                    </div>
                </td>
                <td>
                    <div class="custom-button-font align"><b style="font-size: 25px">{{ this.$store.state.bright }}</b></div>
                </td>
            </tr>


        </table>

        <br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">
        <h1 class="title">属性说明</h1><br>
        <span><b>• 本播放器仅为实践小项目，如若出现问题（页面爆红、白屏、无法播放）请联系我，QQ：3059557534。</b></span><br><br>
        <span><b>• 技术栈为 Vue2 + Electron。</b></span><br><br>
        <span><b>• 仅支持 FLAC、MP3、WAV 格式的音频文件。</b></span><br><br>
        <span><b>• 若歌曲出现“未知标题[ERROR]”等字样，是歌曲标签有问题，请编辑好标题。视频简介里有可以批量匹配标签的软件。</b></span><br><br>
        <span><b>• WAV 格式所有播放器默认都是缺少很多信息的，可以去操作说明第 4 点的文件夹里的“songsNoSameId.json”文件手动编辑信息。</b></span><br><br>
        <span><b>• 目前由于性能问题，时间过长的歌曲（超过 1 小时）大概率会卡死，歌曲时长计算也会出错，请谅解。</b></span><br><br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">

        <h1 class="title">操作说明</h1><br>
        <span><b>• 支持外部拖拽单个或多个文件、文件夹添加音乐库，但不要同时拖拽文件和文件夹。</b></span><br><br>
        <span><b>• 音乐库根据id（歌曲文件标签的标题+歌手）进行添加，因此无法添加这两个标签重复的歌曲。</b></span><br><br>
        <span><b>• 最大化按钮左键是最大化，右键是全屏。</b></span><br><br>
        <span><b>• 左键点击主页封面进入半沉浸模式，右键点击进入全沉浸模式。</b></span><br><br>
        <span><b>• 如果要手动更改歌曲信息、播放列表信息等，请在 C:\Users\（本机用户）\AppData\Roaming\Sonorbit 文件夹下修改文件内容，但不要修改文件名。</b></span><br><br>
        <span><b>• 从音乐库删除会一并删除播放列表中对应歌曲。</b></span><br><br>
        <span><b>• 调节音量可以用音量条，还可在音量按钮处滚动鼠标，或者使用↑↓快捷键以及全局快捷键，每次滚动调节音量数为3。</b></span><br><br>
        <span><b>• 点击底部控制栏最左边的圆形封面也可显示主页。</b></span><br><br>
        <span><b>• 主页右边的播放队列不会随播放列表更新而更新，如果修改了播放列表数据请重新在底部控制栏切换播放列表。</b></span><br><br>
        <span><b>• 播放列表右键可进行重命名、设置封面或者删除。</b></span><br><br>
        <span><b>• 选择模式下，除手动排序，其他排序功能必须是未选中歌曲才可以使用。</b></span><br><br>
        <span><b>• 选择模式下，播放列表选中一首歌曲可进行手动排序，输入要设置的新序号即可。音乐库不支持手动排序</b></span><br><br>
        <span><b>• 搜索界面的歌曲搜索结果，双击播放，右键打开菜单。</b></span><br><br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">

        <h1 class="title">歌词说明</h1><br>
        <span><b>• 建议先设置歌词文件夹！</b></span><br><br>
        <span><b>• 歌词匹配优先级别：内嵌歌词 > 自定义的歌词文件夹 > 歌曲所在文件夹 > 在线搜索歌词。</b></span><br><br>
        <span><b>• 在线搜索歌词使用歌曲标签“标题+艺术家”的格式搜索，如果匹配不满意，可以在音乐库、播放列表和文件夹板块进行精确匹配。</b></span><br><br>
        <span><b>• 精确匹配需要输入歌曲ID，获取方法就是找到网易云对应的歌曲，复制链接，找到“song?”后面的id，输入对应的数字即可。</b></span><br><br>
        <span><b>• 原则上，精确匹配是（ID正确）是一定能找到歌词的，除非网易云真的没有那首歌或者歌词。</b></span><br><br>
        <span><b>• 在线搜索到歌词之后，会将lrc文件保存到自定义的文件夹，如果未设置会保存到歌曲同文件夹下。</b></span><br><br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">
        <br>
        <h1 class="title">快捷键说明</h1><br>
        <span><b>• 右键重置快捷键；左键三秒内，按下单个 / 组合按键进行修改。</b></span><br><br>
        <span><b>• 三秒之内只能修改一个快捷键，修改多个会变成一样。</b></span><br><br>
        <span><b>• 组合按键只允许 Ctrl / Shift / Alt 加上一个其他按键，不允许用 fn 键。</b></span><br><br>
        <span><b>• 组合按键必须以 Ctrl / Shift / Alt 开始。</b></span><br><br>
        <span><b>• 局部快捷键的【全屏】和【最小化】为系统自带，不可修改。</b></span><br><br>
        <span><b>• 若按键冲突，只有最先设置的有效，建议先将其他按键重置。</b></span><br><br>
        <div class="custom-button-shortcuts" @click="recoveryShortcuts"><b>恢复默认快捷键</b></div>

        <div class="shortcuts-container">
            <div class="shortcut-section">
                <h1 class="快捷键">局部快捷键</h1><br>
                <table class="queue-table">
                    <tbody >
                    <tr>
                        <td class="table-cell-num">缩小至托盘或退出</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lExit')" @click="updateLocal('lExit')">{{ shortcuts.local.lExit }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">暂停 / 播放</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lToggle')" @click="updateLocal('lToggle')">{{ shortcuts.local.lToggle }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">上一曲</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lLast')" @click="updateLocal('lLast')">{{ shortcuts.local.lLast }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">下一曲</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lNext')" @click="updateLocal('lNext')">{{ shortcuts.local.lNext }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">快退3s</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lBack3')" @click="updateLocal('lBack3')">{{ shortcuts.local.lBack3 }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">快进3s</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lForward3')" @click="updateLocal('lForward3')">{{ shortcuts.local.lForward3 }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">音量 + 3</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lUpVolume')" @click="updateLocal('lUpVolume')">{{ shortcuts.local.lUpVolume }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">音量 - 3</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lDownVolume')" @click="updateLocal('lDownVolume')">{{ shortcuts.local.lDownVolume }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">窗口全屏</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button2">{{ shortcuts.local.lFullScreen }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">窗口最小化</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button2">{{ shortcuts.local.lMiniSize }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">回到主页</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lToHome')" @click="updateLocal('lToHome')">{{ shortcuts.local.lToHome }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">打开设置</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lSettings')" @click="updateLocal('lSettings')">{{ shortcuts.local.lSettings }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">切换循环模式</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lLoopMode')" @click="updateLocal('lLoopMode')">{{ shortcuts.local.lLoopMode }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">静音</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lMute')" @click="updateLocal('lMute')">{{ shortcuts.local.lMute }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">搜索</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lSearch')" @click="updateLocal('lSearch')">{{ shortcuts.local.lSearch }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">显示或隐藏主页播放队列</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lQueue')" @click="updateLocal('lQueue')">{{ shortcuts.local.lQueue }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">显示或隐藏主页歌词</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lLyric')" @click="updateLocal('lLyric')">{{ shortcuts.local.lLyric }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">显示或隐藏主页歌曲详情</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lInfo')" @click="updateLocal('lInfo')">{{ shortcuts.local.lInfo }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">切换播放列表</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lPlaylists')" @click="updateLocal('lPlaylists')">{{ shortcuts.local.lPlaylists }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">显示或隐藏桌面歌词</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lDesktopLyric')" @click="updateLocal('lDesktopLyric')">{{ shortcuts.local.lDesktopLyric }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">进入或退出沉浸模式</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearLocal('lFocusMode')" @click="updateLocal('lFocusMode')">{{ shortcuts.local.lFocusMode }}</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div class="shortcut-section2">
                <h1 class="快捷键">全局快捷键</h1><br>
                <table class="queue-table">
                    <tbody >
                    <tr>
                        <td class="table-cell-num">打开播放器</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearGlobal('gOpen')" @click="updateGlobal('gOpen')">{{ shortcuts.global.gOpen }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">暂停 / 播放</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearGlobal('gToggle')" @click="updateGlobal('gToggle')">{{shortcuts.global.gToggle}}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">上一曲</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearGlobal('gLast')" @click="updateGlobal('gLast')">{{shortcuts.global.gLast}}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">下一曲</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearGlobal('gNext')" @click="updateGlobal('gNext')">{{shortcuts.global.gNext}}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">音量 + 3</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearGlobal('gUpVolume')" @click="updateGlobal('gUpVolume')">{{ shortcuts.global.gUpVolume }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">音量 - 3</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearGlobal('gDownVolume')" @click="updateGlobal('gDownVolume')">{{ shortcuts.global.gDownVolume }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">切换循环模式</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearGlobal('gLoopMode')" @click="updateGlobal('gLoopMode')">{{ shortcuts.global.gLoopMode }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">静音</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearGlobal('gMute')" @click="updateGlobal('gMute')">{{shortcuts.global.gMute}}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">桌面歌词</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearGlobal('gDesktopLyric')" @click="updateGlobal('gDesktopLyric')">{{shortcuts.global.gDesktopLyric}}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="table-cell-num">退出播放器</td>
                        <td class="table-cell-num">
                            <span class="shortcut-button" @contextmenu="clearGlobal('gExit')" @click="updateGlobal('gExit')">{{shortcuts.global.gExit}}</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .color-circle1 {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-left: 10px;
    }

    .sixtyColors {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    .color-circle {
        transition: 0.4s;
        width: 40px;
        height: 40px;
        margin: 5px;
        border-radius: 50%;
    }
    .color-circle:hover{
        cursor: pointer;
    }

    .colorSelect-panel {
        background-color: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        border-radius: 10px;
        padding: 10px;
        width: 500px;
        position: relative;
    }
    .colorSelect-panel-pure{
        background-color: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        border-radius: 10px;
        padding: 10px;
        width: 220px;
        position: relative;
    }

    .color-container{
        margin-left: 15px;
        border-radius: 100px;
        width: 40px;
        height: 40px;
        padding: 8px;
        background-color: rgba(0, 0, 0, 0.2);
        transition: 0.3s;
    }
    .color-container:hover{
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.2);
    }
    .color-image{
        background-image: url("../assets/color.png");
        width: 100%;
        height: 100%;
        background-size: contain;
        background-repeat: no-repeat;
        transition: 0.3s;
    }

    .new-playlist-name {
        margin-top: 60px;
        white-space: pre-line;
        user-select: text;
    }
    .close-image-2 {
        width: 100%;
        height: 100%;
        background-image: url('../assets/close.png');
        background-size: contain; /* 保持原始比例 */
        background-repeat: no-repeat;
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
    .modal-close {
        position: absolute;
        top: 10px;
        right: 10px;
        color: white;
        cursor: pointer;
        border-color: white;

    }
    .playlist-panel {
        background-color: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        border-radius: 10px;
        padding: 10px;
        width: 80%;
        max-width: 450px;
        position: relative;
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
        transition: 0.3s;
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
        transition: 0.3s;
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
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
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
    }
    .shortcut-button {
        border: 3px solid #f0f0f0;
        padding: 5px;
        border-radius: 100px;
        display: inline-block;
        width: 90px;
        text-align: center;
        cursor: pointer;
        transition: 0.3s;
    }
    .shortcut-button:hover{
        background-color: rgba(255,255,255,0.3);
    }
    .shortcut-button2 {
        border: 3px solid #f0f0f0;
        padding: 5px;
        border-radius: 100px;
        display: inline-block;
        width: 90px;
        text-align: center;
        cursor: not-allowed;
        transition: 0.3s;
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
    .version {
        display: flex;
        align-items: center;
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
    .custom-button-shortcuts {
        position: relative;
        width: 130px;
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
    .custom-button-shortcuts:hover {
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
        color: #f0f0f0;
    }
    .activee{
        background-color: rgba(255, 255, 255, 0.5);
    }
</style>

<script>
    import {mapState,mapMutations} from "vuex";
    import VueSlider from 'vue-slider-component';
    import 'vue-slider-component/theme/default.css'
    import { Chrome } from 'vue-color'


    export default {
        name: "Settings",
        components : {VueSlider, Chrome},
        created() {
            myAPI.onErrorFile((_event) => {
                this.info = "扫描失败，请检查文件"
                setTimeout(()=>{
                    this.showReboot = false
                },2000)
            })
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
                showLatestInfoModal: false,
                showSelectColor: false,
                showSelectColorPure: false,
                colors:[ ["#FDEB71", "#F8D800"], ["#ABDCFF", "#0396FF"], ["#FEB692", "#EA5455"], ["#CE9FFC", "#7367F0"], ["#90F7EC", "#32CCBC"], ["#FFF6B7", "#F6416C"], ["#81FBB8", "#28C76F"], ["#E2B0FF", "#9F44D3"], ["#F97794", "#623AA2"], ["#FCCF31", "#F55555"], ["#F761A1", "#8C1BAB"], ["#43CBFF", "#9708CC"], ["#5EFCE8", "#736EFE"], ["#FAD7A1", "#E96D71"], ["#FFD26F", "#3677FF"], ["#A0FE65", "#FA016D"], ["#FFDB01", "#0E197D"], ["#FEC163", "#DE4313"], ["#92FFC0", "#002661"], ["#EEAD92", "#6018DC"], ["#F6CEEC", "#D939CD"], ["#52E5E7", "#130CB7"], ["#F1CA74", "#A64DB6"], ["#E8D07A", "#5312D6"], ["#EECE13", "#B210FF"], ["#79F1A4", "#0E5CAD"], ["#FDD819", "#E80505"], ["#FFF3B0", "#CA26FF"], ["#FFF5C3", "#9452A5"], ["#F05F57", "#360940"], ["#2AFADF", "#4C83FF"], ["#FFF886", "#F072B6"], ["#97ABFF", "#123597"], ["#F5CBFF", "#C346C2"], ["#FFF720", "#3CD500"], ["#FF6FD8", "#3813C2"], ["#EE9AE5", "#5961F9"], ["#FFD3A5", "#FD6585"], ["#C2FFD8", "#465EFB"], ["#FD6585", "#0D25B9"], ["#FD6E6A", "#FFC600"], ["#65FDF0", "#1D6FA3"], ["#6B73FF", "#000DFF"], ["#FF7AF5", "#513162"], ["#F0FF00", "#58CFFB"], ["#FFE985", "#FA742B"], ["#FFA6B7", "#1E2AD2"], ["#FFAA85", "#B3315F"], ["#72EDF2", "#5151E5"], ["#FF9D6C", "#BB4E75"], ["#F6D242", "#FF52E5"], ["#69FF97", "#00E4FF"], ["#3B2667", "#BC78EC"], ["#70F570", "#49C628"], ["#3C8CE7", "#00EAFF"], ["#FAB2FF", "#1904E5"], ["#81FFEF", "#F067B4"], ["#FFA8A8", "#FCFF00"], ["#FFCF71", "#2376DD"], ["#FF96F9", "#C32BAC"] ]
            }
        },
        computed:{
            boldLrc(){
                return this.$store.state.boldLrc
            },
            dLyricColorIndex(){
                return this.colors.findIndex(color => color[0] === this.dLyricColor[0] && color[1] === this.dLyricColor[1]);
            },
            notUsePureColor(){
                return !this.$store.state.usePureColor
            },
            usePureColor(){
                return this.$store.state.usePureColor
            },
            dLyricColor(){
                    return this.$store.state.dLyricColor;
            },
            dLyricColorPure: {
                get() {
                    return this.$store.state.dLyricColorPure;
                },
                set(value) {
                    this.$store.state.dLyricColorPure = value.hex8
                }
            },
            shortcuts(){
                return this.$store.state.shortcuts
            },
            focusMode2(){
                return this.$store.state.focusMode2
            },
            fontSize:{
                get(){
                    return this.$store.state.lyricFont -15
                },
                set(val){
                    this.$store.state.lyricFont = val+15
                }
            },
            check(){
              return this.$store.state.check
            },
            errorMessage(){
                return this.$store.state.errorMessage
            },
            latest(){
                if (this.$store.state.latestVersion) {
                    return this.$store.state.latestVersion !== this.$store.state.nowVersion
                }else{
                    return false
                }
            },
            displayVersions() {
                return `当前版本：${this.$store.state.nowVersion}\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0
                最新版本：${this.$store.state.latestVersion !== null ? this.$store.state.latestVersion : `查找失败（${this.errorMessage}）`}`;
            },
            hasTranslation(){
              return this.$store.getters.nowSong.hasTranslation
            },
            ...mapState(['showTlyric','lyricDirectory','onlineLrc','deleteLocalFile','globalShortcut','exit','toHomeAfterChangeQueue', 'autoHideLrc','highlight','otherBlur','showFormat','queueModal','lyricsModal','infoModal']),
            lyricAlignmentMode(){
                return this.$store.state.lyricAlignmentMode
            }
        },
        methods : {
            changeColor(color){
                this.$store.state.dLyricColor = color
            },
            changeShowSelectColor(flag){
                if (flag === 1) {
                    this.showSelectColor = !this.showSelectColor;
                }else{
                    this.showSelectColorPure = !this.showSelectColorPure;
                }
            },
            recoveryShortcuts(){
                this.$store.state.shortcuts = {
                    "local": {
                        "lExit": "Escape",
                        "lToggle": "Space",
                        "lLast": "Ctrl+Left",
                        "lNext": "Ctrl+Right",
                        "lBack3": "Left",
                        "lForward3": "Right",
                        "lUpVolume": "Up",
                        "lDownVolume": "Down",
                        "lFullScreen": "F11",
                        "lMiniSize": "Ctrl+M",
                        "lToHome": "Ctrl+Z",
                        "lSettings": "Ctrl+S",
                        "lLoopMode": "Ctrl+O",
                        "lMute": "Ctrl+N",
                        "lSearch": "Ctrl+F",
                        "lQueue": "Ctrl+Q",
                        "lLyric": "Ctrl+L",
                        "lInfo": "Ctrl+I",
                        "lPlaylists": "Ctrl+P",
                        "lDesktopLyric": "Ctrl+D",
                        "lFocusMode": "Ctrl+Enter"
                    },
                    "global": {
                        "gOpen": "Alt+F10",
                        "gToggle": "Alt+F9",
                        "gLast": "Alt+F11",
                        "gNext": "Alt+F12",
                        "gUpVolume": "Alt+F7",
                        "gDownVolume": "Alt+F6",
                        "gLoopMode": "Alt+F5",
                        "gMute": "Alt+F8",
                        "gDesktopLyric": "Alt+F1",
                        "gExit": "Alt+E"
                    }
                }
                window.myAPI.initializeShortcuts(this.$store.state.shortcuts)
            },
            clearGlobal(flag){
                const originalSet = this.$store.state.shortcuts.global[flag]
                this.$store.state.shortcuts.global[flag] = "未设置"
                myAPI.changeShortcuts("global",flag,originalSet,"未设置")
                clearTimeout(this.setShortcutsTimeout);
            },
            clearLocal(flag){
                const originalSet = this.$store.state.shortcuts.local[flag]
                this.$store.state.shortcuts.local[flag] = "未设置"
                myAPI.changeShortcuts("local",flag,originalSet,"未设置")
                clearTimeout(this.setShortcutsTimeout);
            },
            updateLocal(flag) {
                const originalSet = this.$store.state.shortcuts.local[flag];
                this.$store.state.shortcuts.local[flag] = "等待设置...";
                let keydownListener = null

                const setShortcutsTimeout = setTimeout(() => {
                    if (this.$store.state.shortcuts.local[flag] === "等待设置...") {
                        this.$store.state.shortcuts.local[flag] = originalSet;
                    }
                    document.removeEventListener('keydown', keydownListener);
                }, 3000);

                const keysPressed = {}
                keydownListener = (event) => {
                    keysPressed[event.key] = true
                    let newShortcut = "";
                    if (keysPressed['Control']) {
                        newShortcut += 'Ctrl+';
                    }
                    if (keysPressed['Shift']) {
                        newShortcut += 'Shift+';
                    }
                    if (keysPressed['Alt']) {
                        newShortcut += 'Alt+';
                    }
                    if (event.key !== 'Control' && event.key !== 'Shift' && event.key !== 'Alt') {
                        if (event.key.startsWith("Arrow")) {
                            newShortcut += event.key.slice(5)
                        }else if(event.key === "Escape"){
                            newShortcut += "Escape"
                        }else if(event.key === "Enter"){
                            newShortcut += "Enter"
                        }else if(event.code === "Space"){
                            newShortcut += "Space"
                        }else{
                            newShortcut += event.key.toUpperCase()
                        }
                    }
                    if (newShortcut !== "" && newShortcut !== "Ctrl+" && newShortcut !== "Shift+" && newShortcut !== "Alt+") {
                        this.$store.state.shortcuts.local[flag] = newShortcut;
                        myAPI.changeShortcuts("local",flag,originalSet,newShortcut)
                    }
                };
                document.addEventListener('keydown', keydownListener);
            },
            updateGlobal(flag) {
                const originalSet = this.$store.state.shortcuts.global[flag];
                this.$store.state.shortcuts.global[flag] = "等待设置...";
                let keydownListener = null

                const setShortcutsTimeout = setTimeout(() => {
                    if (this.$store.state.shortcuts.global[flag] === "等待设置...") {
                        this.$store.state.shortcuts.global[flag] = originalSet;
                    }
                    document.removeEventListener('keydown', keydownListener);
                }, 3000);

                const keysPressed = {}
                keydownListener = (event) => {
                    keysPressed[event.key] = true
                    let newShortcut = "";
                    if (keysPressed['Control']) {
                        newShortcut += 'Ctrl+';
                    }
                    if (keysPressed['Shift']) {
                        newShortcut += 'Shift+';
                    }
                    if (keysPressed['Alt']) {
                        newShortcut += 'Alt+';
                    }
                    if (event.key !== 'Control' && event.key !== 'Shift' && event.key !== 'Alt') {
                        if (event.key.startsWith("Arrow")) {
                            newShortcut += event.key.slice(5)
                        }else if(event.key === "Escape"){
                            newShortcut += "Escape"
                        }else if(event.key === "Enter"){
                            newShortcut += "Enter"
                        }else if(event.code === "Space"){
                            newShortcut += "Space"
                        }else{
                            newShortcut += event.key.toUpperCase()
                        }
                    }
                    if (newShortcut !== "" && newShortcut !== "Ctrl+" && newShortcut !== "Shift+" && newShortcut !== "Alt+") {
                        this.$store.state.shortcuts.global[flag] = newShortcut;
                        myAPI.changeShortcuts("global",flag,originalSet,newShortcut)
                    }
                };
                document.addEventListener('keydown', keydownListener);
            },
            changeShowHeader(flag){
                if (flag === 0) {
                    this.$store.state.showAlbums = !this.$store.state.showAlbums
                }else if(flag === 1){
                    this.$store.state.showArtists = !this.$store.state.showArtists
                }else{
                    this.$store.state.showFolders = !this.$store.state.showFolders
                }
            },
            closeShowLatestInfoModal(){
                this.showLatestInfoModal = !this.showLatestInfoModal
            },
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
            setFocusMode(){
                this.$store.state.focusMode2 = !this.$store.state.focusMode2
            },
            setAutoHideLrc(){
                this.$store.state.autoHideLrc = !this.$store.state.autoHideLrc
            },
            setExit(){
                this.$store.state.exit = !this.$store.state.exit
            },
            setCheck(){
                this.$store.state.check = !this.$store.state.check
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
            setOtherBlur(){
                this.$store.state.otherBlur = !this.$store.state.otherBlur
            },
            setBoldLrc(){
                this.$store.state.boldLrc = !this.$store.state.boldLrc
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
            setUsePureColor(){
                this.$store.state.usePureColor = !this.$store.state.usePureColor
                this.$forceUpdate()
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
                },350)

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
