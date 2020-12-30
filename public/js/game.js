
window.onload = ()=>{
    draw();
}

const url = new URL(window.location.href);
const username = url.searchParams.get('username');

if(username === null){
    alert("Username is required");
    document.location.href = "/";
}

const socket = io();

let gameLogic = null;

let currMosPos = null;

socket.on('connect',()=>{
    socket.emit('joining',{username});
});

const leaderboard = document.querySelector('.leaderboard');


socket.on('gameLogic',gL=>{
    gameLogic = gL;

    leaderboard.innerHTML = "";

    gameLogic.list.forEach(user=>{
        leaderboard.innerHTML += 
            `<li>
                <p><strong>${user.username}</strong> kills ${user.kills}, deaths ${user.deaths}</p>
            </li>`;
    })
})

const dead = user => user.health === 0;

let x = 0,y = 0;
let userX=0,userY=0;
let currUser = null;

document.addEventListener('keydown',e=>{
    if(currUser !== null && !dead(currUser))
        socket.emit('key-down',e.key);
})

document.addEventListener('keyup',e=>{
    if(currUser !== null && !dead(currUser))
        socket.emit('key-up',e.key);
})

const c = document.querySelector('#myCanvas');
const ctx = c.getContext('2d');
c.width = 800;
c.height = 500;

const getMousePos = e => {
    const rect = c.getBoundingClientRect();
    return{
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    }
}

c.addEventListener('click',e=>{
    if(currUser !== null && !dead(currUser)){
        const m = getMousePos(e);
        const angle = Math.atan2(m.y-c.height/2,m.x-c.width/2);
        socket.emit('missile',{angle})
    }
})

c.addEventListener('mousemove',e=>{
    currMosPos = getMousePos(e);
})

c.addEventListener('mouseout',e=>{
    currMosPos = null;
})



const getTranslate = (id,list) => {
    for(const user of list){
        if(id === user.id){
            userX = user.x;
            userY = user.y;
            x = -user.x + c.width/2;
            y = -user.y + c.height/2;
            currUser = user;
            break;
        }
    }
}

const drawUsers = () =>{
    getTranslate(socket.id,gameLogic.list);
    ctx.save();
    ctx.translate(x,y);
    ctx.strokeStyle = "white";
    const user =  gameLogic.list[0];
    if(user){
        ctx.strokeRect(0,0,user.boundWidth,user.boundHeight);
    }
    ctx.textAlign = 'center';
    for(const user of gameLogic.list){
        if(!dead(user)) {
            ctx.textBaseline = 'middle';
            ctx.font = '30px Arial';
            ctx.fillStyle = user.color;
            ctx.fillText(user.username, user.x,user.y - 50);
            ctx.beginPath();
            ctx.arc(user.x,user.y,user.radius,0,2*Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(userX,userY);
            ctx.lineTo(user.x,user.y);
            ctx.strokeStyle = user.color;
            ctx.stroke();
            const cx = user.x - user.radius;
            const cy = user.y - 35;
            const cw = user.radius*2;
            const ch = 10;
            const healthPercent = user.health/user.mhealth;
            ctx.fillStyle = "rgba(255,0,0,1)";
            ctx.fillRect(cx,cy,cw,ch);
            ctx.fillStyle = "rgba(0,255,0,1)";
            ctx.fillRect(cx,cy,cw*healthPercent,ch);
        }
        for(const missile of user.missiles){
            ctx.beginPath();
            ctx.fillStyle = user.color;
            ctx.arc(missile.x,missile.y,missile.radius,0,2*Math.PI);
            ctx.fill();
        }
    }
    ctx.restore();
    if(currMosPos !== null){
        ctx.beginPath();
        ctx.moveTo(c.width/2,c.height/2);
        ctx.lineTo(currMosPos.x,currMosPos.y);
        ctx.strokeStyle = "red";
        ctx.stroke();
    }
    if(currUser !== null){
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        const space = 30;
        ctx.fillText("Kills: " + currUser.kills,10,space);
        ctx.fillText("Deaths: " + currUser.deaths,10,2*space);
        ctx.fillText("Missiles: " + currUser.missileCount.toString(),10,3*space);
    }
}

const modal = document.querySelector('.modal');
const backdrop = document.querySelector('.backdrop');
const modalTitle = document.querySelector('.modal-title');
const playButton = document.querySelector('.play-button');
const quitButton = document.querySelector('.quit-button');

socket.on('dead',msg=>{
    if(!modal.classList.contains('open'))
        modal.classList.add('open');
    if(backdrop.style.display !== "block")
        backdrop.style.display = "block";
    modalTitle.textContent = msg;
    console.log(msg);
})

playButton.addEventListener('click',e=>{
    modal.classList.remove('open');
    backdrop.style.display = 'none';
    socket.emit('reset',null);
})

quitButton.addEventListener('click',e=>{
    document.location.href = "/";
})

const draw = () => {
    requestAnimationFrame(draw);
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,c.width,c.height);
    if(gameLogic === null) return;
    drawUsers();
}