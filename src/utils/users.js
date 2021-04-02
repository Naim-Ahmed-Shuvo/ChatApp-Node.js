const users = [];

// add user
const addUser = ({id,username,room}) =>{
    // clean data
   username = username.trim().toLowerCase();
   room = room.trim().toLowerCase();

   // validate data
   if(!username || !room){
       return {
           error: 'Usernamae and Room are required !'
       }
   }

    // check for existing user
    const existingUser = users.find(user => user.room === room && user.username === username)
    if(existingUser){
        return {
            error: 'User is in use !'
        }
    }

    // adding to users
    const user={id,username,room}
    users.push(user);
    
    return {user}
}

// getUser
const getUser = (id) => {
    return users.find(user => user.id === id); 
}

// getUsersInRoom
const getUsersInRoom = (room)=>{
  return users.filter(user => user.room === room);
}
// remove user 
const removeUser = (id) =>{
  const index = users.findIndex(user=>user.id ===id)
  if(index !== -1){
      return users.splice(index,1)[0]
  }
}

module.exports = {
    addUser,getUser,getUsersInRoom,removeUser
}