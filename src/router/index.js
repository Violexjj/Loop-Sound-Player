
// 导入vue-router插件
import VueRouter from "vue-router"

// 导入组件
import Home from '../pages/Home'
import Search from '../pages/Search'
import Playlists from '../pages/Playlists'
import Library from '../pages/Library'
import Albums from '../pages/Albums'
import AlbumDetail from '../pages/AlbumDetail'
import Artists from '../pages/Artists'
import ArtistDetail from '../pages/ArtistDetail'
import Settings from '../pages/Settings'
import SongsInPlaylist from "@/pages/SongsInPlaylist";


// 创建路由器对象（在路由器对象中配置路由。）
const router = new VueRouter({
    // 在这里配置所有的路由规则。
    routes : [
        {
            name : 'Search',
            path : '/Search',
            component : Search,
            props : true
        },
        {
            name : 'Home',
            path : '/',
            component : Home,
            props : true,
        },
        {
            name : 'Playlists',
            path : '/Playlists',
            component : Playlists,
            props : true
        },
        {
            name : "SongsInPlaylist",
            path : '/SongsInPlaylist',
            component : SongsInPlaylist,
            props:true
        },
        {
            name : 'Library',
            path : '/Library',
            component : Library,
            props : true
        },
        {
            name : 'Albums',
            path : '/Albums',
            component : Albums,
            props : true
        },
        {
            name : 'AlbumDetail',
            path: '/AlbumDetail/',
            component: AlbumDetail,
            props: true
        },
        {
            name : 'Artists',
            path : '/Artists',
            component : Artists,
            props : true
        },
        {
            name : 'ArtistDetail',
            path: '/ArtistDetail/:artist',
            component: ArtistDetail,
            props: true
        },
        {
            name : 'Settings',
            path : '/Settings',
            component : Settings,
            props : true
        }
    ]
})

// 暴露路由器对象(导出路由器对象)
export default router
