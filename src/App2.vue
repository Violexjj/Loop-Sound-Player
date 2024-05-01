<template>
    <div>
        <span
                class="option" style="margin-left: 10px;position: fixed;right: 53px;top: 90px"
                @click="messages = []">清空消息</span>
        <div class="message">
            <div v-for="(message, index) in messages" :key="index" style="margin-left: 10px;margin-bottom: 2px">
                <span>{{index+1+". "}}</span><span :class="{ 'HP1': message.includes('生命值失去'),'HP2': message.includes('生命值增加') }">{{message}}</span>
            </div>
        </div>
        <img src="./devil.jpg" style="width: 100%;height: 100%;z-index: -999;position: fixed;opacity: 1">
        <div class="bullets">
            <br>
            <div style="margin-left: 5px;border-radius: 10px;display: flex;justify-content: center;align-items: center;background-color: rgba(255,255,255,0.6)">
                <span style="font-weight: bold;color: red;font-size: 30px">实弹：</span><span style="margin-right: 100px;font-weight: bold;font-size: 30px">{{red}}</span>
                <span style="font-weight: bold;color: blue;font-size: 30px">空包：</span><span style="font-weight: bold;font-size: 30px">{{blue}}</span>
            </div>
            <br>
<!--            子弹情况-->
            <span
                    class="option" style="margin-left: 10px;"
                    @click="resetBullets()">刷新子弹</span>

            <div style=";height: 120px;width: 1110px" v-show="bullets !== null" class="gun">
                <div v-for="(bullet, index) in bullets" :key="index"
                     class="bullet bullet2">
<!--                     @contextmenu="notShowBullet(index, bullet)"-->
<!--                     @click="showBullet(index, bullet)"-->
                    <span class="show">
                        ?
                    </span>
                </div>
            </div>
<!--            玩家一-->
            <span
                    class="option"
                  @click="p1PH+=1"
                  @contextmenu="p1PH-=1"
            >
                {{`玩家 1：`+p1PH}}
            </span>
            <span
                    @click="addEquipment(1)"
                    class="option"
                    style="margin-left:10px">添加道具</span>
            <span
                    @click="resetEQ(1)"
                    class="option"
                    style="margin-left:10px">清空道具</span>
            <span
                    @click="shoot(1)"
                    class="option"
                    style="margin-left:10px">射击玩家 1</span>
            <div v-show="bullets !== null" style="height: 120px;width: 1110px" class="gun">
                <div v-for="(eq, index) in p1EQ" :key="index"
                     class="bullet"
                     @click="deleteEQ(index,1)">
                    <span class="show2">
                        {{p1EQ[index]}}
                    </span>
                </div>
            </div>
<!--            玩家二-->
            <span class="option"
                  @click="p2PH+=1"
                  @contextmenu="p2PH-=1"
            >
                {{`玩家 2：`+p2PH}}
            </span>
            <span
                    @click="addEquipment(2)"
                    class="option"
                    style="margin-left:10px">添加道具</span>
            <span
                    @click="resetEQ(2)"
                    class="option"
                    style="margin-left:10px">清空道具</span>
            <span
                    @click="shoot(2)"
                    class="option"
                    style="margin-left:10px">射击玩家 2</span>
            <div v-show="bullets !== null" style="height: 120px;width: 1110px" class="gun">
                <div v-for="(eq, index) in p2EQ" :key="index"
                      class="bullet"
                      @click="deleteEQ(index,2)">
                    <span class="show2">
                        {{p2EQ[index]}}
                    </span>
            </div>
            </div>
        </div>
        <div v-show="showPhoneMessage" class="phone1" style="display: flex;
        justify-content: center;
        border-radius: 10px;
        align-items: center;width: 350px;height: 100px;position: fixed;left: 35%;top: 45%;z-index:2;background-color: rgba(0,0,0,1)">
            <span style="color: #f0f0f0;font-size: 30px" class="phone2">{{this.phoneMessage}}</span>
        </div>
    </div>
</template>
<style>
    .HP1{
        color: red;
    }
    .HP2{
        color: blue;
    }
    .message{
        overflow-y: scroll;
        flex-direction: column;
        border-radius: 10px;
        position: fixed;
        right: 50px;
        top: 150px;
        width: 205px;
        height: 600px;
        padding-top: 5px;
        background-color: rgba(255,255,255,0.5);
    }
    .message::-webkit-scrollbar {
        width: 0; /* 将滚动条的宽度设为0 */
        height: 0; /* 将滚动条的高度设为0 */
    }
    .option{
        margin-left:5px;
        user-select: none;
        font-size: 40px;
        background-color: #f0f0f0;
        border-radius: 10px;
        padding-right: 20px;
        padding-left: 20px;
        transition: 0.2s;
        z-index: 1;
    }
    .option:hover {
        background-color: rgba(98, 179, 255, 1); /* 半透明黑色 */
    }
    .show{
        font-size: 60px;
    }
    .show2{
        font-size: 30px;
    }
    .gun {
        margin-top: 10px;
        margin-bottom: 29px;
        margin-left: 5px;
        background-color: rgba(255,255,255,0.5);
        display: flex;
        gap: 20px;
        flex-direction: row;
        align-items: center;
        padding: 10px;
        border-radius: 10px;
    }

    .bullet {
        width: 100px;
        height: 100px;
        border: 8px solid black;
        border-radius: 10px;
        margin-right: 5px;
        opacity: 0.9;
        display: flex;
        justify-content: center;
        align-items: center;
        user-select: none;
    }

    .red {
        background-color: rgba(255, 0, 0, 0.7); /* 半透明红色 */
    }

    .blue {
        background-color: rgba(0, 0, 255, 0.7); /* 半透明蓝色 */
    }
</style>
<script>

    export default {
        name: "App",
        mounted() {
            this.generateBullets()
        },
        watch:{
            p1PH(newValue, oldValue) {
                if (newValue > oldValue) {
                    this.messages.push("玩家 1 生命值增加 "+(newValue-oldValue))
                }else{
                    this.messages.push("玩家 1 生命值失去 "+(oldValue-newValue))
                }
            },
            p2PH(newValue, oldValue) {
                if (newValue > oldValue) {
                    this.messages.push("玩家 2 生命值增加 "+(newValue-oldValue))
                }else{
                    this.messages.push("玩家 2 生命值失去 "+(oldValue-newValue))
                }
            }
        },
        data(){
            return{
                red: 0,
                blue: 0,
                bullets: null,
                p1PH:0,
                p2PH:0,
                p1EQ:[],
                p2EQ:[],
                p1Saw:0,
                p2Saw:0,
                p1Excite: 0,
                p2Excite: 0,
                phoneMessage: "",
                showPhoneMessage:false,
                eqs:["放大镜","锯子","逆转器","啤酒","香烟","过期药",            "肾上腺素","手机",        "手铐"],
                messages:[]
            }
        },
        computed: {
        },
        methods : {
            deleteEQ(index, player){

                let phoneOrMedicine = null


                if (player === 1) {
                    if (this.p1EQ[index] === "手机") {
                        if (this.p2Excite === 1) {
                            this.messages.push("玩家 2 使用：手机")
                        }else{
                            this.messages.push("玩家 1 使用：手机")
                        }
                        phoneOrMedicine = "phone"
                    }
                    if (this.p1EQ[index] === "过期药") {
                        if (this.p2Excite === 1) {
                            this.messages.push("玩家 2 使用：过期药")
                        }else{
                            this.messages.push("玩家 1 使用：过期药")
                        }
                        phoneOrMedicine = "medicine"
                    }
                    if (this.p1EQ[index] === "放大镜") {
                        if (this.p2Excite === 1) {
                            this.messages.push("玩家 2 使用：放大镜")
                        }else{
                            this.messages.push("玩家 1 使用：放大镜")
                        }
                        phoneOrMedicine = "glass"
                    }
                    if (this.p1EQ[index] === "啤酒") {
                        if (this.p2Excite === 1) {
                            this.messages.push("玩家 2 使用：啤酒")
                        }else{
                            this.messages.push("玩家 1 使用：啤酒")
                        }
                        phoneOrMedicine = "beer"
                    }
                    if (this.p1EQ[index] === "香烟") {
                        if (this.p2Excite === 1) {
                            this.messages.push("玩家 2 使用：香烟")
                        }else{
                            this.messages.push("玩家 1 使用：香烟")
                        }
                        phoneOrMedicine = "cigarette"
                    }
                    if (this.p1EQ[index] === "逆转器") {
                        if (this.p2Excite === 1) {
                            this.messages.push("玩家 2 使用：逆转器")
                        }else{
                            this.messages.push("玩家 1 使用：逆转器")
                        }
                        phoneOrMedicine = "reverser"
                    }
                    if (this.p1EQ[index] === "锯子") {
                        if (this.p2Excite === 1) {
                            this.messages.push("玩家 2 使用：锯子")
                            this.p2Saw += 1
                            this.p2Excite = 0
                        }else{
                            this.messages.push("玩家 1 使用：锯子")
                            this.p1Saw += 1
                        }
                        phoneOrMedicine = "saw"
                    }
                    if (this.p1EQ[index] === "肾上腺素") {
                        this.messages.push("玩家 1 使用：肾上腺素")
                        this.p1Excite += 1
                        phoneOrMedicine = "excite"
                    }
                    if (this.p1EQ[index] === "手铐") {
                        if (this.p2Excite === 1) {
                            this.messages.push("玩家 2 使用：手铐")
                            this.p2Excite = 0
                        }else{
                            this.messages.push("玩家 1 使用：手铐")
                        }
                    }
                    this.p1EQ.splice(index,1)


                }else{
                    if (this.p2EQ[index] === "手机") {
                        if (this.p1Excite === 1) {
                            this.messages.push("玩家 1 使用：手机")
                        }else{
                            this.messages.push("玩家 2 使用：手机")
                        }
                        phoneOrMedicine = "phone"
                    }
                    if (this.p2EQ[index] === "过期药") {
                        if (this.p1Excite === 1) {
                            this.messages.push("玩家 1 使用：过期药")
                        }else{
                            this.messages.push("玩家 2 使用：过期药")
                        }
                        phoneOrMedicine = "medicine"
                    }
                    if (this.p2EQ[index] === "放大镜") {
                        if (this.p1Excite === 1) {
                            this.messages.push("玩家 1 使用：放大镜")
                        }else{
                            this.messages.push("玩家 2 使用：放大镜")
                        }
                        phoneOrMedicine = "glass"
                    }
                    if (this.p2EQ[index] === "啤酒") {
                        if (this.p1Excite === 1) {
                            this.messages.push("玩家 1 使用：啤酒")
                        }else{
                            this.messages.push("玩家 2 使用：啤酒")
                        }
                        phoneOrMedicine = "beer"
                    }
                    if (this.p2EQ[index] === "香烟") {
                        if (this.p1Excite === 1) {
                            this.messages.push("玩家 1 使用：香烟")
                        }else{
                            this.messages.push("玩家 2 使用：香烟")
                        }
                        phoneOrMedicine = "cigarette"
                    }
                    if (this.p2EQ[index] === "逆转器") {
                        if (this.p1Excite === 1) {
                            this.messages.push("玩家 1 使用：逆转器")
                        }else{
                            this.messages.push("玩家 2 使用：逆转器")
                        }
                        phoneOrMedicine = "reverser"
                    }
                    if (this.p2EQ[index] === "肾上腺素") {
                        this.messages.push("玩家 2 使用：肾上腺素")
                        this.p2Excite += 1
                        phoneOrMedicine = "excite"
                    }
                    if (this.p2EQ[index] === "锯子") {
                        if (this.p1Excite === 1) {
                            this.messages.push("玩家 1 使用：锯子")
                            this.p1Saw += 1
                            this.p1Excite = 0
                        }else{
                            this.messages.push("玩家 2 使用：锯子")
                            this.p2Saw += 1
                        }
                        phoneOrMedicine = "saw"
                    }
                    if (this.p2EQ[index] === "手铐") {
                        if (this.p1Excite === 1) {
                            this.messages.push("玩家 1 使用：手铐")
                            this.p1Excite = 0
                        }else{
                            this.messages.push("玩家 2 使用：手铐")
                        }
                    }
                    this.p2EQ.splice(index,1)
                }

                if (phoneOrMedicine === "phone") {
                    let restBulletNum = this.bullets.length
                    let usedBulletNum = 0
                    let shows = document.getElementsByClassName('show')
                    for (let i = 0; i < shows.length; i++) {
                        if (shows[i].innerHTML === "") {
                            restBulletNum -= 1
                            usedBulletNum += 1
                        }
                    }
                    const random = Math.floor(Math.random() * restBulletNum) + 1
                    const result = this.bullets[usedBulletNum+random-1] === 1 ? "实弹":"空包"
                    this.phoneMessage = ("第 "+random+" 发子弹是："+result)
                    this.showPhoneMessage = true
                    setTimeout(()=>{
                        this.phoneMessage = ""
                        this.showPhoneMessage = false
                        this.messages.push("过期的手机消息")
                    },3000)

                    if (player === 1) {
                        if (this.p2Excite === 1) {
                            this.p2Excite -=1
                        }
                    }else{
                        if (this.p1Excite === 1) {
                            this.p1Excite -=1
                        }
                    }
                }
                else if(phoneOrMedicine === "medicine"){
                    let randomNumber = Math.floor(Math.random() * 100) + 1; // 生成 1 到 100 之间的随机数

                    if (player === 1) {
                        if (randomNumber % 2 === 0) {
                            if (this.p2Excite === 1) {
                                this.p2PH += 2
                                this.p2Excite = 0
                            }else{
                                this.p1PH += 2
                            }
                        }else{
                            if (this.p2Excite === 1) {
                                this.p2PH -=1
                                this.p2Excite = 0
                            }else{
                                this.p1PH -= 1
                            }
                        }
                    }else{
                        if (randomNumber % 2 === 0) {
                            if (this.p1Excite === 1) {
                                this.p1PH += 2
                                this.p1Excite = 0
                            }else{
                                this.p2PH += 2
                            }
                        }else{
                            if (this.p1Excite === 1) {
                                this.p1PH -= 1
                                this.p1Excite = 0
                            }else{
                                this.p2PH -= 1
                            }
                        }
                    }
                }
                else if(phoneOrMedicine === "glass"){
                    let bullets2 = document.getElementsByClassName('bullet2')
                    let shows = document.getElementsByClassName('show')
                    for (let i = 0; i < bullets2.length; i++) {
                        if (!bullets2[i].classList.contains("red") && !bullets2[i].classList.contains("blue")) {
                            if (this.bullets[i] === 1) {
                                bullets2[i].classList.add("red")
                                shows[i].innerText = ""
                                setTimeout(()=>{
                                    bullets2[i].classList.remove("red")
                                    shows[i].innerText = "?"
                                },1500)
                            }else{
                                shows[i].innerText = ""
                                bullets2[i].classList.add("blue")
                                setTimeout(()=>{
                                    bullets2[i].classList.remove("blue")
                                    shows[i].innerText = "?"
                                },1500)
                            }
                            if (player === 1) {
                                if (this.p2Excite === 1) {
                                    this.p2Excite -=1
                                }
                            }else{
                                if (this.p1Excite === 1) {
                                    this.p1Excite -=1
                                }
                            }
                            break
                        }
                    }
                }
                else if(phoneOrMedicine === "beer"){
                    let bullets2 = document.getElementsByClassName('bullet2')
                    let shows = document.getElementsByClassName('show')
                    for (let i = 0; i < bullets2.length; i++) {
                        if (!bullets2[i].classList.contains("red") && !bullets2[i].classList.contains("blue")) {
                            if (this.bullets[i] === 1) {
                                bullets2[i].classList.add("red")
                                if (shows[i].innerText !== "转") {
                                    shows[i].innerText = ""
                                }
                            }else{
                                bullets2[i].classList.add("blue")
                                if (shows[i].innerText !== "转") {
                                    shows[i].innerText = ""
                                }
                            }
                            if (player === 1) {
                                if (this.p2Excite === 1) {
                                    this.p2Excite -=1
                                }
                            }else{
                                if (this.p1Excite === 1) {
                                    this.p1Excite -=1
                                }
                            }
                            break
                        }
                    }
                }
                else if(phoneOrMedicine === "cigarette"){
                    if (player === 1) {
                        if (this.p2Excite === 1) {
                            this.p2PH += 1
                            this.p2Excite -=1
                        }else{
                            this.p1PH += 1
                        }
                    }else{
                        if (this.p1Excite === 1) {
                            this.p1PH += 1
                            this.p1Excite -=1
                        }else{
                            this.p2PH += 1
                        }
                    }
                }
                else if(phoneOrMedicine === "reverser"){
                    let bullets2 = document.getElementsByClassName('bullet2')
                    let shows = document.getElementsByClassName('show')
                    for (let i = 0; i < bullets2.length; i++) {
                        if (!bullets2[i].classList.contains("red") && !bullets2[i].classList.contains("blue")) {
                            if (this.bullets[i] === 1) {
                                this.bullets[i] = 0
                                shows[i].innerText = "转"
                            }else{
                                this.bullets[i] = 1
                                shows[i].innerText = "转"
                            }
                            if (player === 1) {
                                if (this.p2Excite === 1) {
                                    this.p2Excite -=1
                                }
                            }else{
                                if (this.p1Excite === 1) {
                                    this.p1Excite -=1
                                }
                            }
                            break
                        }
                    }
                }
            },

            resetEQ(player){
                if (player === 1) {
                    this.p1EQ=[]
                }else{
                    this.p2EQ = []
                }
            },

            addEquipment(player){
                const eq1 = Math.floor(Math.random() * 9)
                const eq2 = Math.floor(Math.random() * 9)
                if (this.p1EQ.length < 8) {
                    this.p1EQ.push(this.eqs[eq1])
                }
                if (this.p2EQ.length < 8) {
                    this.p2EQ.push(this.eqs[eq2])
                }
            },

            notShowBullet(index,bullet){
                let bullets = document.getElementsByClassName('bullet')
                let shows = document.getElementsByClassName('show')
                if (bullet === 1) {
                    bullets[index].classList.remove('red');
                    shows[index].innerText = "?"
                }else{
                    bullets[index].classList.remove('blue');
                    shows[index].innerText = "?"
                }
            },

            showBullet(index,bullet){
                let bullets = document.getElementsByClassName('bullet')
                let shows = document.getElementsByClassName('show')
                if (bullet === 1) {
                    bullets[index].classList.add('red');
                    shows[index].innerText = ""
                }else{
                    bullets[index].classList.add('blue');
                    shows[index].innerText = ""
                }
            },

            shoot(to){
                let bullets2 = document.getElementsByClassName('bullet2')
                let shows = document.getElementsByClassName('show')
                for (let i = 0; i < bullets2.length; i++) {
                    if (!bullets2[i].classList.contains("red") && !bullets2[i].classList.contains("blue")) {
                        if (this.bullets[i] === 1) {
                            bullets2[i].classList.add("red")
                            if (shows[i].innerText !== "转") {
                                shows[i].innerText = ""
                            }
                            if (to === 1) {
                                if (this.p2Saw === 0) {
                                    this.p1PH -= 1
                                }else{
                                    this.p1PH -= this.p2Saw*2
                                    this.p2Saw = 0
                                }
                            }else{
                                if (this.p1Saw === 0) {
                                    this.p2PH -= 1
                                }else{
                                    this.p2PH -= this.p1Saw*2
                                    this.p1Saw = 0
                                }
                            }
                        }else{
                            bullets2[i].classList.add("blue")
                            if (shows[i].innerText !== "转") {
                                shows[i].innerText = ""
                            }
                            if (to === 1) {
                                if (this.p2Saw !== 0) {
                                    this.p2Saw = 0
                                }
                            }else{
                                if (this.p1Saw !== 0) {
                                    this.p1Saw = 0
                                }
                            }
                        }
                        break
                    }
                }
            },

            resetBullets(){
                this.bullets = []
                this.red = 0
                this.blue = 0
                // 定义子弹
                let red = 0
                let blue = 0
                do {
                    red = Math.floor(Math.random() * 4) + 1;
                    blue = Math.floor(Math.random() * 4) + 1;
                } while (red > blue);

                // 生成子弹
                this.red = red
                this.blue = blue

                // 存入子弹
                let bullets = [];
                for (let i = 0; i < this.red; i++) {
                    bullets.push(1); // 将1（实弹）放入数组中
                }
                for (let i = 0; i < this.blue; i++) {
                    bullets.push(0); // 将0（空包弹）放入数组中
                }

                // 打乱子弹
                for (let i = bullets.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [bullets[i], bullets[j]] = [bullets[j], bullets[i]];
                }

                this.bullets = bullets
                let bullets2 = document.getElementsByClassName('bullet')
                let shows = document.getElementsByClassName('show')
                for (let i = 0; i < bullets2.length; i++) {
                        if (bullets2[i].classList.contains('red')) {
                            bullets2[i].classList.remove('red');
                        }
                        if (bullets2[i].classList.contains('blue')) {
                            bullets2[i].classList.remove('blue');
                        }
                        shows[i].innerText = "?"
                }
            },

            generateBullets(){
                // 定义子弹
                let red = 0
                let blue = 0
                do {
                    red = Math.floor(Math.random() * 4) + 1;
                    blue = Math.floor(Math.random() * 4) + 1;
                } while (red > blue);

                // 生成子弹
                this.red = red
                this.blue = blue

                // 存入子弹
                let bullets = [];
                for (let i = 0; i < this.red; i++) {
                    bullets.push(1); // 将1（实弹）放入数组中
                }
                for (let i = 0; i < this.blue; i++) {
                    bullets.push(0); // 将0（空包弹）放入数组中
                }

                // 打乱子弹
                for (let i = bullets.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [bullets[i], bullets[j]] = [bullets[j], bullets[i]];
                }

                this.bullets = bullets

            }
        }
    }
</script>


