const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input'); 
const $messageFormBtn = $messageForm.querySelector('button');
const $btnLocation = document.querySelector('#btn-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () =>  {
    //new message element
    const $newMessage = $messages.lastElementChild

    //heught of the new message
    const newMessagesStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessagesStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight * newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height od messages container.
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled
    const scrollOffSet = $messages.scrollTop + visibleHeight	

    if(containerHeight - newMessageHeight <= scrollOffSet){
        $messages.scrollTop  = $messages.scrollHeight
    }
}

socket.on('message',(message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('HH:mm a'),
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll();
})

socket.on('locationMessage',(url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate,{
        username:url.username,
        url:url.text,
        createdAt:moment(url.createdAt).format('HH:MM a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll();
})

socket.on('roomData',({room,users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML= html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormBtn.setAttribute('disabled','disabled')

    const clientText = e.target.elements.message.value

    socket.emit('clientMessage',clientText,(error) => {
        if(error){
            return console.log(error)
        }

        $messageFormBtn.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        console.log('Delivered')
    })
    
})

document.querySelector('#btn-location').addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    $btnLocation.setAttribute('disabled','disabled');
    

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation',{
            longitude:position.coords.longitude,
            latitude:position.coords.latitude
        },(error) => {
            if(error){
                return console.log(error)
            }

            $btnLocation.removeAttribute('disabled')

            console.log('Location shared')
        })
    })

    
})

socket.emit('join', { username,room }, (error) => {
    if(error){
        alert(error);
        location.href = '/';
    }
})

