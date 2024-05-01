<template>
    <div class="container unselectable">
        <div class="image-and-buttons">
            <div class="image-container">
                <!-- 封面图片 -->
                <div v-if="nowSong" class="image-wrapper">
                    <img
                            v-if="this.$store.state.nowSongCover"
                            :src="this.$store.state.nowSongCover"
                            alt="Image"
                            ref="songImage"
                            class="image"
                            :style="{ animationPlayState: this.isPlaying ? 'running' : 'paused' }"
                            @click="toHome"
                            title="返回主页"
                    />
                </div>
            </div>
            <div class="center-buttons">
                <!-- 信息按钮 -->
                <div class="control-button" @click="showMoreInfo(0,null)" title="歌曲信息">
                    <div class="info-image" ></div>
                </div>
                <!-- 播放模式按钮 -->
                <div class="control-button" @click="changePlayMode">
                    <div class="rotate-image" v-show="playMode === 0" title="队列循环"></div>
                    <div class="random-image" v-show="playMode === 1" title="无序循环"></div>
                    <div class="onesong-image" v-show="playMode === 2" title="单曲循环"></div>
                </div>
                <!-- 上一曲按钮 -->
                <div class="control-button" @click="playLast(); triggerEvent1()" title="上一首">
                    <div class="prev-image"></div>
                </div>
                <!-- 暂停播放按钮 -->
                <div class="control-button large" @click="togglePlay" title="暂停/播放">
                    <div
                            v-show="!this.$store.state.isPlaying"
                            class="pause-play-image"
                    ></div>
                    <div
                            v-show="this.$store.state.isPlaying"
                            class="pause-play-image2"
                    ></div>
                </div>
                <!-- 下一曲按钮 -->
                <div class="control-button" @click="playNext(); triggerEvent1()" title="下一首">
                    <div class="next-image"></div>
                </div>
            </div>

            <HowlerPlayer></HowlerPlayer>

        </div>
        <!-- 进度条 -->

        <div class="progress-bar-container">
            <vue-slider
                    v-model="currentProgress"
                    :min="0"
                    :max="100"
                    :interval="0.1"
                    :dot-size="20"
                    :height="15"
                    style="width: 100%;margin-top: 25px"
                    class="slider"
                    :lazy="true"
                    :duration="0"
                    :contained="true"
                    :drag-on-click="true"
                    :useKeyboard="false"
                    :tooltip="'none'"
            >

            </vue-slider>
            <div class="time-labels">
                <span  class="played-time-footer">{{ playedTime?playedTime:"00:00" }}</span>
                <span class="total-time-footer">{{ nowSongDuration?nowSongDuration:"00:00" }}</span>
            </div>
        </div>


        <!--        ------------------------------------------------------------------------------------------->
        <div class="right-controls">
            <!-- 歌词按钮 -->
            <div class="control-button lyric-button" @click="changeShowLyric" :class="{ 'active': showLyric }" title="歌词">
                <div class="lyrics-image"></div>
            </div>
            <!-- 队列按钮 -->
            <div class="control-button queue-button" @click="changeShowQueue()" :class="{ 'active': showQueue }" title="播放队列">
                <div class="queue-image"></div>
            </div>
            <!-- 更多操作按钮 -->
            <div class="control-button" title="更多"
                 @mouseleave="handleMouseLeave(true)"
                 @click="handleMouseEnter(true)">
                <div class="more-image"></div>
            </div>

            <!-- 音量按钮 和 音量条 -->
                <div class="control-button" title="滚轮调节" @click="changeMute" @wheel="adjustVolumeWithWheel">
                    <div v-show="!this.$store.state.isMute && this.volume !== 0" class="volume-image"></div>
                    <div v-show="this.$store.state.isMute || this.volume === 0" class="noVolume-image"></div>
                </div>
                <vue-slider
                        v-model="$store.state.volume"
                        :min="0"
                        :max="100"
                        :interval="1"
                        :dot-size="12"
                        :height="10"
                        :duration="0.2"
                        style="width:100px;margin-left: 5px;margin-right: 5px"
                ></vue-slider>
            <!--音量数值显示-->
            <div v-show="showVolumeValue" class="volume-value">
                {{ `音量 :  ${volume}` }}
            </div>
        </div>

        <!--更多操作的菜单-->
        <div class="menu" :class="{ show: showMenu }"
             @mouseenter="handleMouseEnter(false)"
             @mouseleave="handleMouseLeave(false)"
             v-show="showMenu"
             ref="menu">
            <div style="display: flex; gap: 5px;">
                <!--均衡器-->
                <div class="circle-container" title="可视化频谱（较耗性能）"
                     @click="changeShowSpectrum();handleMouseLeave(false)" :class="{ 'dlrcActive': showSpectrum }"
                >
                    <div class="spectrum-image"></div>
                </div>
                <!--桌面歌词-->
                <div class="circle-container" title="桌面歌词"
                     @click="changeDeskTopLyric();handleMouseLeave(false)" :class="{ 'dlrcActive': deskTopLyric }"
                >
                    <div class="dLyric-image"></div>
                </div>
                <!--播放列表-->
                <div class="circle-container" title="播放列表"
                     @click="showPlaylistModal = true;handleMouseLeave(false)"
                >
                    <div class="pl-image"></div>
                </div>
                <!--均衡器-->
                <div class="circle-container" title="均衡器"
                     @click="showEQ = true;handleMouseLeave(false)"
                >
                    <div class="eq-image"></div>
                </div>
            </div>
        </div>


        <!-- 展示均衡器 -->
        <div v-if="showEQ" class="modal">
            <div class="playlist-panel" style="max-width: 600px;">
                <!-- 关闭按钮 -->
                <div class="modal-close" @click="showEQ= false">
                    <div class="close-button close-image"></div>
                </div>
                <!--预设和调节器-->
                <div style="display: flex;gap:30px; margin-top: 40px">
                    <!--预设-->
                    <table>
                        <tr class="TR">
                            <td class="TD">
                                <div class="EQOption" @click="changeUseEQ()" :class="{ 'EQActive': $store.state.useEQ }">
                                    {{$store.state.useEQ?"开启":"关闭"}}
                                </div>
                            </td>
                            <td class="TD">
                                <div class="EQOption" :class="{ 'EQActive': $store.state.EQParam===[0,0,0,0,0,0,0,0,0,0] }" @click="changeEQ(-1)">
                                默认
                            </div></td>
                        </tr>
                        <tr class="TR">
                            <td class="TD">
                                <div class="EQOption" :class="{ 'EQActive': JSON.stringify(this.$store.state.EQParam) === JSON.stringify(this.tenEQ[0])}" @click="changeEQ(0)">
                                流行
                            </div></td>
                            <td class="TD">
                                <div class="EQOption" :class="{ 'EQActive': JSON.stringify(this.$store.state.EQParam) === JSON.stringify(this.tenEQ[1])}" @click="changeEQ(1)">
                                舞曲
                            </div></td>
                        </tr>
                        <tr class="TR">
                            <td class="TD">
                                <div class="EQOption" :class="{ 'EQActive': JSON.stringify(this.$store.state.EQParam) === JSON.stringify(this.tenEQ[2])}" @click="changeEQ(2)">
                                蓝调
                            </div></td>
                            <td class="TD">
                                <div class="EQOption" :class="{ 'EQActive': JSON.stringify(this.$store.state.EQParam) === JSON.stringify(this.tenEQ[3])}" @click="changeEQ(3)">
                                古典
                            </div></td>
                        </tr>
                        <tr class="TR">
                            <td class="TD">
                                <div class="EQOption" :class="{ 'EQActive': JSON.stringify(this.$store.state.EQParam) === JSON.stringify(this.tenEQ[4])}" @click="changeEQ(4)">
                                爵士
                            </div></td>
                            <td class="TD">
                                <div class="EQOption" :class="{ 'EQActive': JSON.stringify(this.$store.state.EQParam) === JSON.stringify(this.tenEQ[5])}" @click="changeEQ(5)">
                                慢歌
                            </div></td>
                        </tr>
                        <tr class="TR">
                            <td class="TD">
                                <div class="EQOption" :class="{ 'EQActive': JSON.stringify(this.$store.state.EQParam) === JSON.stringify(this.tenEQ[6])}" @click="changeEQ(6)">
                                电子
                            </div></td>
                            <td class="TD">
                                <div class="EQOption" :class="{ 'EQActive': JSON.stringify(this.$store.state.EQParam) === JSON.stringify(this.tenEQ[7])}" @click="changeEQ(7)">
                                摇滚
                            </div></td>
                        </tr>
                        <tr class="TR">
                            <td class="TD">
                                <div class="EQOption" :class="{ 'EQActive': JSON.stringify(this.$store.state.EQParam) === JSON.stringify(this.tenEQ[8])}" @click="changeEQ(8)">
                                乡村
                            </div></td>
                            <td class="TD">
                                <div class="EQOption" :class="{ 'EQActive': JSON.stringify(this.$store.state.EQParam) === JSON.stringify(this.tenEQ[9])}" @click="changeEQ(9)">
                                人声
                            </div></td>
                        </tr>
                    </table>

                    <!--调节器-->
                    <div style="display: flex;gap: 20px;margin-top: 5px;">
                        <div style="display: flex; flex-direction: column; align-items: center;gap:10px;width: 20px">
                            <span>{{ EQParam[0] }}</span>
                            <vue-slider
                                    v-model="$store.state.EQParam[0]"
                                    :min="-12"
                                    :max="12"
                                    :interval="1"
                                    :dot-size="15"
                                    :height="300"
                                    direction="btt"
                                    :tooltip="'none'"
                                    :duration="0.2"
                                    style="width:10px"
                            ></vue-slider>
                            <span>31</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center;gap:10px;width: 20px">
                            <span>{{ EQParam[1] }}</span>
                            <vue-slider
                                    v-model="$store.state.EQParam[1]"
                                    :min="-12"
                                    :max="12"
                                    :interval="1"
                                    :dot-size="15"
                                    :height="300"
                                    direction="btt"
                                    :tooltip="'none'"
                                    :duration="0.2"
                                    style="width:10px"
                            ></vue-slider>
                            <span>62</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center;gap:10px;width: 20px">
                            <span>{{ EQParam[2] }}</span>
                            <vue-slider
                                    v-model="$store.state.EQParam[2]"
                                    :min="-12"
                                    :max="12"
                                    :interval="1"
                                    :dot-size="15"
                                    :height="300"
                                    direction="btt"
                                    :tooltip="'none'"
                                    :duration="0.2"
                                    style="width:10px"
                            ></vue-slider>
                            <span>125</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center;gap:10px;width: 20px">
                            <span>{{ EQParam[3] }}</span>
                            <vue-slider
                                    v-model="$store.state.EQParam[3]"
                                    :min="-12"
                                    :max="12"
                                    :interval="1"
                                    :dot-size="15"
                                    :height="300"
                                    direction="btt"
                                    :tooltip="'none'"
                                    :duration="0.2"
                                    style="width:10px"
                            ></vue-slider>
                            <span>250</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center;gap:10px;width: 20px">
                            <span>{{ EQParam[4] }}</span>
                            <vue-slider
                                    v-model="$store.state.EQParam[4]"
                                    :min="-12"
                                    :max="12"
                                    :interval="1"
                                    :dot-size="15"
                                    :height="300"
                                    direction="btt"
                                    :tooltip="'none'"
                                    :duration="0.2"
                                    style="width:10px"
                            ></vue-slider>
                            <span>500</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center;gap:10px;width: 20px">
                            <span>{{ EQParam[5] }}</span>
                            <vue-slider
                                    v-model="$store.state.EQParam[5]"
                                    :min="-12"
                                    :max="12"
                                    :interval="1"
                                    :dot-size="15"
                                    :height="300"
                                    direction="btt"
                                    :tooltip="'none'"
                                    :duration="0.2"
                                    style="width:10px"
                            ></vue-slider>
                            <span>1k</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center;gap:10px;width: 20px">
                            <span>{{ EQParam[6] }}</span>
                            <vue-slider
                                    v-model="$store.state.EQParam[6]"
                                    :min="-12"
                                    :max="12"
                                    :interval="1"
                                    :dot-size="15"
                                    :height="300"
                                    direction="btt"
                                    :tooltip="'none'"
                                    :duration="0.2"
                                    style="width:10px"
                            ></vue-slider>
                            <span>2k</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center;gap:10px;width: 20px">
                            <span>{{ EQParam[7] }}</span>
                            <vue-slider
                                    v-model="$store.state.EQParam[7]"
                                    :min="-12"
                                    :max="12"
                                    :interval="1"
                                    :dot-size="15"
                                    :height="300"
                                    direction="btt"
                                    :tooltip="'none'"
                                    :duration="0.2"
                                    style="width:10px"
                            ></vue-slider>
                            <span>4k</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center;gap:10px;width: 20px">
                            <span>{{ EQParam[8] }}</span>
                            <vue-slider
                                    v-model="$store.state.EQParam[8]"
                                    :min="-12"
                                    :max="12"
                                    :interval="1"
                                    :dot-size="15"
                                    :height="300"
                                    direction="btt"
                                    :tooltip="'none'"
                                    :duration="0.2"
                                    style="width:10px"
                            ></vue-slider>
                            <span>8k</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center;gap:10px;width: 20px">
                            <span>{{ EQParam[9] }}</span>
                            <vue-slider
                                    v-model="$store.state.EQParam[9]"
                                    :min="-12"
                                    :max="12"
                                    :interval="1"
                                    :dot-size="15"
                                    :height="300"
                                    direction="btt"
                                    :tooltip="'none'"
                                    :duration="0.2"
                                    style="width:10px"
                            ></vue-slider>
                            <span>16k</span>
                        </div>



                    </div>
                </div>
            </div>
        </div>
        <!-- 展示播放列表 -->
        <div v-if="showPlaylistModal" class="modal">
            <div class="playlist-panel" style="max-width: 400px;">
                <!-- 关闭按钮 -->
                <div class="modal-close" @click="showPlaylistModal = false">
                    <div class="close-button close-image"></div>
                </div>
                <!-- 选项列表内容 -->
                <div class="playlist-options">
                    <div v-for="playlist in playlists" :key="playlist.name" class="playlist-option"
                         @click="openPlaylist(playlist.name)">
                        {{ playlist.name }}
                    </div>
                </div>
            </div>
        </div>

        <!--       音频文件信息 -------------------------------------------------------------------------------->
        <div class="info-dialog-container" v-if="showInfoDialog">
            <div class="overlay" >
                <!--        展示信息框-->
                <div class="info-dialog">
                    <!-- 关闭按钮 -->
                    <div class="modal-close" @click="closeDialogInfo">
                        <div class="close-button close-image"></div>
                    </div>
                    <div class="info-content">
                        <!-- 歌曲封面 -->
                        <div class="cover-container">
                            <img v-if="this.songInfo.cover" :src="this.songInfo.cover" alt="歌曲封面" class="cover-image" />
                            <img v-else src="../assets/znone.png" alt="默认封面" class="cover-image" />
                            <div class="custom-button" @click="showEditMetadataModal()"><b>{{"编辑标签信息"}}</b></div>
                        </div>
                        <!-- 歌曲详细信息 -->
                        <div class="info-details">
                            <table style="white-space: nowrap">
                                <tr>
                                    <td><div class="info-label">网易云ID：</div></td>
                                    <td><div class="info-value">{{ this.netId }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">标题：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.title }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">艺术家：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.artist }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">专辑：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.album }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">时长：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.duration }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">比特率：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.bitrate }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">采样率：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.sampleRate }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">位深：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.bitsPerSample }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">格式：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.moreInfo.format==="MPEG"?"MP3":this.songInfo.moreInfo.format }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">文件大小：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.nowSong.fileSize }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">年份：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.moreInfo.year }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">音轨号：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.moreInfo.trackNumber }}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">流派：</div></td>
                                    <td><div class="info-value">{{ this.songInfo.moreInfo.genre[0] === ' ' ? "无" :  this.songInfo.moreInfo.genre[0]}}</div></td>
                                </tr>
                                <tr>
                                    <td><div class="info-label">注释：</div></td>
                                    <td><div class="info-value" :title=this.songInfo.moreInfo.comment[0]>{{ this.songInfo.moreInfo.comment[0] }}</div></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 编辑标签信息-->
        <div class="info-dialog-container" v-if="showEditMetadata">
            <div class="overlay" >
                <!--        展示信息框-->
                <div class="info-dialog2">
                    <div class="editContent">
                        <div class="editCover">
                            <div class="edit-image-container">
                                <img
                                        v-if="toEditSongInfo.cover"
                                        :src="toEditSongInfo.cover"
                                        alt="无封面"
                                        class="edit-image"
                                />
                                <img
                                        v-else
                                        src="../assets/znone.png"
                                        alt="默认封面"
                                        class="edit-image"
                                />
                            </div>
                            <div class="twoButtons">
                                <div class="custom-button" style="width: 100px" @click="chooseCover()"><b>{{"选择图片"}}</b></div>
                                <div class="custom-button" style="width: 100px" @click="delCover()"><b>{{"删除图片"}}</b></div>
                            </div>
                        </div>

                        <div class="editInfos">
                            <table style="width: 100%;border-collapse: separate;border-spacing: 0 10px;">
                                <tr>
                                    <td style="text-align: center;font-weight: bold">标 题</td>
                                    <td>
                                        <div class="editingInfo">
                                            <input class="editingInfoContent" v-model="toEditSongInfo.nowSong.title">
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center;font-weight: bold">艺 术 家</td>
                                    <td>
                                        <div class="editingInfo">
                                            <input class="editingInfoContent" v-model="toEditSongInfo.nowSong.artist">
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center;font-weight: bold">专 辑</td>
                                    <td>
                                        <div class="editingInfo">
                                            <input class="editingInfoContent" v-model="toEditSongInfo.nowSong.album">
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center;font-weight: bold">音 轨 号</td>
                                    <td>
                                        <div class="editingInfo">
                                            <input class="editingInfoContent" v-model="toEditSongInfo.moreInfo.trackNumber">
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center;font-weight: bold">年 份</td>
                                    <td>
                                        <div class="editingInfo">
                                            <input class="editingInfoContent" v-model="toEditSongInfo.moreInfo.year">
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center;font-weight: bold">流 派</td>
                                    <td>
                                        <div class="editingInfo">
                                            <input class="editingInfoContent" v-model="toEditSongInfo.moreInfo.genre">
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center;font-weight: bold">注 释</td>
                                    <td>
                                        <div class="editingInfo">
                                            <input class="editingInfoContent" v-model="toEditSongInfo.moreInfo.comment">
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <div class="editLyrics">
                            <div class="twoButtons">
                                <div class="custom-button" style="width: 100px" @click="insertLyrics()"><b>{{insert?"内嵌歌词":"删除内嵌"}}</b></div>
                                <div class="custom-button" style="width: 100px" title="保存后将内嵌歌词与本地歌词文件一并删除" @click="delLyrics()"><b>{{"删除歌词"}}</b></div>
                            </div>
                            <textarea class="lyricsArea" v-model="editingLyrics" placeholder="请输入歌词..."></textarea>
                        </div>
                    </div>
                    <div class="twoButtons">
                        <div class="custom-button" style="width: 70px" @click="saveEdit()"><b>{{"保存"}}</b></div>
                        <div class="custom-button" style="width: 70px" @click="closeEdit()"><b>{{"取消"}}</b></div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
    .TR{
        height: 55px;
        width: 100px;
    }
    .TD{
        height: 50px;
        width: 80px;
    }
    .EQOption{
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 100px;
        width: 80px;
        height: 30px;
        cursor: pointer;
        transition: 0.3s;
        border: 3px solid rgba(255,255,255,0.2);
    }
    .EQOption:hover{
        border: 3px solid rgba(255,255,255,0.6);
        background-color: rgba(255,255,255,0.2);
    }
    .EQActive{
        background-color: rgba(255,255,255,0.3);
        border: 3px solid rgba(255,255,255,0.6);
    }

    .eq-image{
        height: 60%;
        width: 60%;
        background-size: contain;
        background-repeat: no-repeat;
        background-image: url('../assets/EQ.png')
    }
    .pl-image{
        height: 60%;
        width: 60%;
        background-size: contain;
        background-repeat: no-repeat;
        background-image: url('../assets/playlist3.png')
    }
    .dLyric-image{
        height: 60%;
        width: 60%;
        background-size: contain;
        background-repeat: no-repeat;
        background-image: url('../assets/dLyric.png')
    }
    .spectrum-image{
        height: 60%;
        width: 60%;
        background-size: contain;
        background-repeat: no-repeat;
        background-image: url('../assets/spectrum.png')
    }
    .dlrcActive{
        background-color: rgba(255, 255, 255, 0.2);
    }
    .menu {
        backdrop-filter: blur(20px);
        position: fixed;
        bottom: 110px;
        right: 107px;
        transform: translateY(50px);
        opacity: 0;
        transition: transform 0.3s, opacity 0.3s;
        z-index: 999;
        background-color: rgba(0, 0, 0, 0.3);
        padding: 5px;
        border-radius: 100px;
    }

    .menu.show {
        transform: translateY(0); /* 显示时恢复到原位置 */
        opacity: 1; /* 显示时透明度为 1 */
    }
    .circle-container {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: 0.2s ease;
    }
    .circle-container:hover{
        background-color: rgba(255, 255, 255, 0.1);
    }
    .circle-container:active {
        transform: scale(0.85);
    }

    .info-dialog-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }
    .info-dialog {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60%;
        height: 55%;
        background-color: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2;
    }

    .info-dialog2 {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 35%;
        height: 80%;
        background-color: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 20px;
        z-index: 2;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .edit-image-container{
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .edit-image{
        width: 70%;
        object-fit: cover;
        cursor: pointer;
        border-radius: 10px;
    }
    .editCover{
        margin-top: 10px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
    }

    .editInfos{
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .editingInfo{
        flex: 1;
        border: 2px solid rgba(255, 255, 255, 0.5);
        border-radius: 100px;
        padding: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .editingInfoContent{
        border: none;
        outline: none;
        background-color: transparent;
        font-family: inherit;
        font-size: 15px;
        color: white;
        text-align: center;
        vertical-align: middle;
        width: 95%;
        box-sizing: border-box;
    }

    .editLyrics{
        width: 100%;
        padding: 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
    }
    .lyricsArea{
        font-size: 15px;
        border: none;
        outline: none;
        height: 500px;
        width: 100%;
        color: white;
        background-color: transparent;
    }
    .lyricsArea::placeholder {
        color: white;
    }
    .lyricsArea::-webkit-scrollbar {
        width: 0px;
    }

    .editContent{
        flex: 1;
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }
    .editContent::-webkit-scrollbar {
        width: 0px;
    }

    .twoButtons{
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: center;
        gap: 25%;
    }

    .info-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 100%;
    }

    .custom-button {
        border: 3px solid rgba(255,255,255,0.3);
        padding: 5px;
        border-radius: 100px;
        width: 110px;
        height: 30px;
        text-align: center;
        cursor: pointer;
        transition: 0.3s;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .custom-button:hover {
        border: 3px solid rgba(255,255,255,0.6);
        background-color: rgba(255,255,255,0.2);
    }

    .cover-container {
        margin-top: 15px;
        width: 50%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 30px;
    }

    .cover-image {
        max-width: 80%;
        max-height: 80%;
        object-fit: contain;
        border-radius: 10px;
    }

    .info-details {
        width: 50%;
        height: 85%;
        margin-left: 30px;
        overflow-y: auto;
        overflow-x: auto;
        display: flex;
    }
    .info-details::-webkit-scrollbar {
        width: 10px;
        height: 10px;
        background-color: rgba(0, 0, 0, 0);
        border-radius: 20px;
    }

    .info-details::-webkit-scrollbar-thumb {
        background-color: #f0f0f0;
        border-radius: 20px;
    }

    .info-details::-webkit-scrollbar-track {
        background-color: rgba(255, 255, 255, 0);
    }

    .info-label {
        margin-bottom: 5px;
        font-weight: bold;
        margin-right: 10px;
    }

    .info-value {
        flex: 1;
        margin-bottom: 5px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    /*    --------------------------------------------------------------------------------------------*/
    .progress-bar-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 100%;
    }
    .slider:hover{
        cursor: pointer;
    }
    .time-labels {
        padding-top: 6px;
        display: flex;
        justify-content: space-between;
        width: 100%;
        font-size: 13px;
        color: white;
    }

    .played-time-footer {
        padding-left: 10px;
        letter-spacing: 1px;
    }

    .total-time-footer {
        padding-right: 8px;
        letter-spacing: 1px;
    }


    .volume-value {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 0 16px;
        padding-top: 8px;
        padding-bottom: 10px;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        color: white;
        border-radius: 20px;
        font-size: 16px;
        z-index: 1000;
    }

    .right-controls {
        display: flex;
        align-items: center;
    }

    .info-image {
        width: 60%;
        height: 60%;
        background-image: url('../assets/info.png');
        background-size: contain;
        background-repeat: no-repeat;
    }


    .dLyric-image{
        width: 60%;
        height: 60%;
        background-image: url('../assets/dLyric.png');
        background-size: contain;
        background-repeat: no-repeat;
    }
    .lyrics-image {
        width: 60%;
        height: 60%;
        background-image: url('../assets/lrc.png');
        background-size: contain;
        background-repeat: no-repeat;
    }
    .lyric-button.active{
        background-color: rgba(255, 255, 255, 0.2);
    }
    .queue-button.active {
        background-color: rgba(255, 255, 255, 0.2);
    }
    .queue-image{
        width: 80%;
        height: 80%;
        background-image: url('../assets/queue.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }

    .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .image-and-buttons {
        display: flex;
    }

    @keyframes rotateAnimation {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    .image-container {
        margin-left: 5px;
        width: 55px;
        height: 55px;
        border-radius: 100px;
        overflow: hidden;
        margin-right: 5px;
        transition: 0.2s;
    }
    .image-container:hover{
        filter: brightness(70%);
    }
    .image-container:active {
        transform: scale(0.85);
    }
    .image-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        cursor: pointer;
        animation: rotateAnimation 30s linear infinite;
    }
    .image:hover {
        filter:brightness(50%);
    }

    .center-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .control-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background-color: rgba(0, 0, 0, 0.3);
        color: white;
        border-radius: 50%;
        cursor: pointer;
        margin: 0 4px;
        transition: 0.2s ease; /* 添加过渡效果 */
    }
    .control-button:hover{
        background-color: rgba(255, 255, 255, 0.1);
    }
    .control-button:active {
        transform: scale(0.85);
    }
    .large {
        width: 50px;
        height: 50px;
        font-size: 24px;
    }
    .pause-play-image {
        width: 80%;
        height: 80%;
        background-image: url('../assets/play.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .pause-play-image2 {
        width: 80%;
        height: 80%;
        background-image: url('../assets/pause.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .next-image {
        width: 60%;
        height: 60%;
        background-image: url('../assets/next.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .prev-image {
        width: 60%;
        height: 60%;
        background-image: url('../assets/prev.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .random-image {
        width: 70%;
        height: 70%;
        background-image: url('../assets/random.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .rotate-image {
        width: 100%;
        height: 100%;
        background-image: url('../assets/rotate.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .onesong-image {
        width: 80%;
        height: 80%;
        background-image: url('../assets/onesong.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .playlist-image {
        width: 80%;
        height: 80%;
        background-image: url('../assets/playlist.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .more-image {
        width: 80%;
        height: 80%;
        background-image: url('../assets/more.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }

    .close-image {
        width: 100%;
        height: 100%;
        background-image: url('../assets/close.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .volume-image {
        width: 60%;
        height: 60%;
        background-image: url('../assets/volume.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
    }
    .noVolume-image {
        width: 60%;
        height: 60%;
        background-image: url('../assets/noVolume.png');
        background-size: contain; /* 保持原始比例，并适应容器 */
        background-repeat: no-repeat;
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
        border-radius: 10px;
        padding: 10px;
        width: 80%;

        position: relative;
        backdrop-filter: blur(20px);
    }

    .playlist-options {
        margin-top: 40px;
    }
    .playlist-option{
        font-weight: bold;
        padding: 10px;
        border-radius: 10px;
    }
    .playlist-option:hover{
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
    }

    .modal-close {
        position: absolute;
        top: 10px;
        right: 10px;
        color: white;
        cursor: pointer;
        border-color: white;
        z-index: 1001;
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
</style>


<script>
    import { mix3} from "@/mixin";
    import {mapMutations, mapGetters,mapState} from "vuex"
    import HowlerPlayer from './HowlerPlayer'
    import VueSlider from 'vue-slider-component';
    import 'vue-slider-component/theme/default.css'

    export default {
        name: "Footer",
        mixins: [mix3],
        created() {
            myAPI.onChangeShowDLyric((_event) => {
                this.changeDeskTopLyric()
            })
            myAPI.onPlayLast((_event) => {
                this.playLast()
                this.$bus.$emit('songOnTop')
            })
            myAPI.onToggle((_event) => {
                this.togglePlay()
            })
            myAPI.onPlayNext((_event) => {
                this.playNext()
                this.$bus.$emit('songOnTop')
            })
            myAPI.onDownVolume((_event) => {
                if (!this.$store.state.blockSpace) {
                    if (this.$store.state.volume <= 3) {
                        this.$store.state.volume = 0
                    }else{
                        this.$store.state.volume = this.$store.state.volume -3
                    }
                    if (this.$store.state.focusMode) {
                        this.$bus.$emit('showVolumeFocus')
                    }else{
                        this.$bus.$emit('showVolume')
                    }
                }
            })
            myAPI.onUpVolume((_event) => {
                if (!this.$store.state.blockSpace) {
                    if (this.$store.state.volume >= 97) {
                        this.$store.state.volume = 100
                    }else{
                        this.$store.state.volume = this.$store.state.volume + 3
                    }
                    if (this.$store.state.focusMode) {
                        this.$bus.$emit('showVolumeFocus')
                    }else{
                        this.$bus.$emit('showVolume')
                    }
                }
            })
            myAPI.onChangeMute((_event) => {
                this.$store.state.isMute = !this.$store.state.isMute
            })
            myAPI.onLoop((_event) => {
                this.$store.state.nowMode = 0
            })
            myAPI.onRandom((_event) => {
                this.$store.state.nowMode = 1
            })
            myAPI.onOne((_event) => {
                this.$store.state.nowMode = 2
            })
            //----------------------------------------------
            myAPI.onPlayLastG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                this.playLast()
                this.$bus.$emit('songOnTop')
            })
            myAPI.onToggleG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                this.togglePlay()
            })
            myAPI.onPlayNextG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                this.playNext()
                this.$bus.$emit('songOnTop')
            })
            myAPI.onDownVolumeG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                if (this.$store.state.volume <= 3) {
                    this.$store.state.volume = 0
                }else{
                    this.$store.state.volume = this.$store.state.volume -3
                }
                if (this.$store.state.focusMode) {
                    this.$bus.$emit('showVolumeFocus')
                }else{
                    this.$bus.$emit('showVolume')
                }
            })
            myAPI.onUpVolumeG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                if (this.$store.state.volume >= 97) {
                    this.$store.state.volume = 100
                }else{
                    this.$store.state.volume = this.$store.state.volume + 3
                }
                if (this.$store.state.focusMode) {
                    this.$bus.$emit('showVolumeFocus')
                }else{
                    this.$bus.$emit('showVolume')
                }
            })
            myAPI.onChangeMuteG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                this.$store.state.isMute = !this.$store.state.isMute
            })
            myAPI.onChangeModeG((_event) => {
                if (!this.globalShortcut) {
                    return
                }
                this.$store.commit('CHANGE_MODE_AND_INDEX')
            })
        },
        components : {HowlerPlayer,VueSlider},
        data() {
            return {
                showPlaylistModal: false, // 控制弹出框显示状态
                volumeRangeValue: this.$store.state.volume,
                showVolumeValue: false,
                isNextButtonDisabled: false,
                isPrevButtonDisabled: false,
                showInfoDialog : false,
                timer: null,
                showMenu: false,
                showEQ: false,
                showEditMetadata: false,
                toEditSongInfo: null,
                insert: null,
                editingLyrics: null,
                tenEQ:[
                    [4, 2, 0, -3, -6, -6, -3, 0, 1, 3],
                    [7, 6, 3, 0, 0, -4, -6, -6, 0, 0],
                    [3, 6, 8, 3, -2, 0, 4, 7, 9, 10],
                    [0, 0, 0, 0, 0, 0, -6, -6, -6, -8],
                    [0, 0, 1, 4, 4, 4, 0, 1, 3, 3],
                    [5, 4, 2, 0, -2, 0, 3, 6, 7, 8],
                    [6, 5, 0, -5, -4, 0, 6, 8, 8, 7],
                    [7, 4, -4, 7, -2, 1, 5, 7, 9, 9],
                    [5, 6, 2, -5, 1, 1, -5, 3, 8, 5],
                    [-2, -1, -1, 0, 3, 4, 3, 0, 0, 1]
                ]
            };
        },
        mounted() {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('play', ()=>{
                    this.togglePlay()
                });
                navigator.mediaSession.setActionHandler('pause', ()=>{
                    this.togglePlay()
                });
                navigator.mediaSession.setActionHandler('previoustrack', ()=>{
                    this.playLast()
                });
                navigator.mediaSession.setActionHandler('nexttrack', ()=>{
                    this.playNext()
                });
            }
            this.$bus.$on('toggleSong',this.togglePlay)
            this.$bus.$on('playPrevSong',this.playLast)
            this.$bus.$on('playNextSong',this.playNext)
            this.$bus.$on('showVolume',this.showVolume)
            this.$bus.$on('showInfo',this.showInfo)
            this.$bus.$on('showPlaylist',this.showPlaylist)
            this.$bus.$on('showLyric',this.changeShowLyric)
            this.$bus.$on('showQueue',this.changeShowQueue)
            this.$bus.$on('showMoreInfo',this.showMoreInfo)
        },
        watch : {
            showEditMetadata:{
                handler(newVal) {
                    this.$store.state.blockSpace = newVal
                },
            },
            nowSong: {
                handler(newSong) {
                    this.$store.state.currentProgress = 0
                },
            },
            '$store.state.usePureColor': {
                immediate: true,
                handler(newValue) {
                    if (newValue) {
                        myAPI.sendColor(this.$store.state.dLyricColorPure, 2)
                    }else{
                        myAPI.sendColor(this.$store.state.dLyricColor, 1)
                    }
                },
            },
            '$store.state.boldLrc': {
                immediate: true,
                handler(newValue) {
                        myAPI.sendBold(this.$store.state.boldLrc)
                },
            },
            '$store.state.dFont': {
                immediate: true,
                handler(newValue) {
                    myAPI.sendFont(this.$store.state.dFont)
                },
            },
            '$store.state.dLyricColor': {
                handler(newValue) {
                    if (!this.$store.state.usePureColor) {
                        myAPI.sendColor(newValue, 1)
                    }
                },
            },
            '$store.state.dLyricColorPure': {
                handler(newValue) {
                    if (this.$store.state.usePureColor) {
                        myAPI.sendColor(newValue, 2)
                    }
                },
            },
            currentProgressBy100: {
                immediate: true,
                handler(newValue) {
                    myAPI.sendProgress(newValue/100)
                },
            }
        },
        computed : {
            EQParam(){
                return this.$store.state.EQParam
            },
            showSpectrum(){
                return this.$store.state.showSpectrum
            },
            currentProgressBy100(){
                return Math.floor(this.$store.state.currentProgress)
            },
            deskTopLyric(){
                return this.$store.state.deckTopLyric
            },
            netId(){
                return this.$store.state.songDialogInfo.netId === (-1) ? "未绑定":this.$store.state.songDialogInfo.netId
            },
            songInfo(){
                return this.$store.state.songDialogInfo
            },
            globalShortcut(){
                return this.$store.state.globalShortcut
            },
            showLyric(){
                return this.$store.state.showLyrics;
            },
            showQueue() {
                return this.$store.state.showQueue;
            },
            playlists(){
                return this.$store.state.playlists
            },
            moreInfo(){
                return this.$store.state.moreInfoOfNowSong
            },
            playedTime() {
                if (this.nowSong) {
                    const totalDurationInMilliseconds = this.getDurationInMilliseconds(this.nowSong.duration);
                    const playedDurationInMilliseconds = (this.currentProgress / 100) * totalDurationInMilliseconds;
                    this.$store.state.currentPlayTime = playedDurationInMilliseconds / 1000
                    return this.formatTime(playedDurationInMilliseconds);
                }else{
                    return false
                }

            },
            nowSongDuration() {
                if (this.nowSong) {
                    return this.nowSong.duration.substring(0, 5);
                }else{
                    return false
                }
            },
            volume: {
                get() {
                    return this.$store.state.volume;
                },
                set(newVolume) {
                }
            },
            playMode(){
                return this.$store.state.nowMode
            },
            isPlaying(){
                return this.$store.state.isPlaying
            },
            nextSongs(){
                return this.$store.state.nextSongs
            },
            nextSongsIndex(){
                return this.$store.state.nextSongsIndex
            },
            currentProgress:{
                get() {
                    return this.$store.state.currentProgress>100?100:this.$store.state.currentProgress
                },
                set(value) {
                    this.$bus.$emit('changeProgress', value>100?100:value);
                },
            },
            ...mapGetters(['filteredSongs']),
            ...mapState(['currentIndex'])
        },
        methods: {
            saveEdit(){
                // 正在播放的歌，立即修改歌词、封面和更多信息
                if (this.toEditSongInfo.nowSong.id === this.$store.getters.nowSong.id) {
                    if (this.editingLyrics === null || this.editingLyrics === undefined || this.editingLyrics === "") {
                        this.$store.state.lyricOfNowSong = "[00:00.00]无本地歌词，请开启在线搜索歌词功能"
                    }else{
                        this.$store.state.lyricOfNowSong = this.editingLyrics
                    }
                    this.$store.state.nowSongCover = this.toEditSongInfo.cover
                    this.$store.state.songDialogInfo.cover = this.toEditSongInfo.cover

                    this.$store.state.songDialogInfo.moreInfo.year = this.toEditSongInfo.moreInfo.year
                    this.$store.state.songDialogInfo.moreInfo.trackNumber = this.toEditSongInfo.moreInfo.trackNumber
                    this.$store.state.songDialogInfo.moreInfo.genre = [this.toEditSongInfo.moreInfo.genre]
                    this.$store.state.songDialogInfo.moreInfo.comment = [this.toEditSongInfo.moreInfo.comment]
                }
                // 修改队列里的歌
                const song2 = this.$store.state.queue.find(song => song.id === this.toEditSongInfo.nowSong.id)
                if (song2) {
                    song2.title = this.toEditSongInfo.nowSong.title
                    song2.artist = this.toEditSongInfo.nowSong.artist
                    song2.album = this.toEditSongInfo.nowSong.album
                }
                // 修改音乐库的歌
                const song = this.$store.state.songs.songs.find(song => song.id === this.toEditSongInfo.nowSong.id)
                if (song) {
                    song.title = this.toEditSongInfo.nowSong.title
                    song.artist = this.toEditSongInfo.nowSong.artist
                    song.album = this.toEditSongInfo.nowSong.album
                }


                if (this.editingLyrics !== null && this.editingLyrics !== undefined && this.editingLyrics !== "") {
                    this.toEditSongInfo.lyricsFromLrc = this.editingLyrics
                    this.toEditSongInfo.lyricsFromAudio = this.editingLyrics
                }
                // 修改本地文件
                myAPI.editMetadata(this.toEditSongInfo, this.$store.state.lyricDirectory)

                // 如果在音乐库、播放列表、文件夹，修改封面
                setTimeout(()=>{
                    if (this.$route.path === "/Library") {
                        this.$bus.$emit("updateCoverInLibrary")
                    }else if(this.$route.path === "/SongsInPlaylist"){
                        this.$bus.$emit("updateCoverInPlaylists")
                    }else if(this.$route.path === "/SongsInFolder"){
                        this.$bus.$emit("updateCoverInFolder")
                    }
                },1000)

                this.showEditMetadata = false
                this.toEditSongInfo = null
            },
            insertLyrics(){
                if (this.toEditSongInfo.lyricsFromAudio) {
                //    删除内嵌
                    this.toEditSongInfo.lyricsFromAudio = null
                    this.insert = true
                    this.editingLyrics = this.toEditSongInfo.lyricsFromLrc
                }else{
                //      内嵌歌词
                    this.toEditSongInfo.lyricsFromAudio = this.editingLyrics
                    this.insert = false
                }
            },
            delLyrics(){
                this.editingLyrics = null
                this.toEditSongInfo.lyricsFromAudio = null
                this.toEditSongInfo.lyricsFromLrc = null
                this.insert = true
            },
            async chooseCover() {
                const coverData = await myAPI.chooseCover()
                const coverPath = coverData[1]
                const cover = coverData[0]
                this.toEditSongInfo.cover = cover?cover: this.toEditSongInfo.cover
                this.toEditSongInfo.coverPath = coverPath?coverPath: null
            },
            delCover(){
                this.toEditSongInfo.cover = null
                this.toEditSongInfo.coverPath = "删除封面"
            },
            async showEditMetadataModal() {
                const result = await myAPI.getLyrics(this.$store.state.songDialogInfo.nowSong.path, this.$store.state.lyricDirectory)
                this.toEditSongInfo = JSON.parse(JSON.stringify(this.$store.state.songDialogInfo));
                if (result.lyricsFromAudio === null || result.lyricsFromAudio === undefined) {
                    this.insert = true
                    this.editingLyrics = result.lyricsFromLrc
                }else{
                    this.insert = false
                    this.editingLyrics = result.lyricsFromAudio
                }

                this.toEditSongInfo.lyricsFromAudio = result.lyricsFromAudio
                this.toEditSongInfo.lyricsFromLrc = result.lyricsFromLrc
                this.toEditSongInfo.moreInfo.genre = this.$store.state.songDialogInfo.moreInfo.genre[0]
                this.toEditSongInfo.moreInfo.comment = this.$store.state.songDialogInfo.moreInfo.comment[0]
                this.toEditSongInfo.coverPath = null
                this.$store.state.songDialogInfo = this.$store.state.nowSongDialogInfo
                this.showInfoDialog = false
                this.showEditMetadata = true
            },
            closeEdit(){
                this.showEditMetadata = false
                this.toEditSongInfo = null
            },

            changeEQ(flag){
                if (flag !== -1) {
                    this.$store.state.useEQ = true
                    this.$store.state.EQParam = JSON.parse(JSON.stringify(this.tenEQ[flag]));
                }else{
                    this.$store.state.EQParam = [0,0,0,0,0,0,0,0,0,0]
                }
            },
            changeUseEQ(){
                this.$store.state.useEQ = !this.$store.state.useEQ
            },
            handleMouseEnter(flag) {
                if (flag) {
                    clearTimeout(this.timer);
                    this.showMenu = true;
                    if (!this.$refs.menu.classList.contains("show")) {
                        this.$refs.menu.classList.add("show")
                    }
                }else{
                    clearTimeout(this.timer);
                    this.showMenu = true;
                }
            },
            handleMouseLeave(flag) {
                this.timer = setTimeout(() => {
                    this.$refs.menu.classList.remove("show")
                    setTimeout(()=>{
                        this.showMenu = false
                    },100)
                }, flag?500:10);
            },
            changeInfo(){
                myAPI.changeInfo(this.$store.getters.nowSong.path)
            },
            closeDialogInfo(){
                this.$store.state.songDialogInfo = this.$store.state.nowSongDialogInfo
                this.showInfoDialog = false
            },
            showMoreInfo(mode,song){
                this.showInfoDialog = true
            },
            changeMute(){
                this.$store.state.isMute = !this.$store.state.isMute
            },
            changeShowSpectrum(){
                this.$store.state.showSpectrum = !this.$store.state.showSpectrum
            },
            changeDeskTopLyric(){
                this.$store.state.deckTopLyric = !this.$store.state.deckTopLyric
                if (this.$store.state.deckTopLyric) {
                    myAPI.openDeckTopLyric(true, this.$store.state.isPlaying)
                }else{
                    myAPI.openDeckTopLyric(false, this.$store.state.isPlaying)
                }
            },
            changeShowLyric(){
                const showQueue = this.$store.state.showQueue
                this.$store.state.showInfo = !this.$store.state.showInfo
                this.$store.state.showLyrics = !this.$store.state.showLyrics
                if (showQueue) {
                    this.$store.state.showQueue = !this.$store.state.showQueue
                }
                setTimeout(()=>{
                    this.$store.state.showInfo = !this.$store.state.showInfo
                    if (showQueue) {
                        this.$store.state.showQueue = !this.$store.state.showQueue
                    }
                },500)
            },
            changeShowQueue(){
                const showLyric = this.$store.state.showLyrics
                this.$store.state.showInfo = !this.$store.state.showInfo
                if (showLyric) {
                    this.$store.state.showLyrics = !this.$store.state.showLyrics
                }
                this.$store.state.showQueue = !this.$store.state.showQueue
                setTimeout(()=>{
                    this.$store.state.showInfo = !this.$store.state.showInfo
                    if (showLyric) {
                        this.$store.state.showLyrics = !this.$store.state.showLyrics
                    }
                },500)
            },
            getDurationInMilliseconds(durationString) {
                const parts = durationString.split(':');
                const minutes = parseInt(parts[0]);
                const seconds = parseInt(parts[1]);
                const millisecond = parseInt(parts[2]);
                return minutes * 60000 + seconds *1000+millisecond;
            },

            formatTime(milliseconds) {
                const minutes = Math.floor(milliseconds / 60000);
                const seconds = Math.floor((milliseconds % 60000) / 1000);
                return `${this.padTime(minutes)}:${this.padTime(seconds)}`;
            },

            padTime(time) {
                if (isNaN(time.toString().padStart(2, '0'))) {
                    return "00"
                }else{
                    return time.toString().padStart(2, '0');
                }

            },
            updateProgressBarOnClick(event) {

                const progressBar = this.$refs.footerProgressBar;
                const rect = progressBar.getBoundingClientRect();
                const offsetX = event.clientX - rect.left;
                const progressBarWidth = progressBar.offsetWidth;
                const newProgress = (offsetX / progressBarWidth) * 100;
                this.$bus.$emit('changeProgress', newProgress);
            },
            updateProgressBarOnClickVolume(event) {
                const progressBar = this.$refs.footerVolumeProgressBar;
                const rect = progressBar.getBoundingClientRect();
                const offsetX = event.clientX - rect.left;
                const progressBarWidth = progressBar.offsetWidth;
                const newProgress = Math.round((offsetX / progressBarWidth) * 100);
                this.$store.state.volume = newProgress
                this.showVolumeValue = true;

                clearTimeout(this.volumeValueTimeout);
                this.volumeValueTimeout = setTimeout(() => {
                    this.showVolumeValue = false;
                }, 1000); // 1秒后隐藏
            },
            updateVolume(event) {
                const newVolume = event.target.value;
                this.$store.commit('SET_VOLUME', newVolume);
                this.showVolumeValue = true;
                // 设置一个定时器，一段时间后隐藏音量数值显示
                clearTimeout(this.volumeValueTimeout);
                this.volumeValueTimeout = setTimeout(() => {
                    this.showVolumeValue = false;
                }, 1000); // 1秒后隐藏
            },
            showVolume(){
                this.showVolumeValue = true;
                clearTimeout(this.volumeValueTimeout);
                this.volumeValueTimeout = setTimeout(() => {
                    this.showVolumeValue = false;
                }, 1000);
            },
            showInfo(){
                if (!this.showInfoDialog) {
                    this.showMoreInfo(0,null)
                }else{
                    this.closeDialogInfo()
                }
            },
            showPlaylist(){
                this.showPlaylistModal = !this.showPlaylistModal
            },
            adjustVolumeWithWheel(event) {
                event.preventDefault(); // 阻止滚轮默认行为

                const delta = -Math.sign(event.deltaY); // 获取滚轮滚动方向，1 表示上滚，-1 表示下滚
                const step = 3; // 调整音量的步长

                let newVolume = this.volume + delta * step;
                newVolume = Math.max(0, Math.min(100, newVolume)); // 确保音量在合法范围内

                this.$store.commit('SET_VOLUME', newVolume);
                this.showVolumeValue = true;

                clearTimeout(this.volumeValueTimeout);
                this.volumeValueTimeout = setTimeout(() => {
                    this.showVolumeValue = false;
                }, 1000); // 1秒后隐藏
            },
            toHome() {
                // 在 Footer 中的封面点击后展示主页
                this.$bus.$emit('toHome');
            },
            togglePlay() {
                if (!this.$store.state.blockSpace) {
                    this.$store.dispatch('togglePlay');
                }
            },
            playNext() {
                if (!this.isNextButtonDisabled) {
                    this.isNextButtonDisabled = true;
                    if (this.nextSongs.length !== 0 && this.nextSongsIndex < this.nextSongs.length-1) {
                        this.$store.state.nextSongsIndex += 1
                        if (this.nextSongsIndex === 0) {
                            this.$store.state.playNextSongs = true
                        }
                        this.$store.state.isPlaying = true
                    }else{
                        if (this.nextSongs.length !== 0 && this.nextSongsIndex === this.nextSongs.length - 1) {
                            this.$store.state.nextSongsIndex = -1
                            this.$store.state.nextSongs = []
                            this.$store.state.playNextSongs = false
                        }
                        this.$store.dispatch('nextSong');
                    }
                    setTimeout(() => {
                        this.isNextButtonDisabled = false;
                    }, 500);
                }

            },
            triggerEvent1() {
                this.$bus.$emit('songOnTop')
            },
            playLast() {
                if (!this.isPrevButtonDisabled) {
                    this.isPrevButtonDisabled = true;

                    if (this.nextSongs.length !== 0 && this.nextSongsIndex >= 0) {
                        if (this.$store.state.nextSongsIndex - 1 < 0) {
                            this.$store.state.playNextSongs =false
                            this.$store.state.nextSongsIndex = -1
                        }else{
                            this.$store.state.nextSongsIndex -= 1
                        }
                        this.$store.state.isPlaying = true
                    }else{
                        this.$store.dispatch('prevSong');
                    }

                    setTimeout(() => {
                        this.isPrevButtonDisabled = false;
                    }, 500);
                }
            },
            ...mapMutations(['CHANGE_MODE_AND_INDEX',
                'SET_FILTER_TYPE',
                'SET_SELECTED_PLAYLIST_NAME',
                'CHANGE_QUEUE_AND_PLAY']),
            changePlayMode() {
                this.CHANGE_MODE_AND_INDEX()
            },
            openPlaylist(playlistName) {
                this.SET_FILTER_TYPE('byPlaylist')
                this.SET_SELECTED_PLAYLIST_NAME(playlistName)
                let songs = this.filteredSongs
                const index = 0
                this.$store.commit('CLEAR_SHUFFLED_INDEX');
                this.$store.commit('CHANGE_QUEUE_AND_PLAY', {songs, index});
                if (this.$route.path !== "/") {
                    this.$router.push({
                        name: "Home",
                    });
                }
                if (this.$store.state.showQueue) {
                    setTimeout(()=>{
                        this.$bus.$emit('songOnTop')
                    },100)
                }

                this.showPlaylistModal = false
            }
        }
    };
</script>
