const generateMessage = (username, text)=>{
    return {
        username,
        text,
        createdAt: new Date().getTime() // to get a timestamp
    }
}


const generateLocationMessage = (username, link)=>{
    return {
        username,
        link,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}