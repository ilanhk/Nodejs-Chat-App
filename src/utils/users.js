const users = []

//to Add User
const addUser = ({id, username, room})=>{
    //Clean the Data
    username = username.trim().toLowerCase() // 'trim removes spaces'
    room = room.trim().toLowerCase()

    //Validate the Data
    if(!username || !room){
        return {
            error: 'Username and Room are required!'
        }
    }

    //Check for existing User
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //Validate Username
    if (existingUser){
        return {
            error: `Username: ${username}, already exists!`
        }
    }

    //Store User
    const user = {id, username, room}
    users.push(user)
    return { user }

} // every single socket/connection to the server has a unique id


//to Remove User
const removeUser = (id)=>{
    const index = users.findIndex((user)=> user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0] //we use splice to remove user from array and 1 beucase we are only removing 1 user.
    }
}

//Get User
const getUser = (id)=>{
   return users.find((user)=> user.id === id)
}

//Get all Users In Room
const getUsersInRoom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user)=> user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
