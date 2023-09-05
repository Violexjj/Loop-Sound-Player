<template>
    <div class="unselectable settings">
        <h1>设置 & 说明</h1>
        <div class="button-container">
            <div class="custom-button" @click="addFolders"><b>扫描文件夹</b></div>
            <div class="custom-button" @click="addFiles"><b>扫描文件</b></div>
        </div>
        <br>
        <span><b>• 扫描完毕之后请重启播放器。</b></span><br><br>
        <span><b>• 如果添加的歌曲数量较大，建议重启之前等待10 ~ 30秒，等待后台将数据读写完毕之后再打开</b></span><br><br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">
        <div class="button-container">
            <b style="font-size: 20px">切换队列后是否自动切换到主页：</b>
            <div class="custom-button" @click="setToHomeAfterChangeQueue"><b>{{toHomeAfterChangeQueue?"是":"否"}}</b></div>
        </div>
        <br>
        <hr style="border-top: 3px solid #ccc;margin-right: 30px">
        <span><b>• 本播放器仅为实践小项目，如若出现问题页面爆红请重启播放器，大概率能恢复，请多多包涵。</b></span><br><br>
        <span><b>• 时间有限，没有制作迷你模式以及很多其他功能，请多多包涵。</b></span><br><br>
        <span><b>• 由于技术限制，与b站演示中在显示封面方面有较大出入，只留下少部分界面保留显示封面功能，请多多包涵。</b></span><br><br>
        <span><b>• 由于技术限制，切换歌曲时封面分辨率过大会导致加载有点延迟，请多多包涵。</b></span><br><br>
        <span><b>• 如若要手动更改歌曲信息、播放列表信息、封面，请在C:\Users\（本机用户）\AppData\Roaming\Loop Sound Player下修改文件内容，建议不要修改文件名。</b></span><br><br>
        <span><b>• 封面图片文件统一格式为“歌曲标题+采样率.png”，如“Faded983.png”，方便访问。</b></span><br><br>
        <span><b>• 为防止误操作，所有删除动作需要双击。</b></span><br><br>
        <span><b>• 调节音量可以拖动音量条，也可在音量条位置滚动鼠标，还可在音量按钮处滚动鼠标，每次滚动调节音量数为3。</b></span><br><br>
        <span><b>• 点击底部控制栏最左边的圆形封面也可显示主页。</b></span><br><br>
        <span><b>• 支持显示内嵌歌词以及和音频文件同目录的lrc文件。</b></span><br><br>
        <span><b>• 歌词显示如若单句歌词长度过长会导致后面显示不全，技术不够达不到滚动效果，请多多包涵。</b></span><br><br>
        <span><b>• 主页右边的播放队列不会随播放列表更新而更新，如果修改了播放列表数据请重新在底部控制栏切换至播放列表。</b></span><br><br>
        <span><b>• 音乐库和播放列表详情界面右键可进入选择模式。</b></span><br><br>
        <span><b>• 选择模式下，排序功能必须是未选中歌曲才可以进入。</b></span><br><br>
        <span><b>• 选择模式下，播放列表选中一首歌曲可进行手动排序，输入要设置的新序号即可。</b></span><br><br>
        <span><b>• 音乐库不支持手动排序。</b></span><br><br>
        <span><b>• 为保持较好显示效果，请不要将播放器界面设置过小。</b></span><br><br>
        <span><b>• 快捷键：空格-暂停或者播放；ctrl+←：上一曲；ctrl+→：下一曲。</b></span><br><br>

    </div>
</template>

<style scoped>
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
        height: calc(97vh - 230px); /* 100px 是顶部导航栏和底部控制栏的总高度 */
        overflow: auto;
    }
    .button-container {
        display: flex;
        align-items: center;
        margin-top: 20px;
        gap: 50px;
    }

    .custom-button {
        width: 100px;
        height: 40px;
        background: transparent;
        border: 2px solid #f0f0f0;
        border-radius: 50px;
        text-align: center;
        line-height: 40px;
        cursor: pointer;
        color: #f0f0f0;
    }

    .custom-button:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
</style>

<script>
    import {mapState} from "vuex";
    export default {
        name: "Settings",
        data(){
            return{
                folderPath : 0
            }
        },
        computed:{
            ...mapState(['toHomeAfterChangeQueue'])
        },
        methods : {
            setToHomeAfterChangeQueue(){
                this.$store.state.toHomeAfterChangeQueue = !this.$store.state.toHomeAfterChangeQueue
            },
            addFolders(){
                myAPI.addFolders()
            },
            async addFiles(){
                await myAPI.addFiles();
            }
        }
    }
</script>

