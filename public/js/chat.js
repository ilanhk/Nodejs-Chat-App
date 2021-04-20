const socket = io() //all we need to connect to the server

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true, }) // 'location.search' shows an object of what 'room' you are in and the '?username' and 'ignoreQueryPrefix: true' makes sure the '?' in the string goes away ('location' is built in)

const autoscroll = ()=>{
    // New message element
    const $newMessage = $messages.lastElementChild // this would grab the last element (which would be the new message)

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage) // get the styles of the new message element sp we know the margin bottom spacing value is
    const newMessageMargin = parseInt(newMessageStyles.marginBottom) //to make the specific style into an integer
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin // to increase the height by adding an extra message

    //Visable Height
    const visableHeight = $messages.offsetHeight

    //Height of Messages Container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visableHeight // scrollTop gives us a number of the distance we scrolled from the top

    if(containerHeight -newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight //this will scroll to the bottom
    }

}

socket.on('message', (message)=>{
    console.log(message)
    //to redner the template
    const html = Mustache.render(messageTemplate, {
        user: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a') // moment is a library allowing us to manipulate timestamps. It is already in Nodejs no need to install. "h:m a" would show u the hour and the minute and the 'a' is the am/pm in general add the string tokens in the string.
    })
    $messages.insertAdjacentHTML('beforeend', html) // this allows us to insert any html element adjacent to the html selected
    autoscroll()

})  // to recieve the event from the server and a function of what to do with it ('message' came from the server)

socket.on('location-message', (url)=>{
    console.log(url)

    const html = Mustache.render(locationMessageTemplate, {
        username: url.username,
        url: url.link,
        sentAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})  



socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})




$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

   const message = e.target.elements.message.value //target is the form selected from queryselector 'elements.message' allows u to get an element by its name (inputs name is 'message').

    socket.emit('sendMessage', message, (error)=>{

        $messageFormButton.removeAttribute('disabled') // to disable the send form button for the chat
        $messageFormInput.value ='' //to clear the chat box after sending a message
        $messageFormInput.focus() // to move the curser inside of there
     
        if (error){
            return console.log(error)
        }
        console.log('Message Delivered!')
    }) //to send a message back to the server from the client using the name 'sendMessage'. The last argument is an acknowledement so that the sender will know that the message has been recieved to the reciever. the acknowlegment is a function that runs once the messaged has been delivered
}) 


$sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled') //to disable the send location button

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },
        ()=>{
            $sendLocationButton.removeAttribute('disabled')

            console.log('Location shared!')
        })
    })
})


socket.emit('join', { username, room }, (error)=>{
    if(error){
        alert(error)
        location.href = '/' //this should be the join page
    }
})
