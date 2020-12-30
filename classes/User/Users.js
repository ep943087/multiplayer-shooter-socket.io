class Users{
    constructor(){
        this.list = [];
    }
    addUser(user){
        this.list.push(user);
    }
    removeUser(id){
        this.list = this.list.filter(user=>{
            return user.id !== id;
        })
    }
    moveUsers(){
        const deadUsers = [];
        for(const user of this.list){
            user.move();
            user.moveMissiles(this);
            if(!user.deadYet && user.dead()){
                deadUsers.push(user);
                user.deadYet = true;
            }
        }
        return deadUsers;
    }
    keyUp(id,key){
        for(const user of this.list){
            if(user.id === id){
                user.map[key] = false;
            }
        }
    }
    keyDown(id,key){
        for(const user of this.list){
            if(user.id === id){
                user.map[key] = true;
            }
        }
    }
    changePositionUser(id,x,y){
        this.list = this.list.map(user=>{
            if(user.id === id){
                this.x = x;
                this.y = y;
            }
        })
    }
    getUser(id){
        for(const user of this.list){
            if(user.id === id)
                return user;
        }
        return null;
    }
}

module.exports = Users;