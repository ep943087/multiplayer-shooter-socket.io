const Missile = require('./Missile');

class User{
    constructor(id,username){
        this.id = id;
        this.boundWidth = 2000;
        this.boundHeight = 1000;
        this.username = username;
        this.x = this.boundWidth*Math.random();
        this.y = this.boundHeight*Math.random();
        const [r1,r2,r3] = User.color();
        this.color = `rgba(${r1},${r2},${r3},1)`;
        this.velocity = 7;
        this.map = {};
        this.radius = 15;
        this.missiles = [];
        this.deaths = 0;
        this.kills = 0;
        this.mhealth = 10;
        this.health = this.mhealth;
        this.maxMissileCount = 50000;
        this.missileCount = this.maxMissileCount;
        this.deadYet = false;
        this.killerName = null;
    }
    dead(){
        return this.health <= 0;
    }
    reset(){
        this.deaths++;
        this.x = this.boundWidth*Math.random();
        this.y = this.boundHeight*Math.random();
        this.velocity = 5;
        this.map = {};
        this.radius = 15;
        this.missiles = [];
        this.mhealth = 10;
        this.health = this.mhealth;
        this.missileCount = this.maxMissileCount;
        this.deadYet = false;
        this.killerName = null;
    }
    move(){
        if(this.map['a']){
            this.x -= this.velocity;
        }
        if(this.map['d']){
            this.x += this.velocity;
        }
        if(this.map['w']){
            this.y -= this.velocity;
        }
        if(this.map['s']){
            this.y += this.velocity;
        }
        if(this.x < 0){
            this.x = 0;
            this.map['a'] = false;
        }
        else if(this.x > this.boundWidth){
            this.x = this.boundWidth;
            this.map['d'] = false;
        }
        if(this.y < 0){
            this.y = 0;
            this.map['w'] = false;
        }
        else if(this.y > this.boundHeight){
            this.y = this.boundHeight;
            this.map['s'] = false;
        }
    }
    moveMissiles(users){
        const {list} = users;
        let userHit;
        for(let i=this.missiles.length-1;i>=0;i--){
            this.missiles[i].move();
            const bounds = this.missiles[i].outOfBounds(this.boundWidth,this.boundHeight);
            const userHit = this.missiles[i].collision(list);
            if(bounds){
                this.missiles.splice(i,1);
            }
            else if(userHit){
                this.missiles.splice(i,1);
                
                if(userHit.dead()) {
                    this.kills++;
                    userHit.killerName = this.username;
                }
            }
        }
    }
    launch(angle){
        if(this.missileCount > 0){
            this.missiles.push(new Missile(this.id,this.x,this.y,angle));
            this.missileCount--;
        }
    }
    static color(){
        const arr = [];
        for(let i=0;i<3;i++){
            arr.push(Math.floor(Math.random()*256));
        }
        return arr;
    }
};

module.exports = User;