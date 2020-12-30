class Missile{
    constructor(id,x,y,angle){
        this.x = x;
        this.y = y;
        this.vel = 30;
        this.xv = this.vel * Math.cos(angle);
        this.yv = this.vel * Math.sin(angle);
        this.radius = 10;
        this.id = id;
    }
    move(){
        this.x += this.xv;
        this.y += this.yv;
    }
    outOfBounds(width,height){
        return this.x < 0 || this.x > width ||
                this.y < 0 || this.y > height;
    }
    collision(list){
        for(const user of list){
            if(user.id === this.id || user.dead())
                continue;
            const distSqr = Math.pow(user.x-this.x,2) + Math.pow(user.y-this.y,2);
            const dist = Math.sqrt(distSqr);
            if(dist < this.radius + user.radius){
                user.health -= 1;
                return user;
            }
        }
        return false;
    }
}

module.exports = Missile;