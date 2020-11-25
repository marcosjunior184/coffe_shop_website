import React from 'react';
import {useState} from 'react';

export const WritePost = ({set}) => {
    const [getPostID, setPostID] = useState('');
    const [getUsername, setUsername] = useState('');
    const [getText, setText] = useState('');



    return(
        <>
        <h3>Write a post</h3>

        <div>
            <input type="text" 
                placeholder='Please enter your id' 
                value={getPostID} 
                onChange={e => setPostID(e.target.value)}/>
        </div>
        <div>
            <input type="text" 
                placeholder='Enter username' 
                value={getUsername} 
                onChange={e => setUsername(e.target.value)}/>
        </div>
        <div>
            <textarea type="text" 
                placeholder='Enter text' 
                value={getText} 
                onChange={e => setText(e.target.value)}/>
        </div>

        <div>
            <button onClick = {(e) => {
                var date = new Date();
                var timestamp = date.getFullYear()+'/'+date.getMonth()+'/'+date.getDay()+' -- '+ date.getHours()+':'+date.getMinutes();
                fetch('http://localhost:8888/write', {method: 'POST', 
                body: `id=${getPostID}&username=${getUsername}&text=${getText}&timestamp=${timestamp}`,
                headers: {'Content-type': 'application/x-www-form-urlencoded'}})
                .then(fetch('http://localhost:8888/read')
                    .then(response => response.json())
                    .then(response => set(response))
                    .then(alert('it has been posted'))
                );
            }}>Submit</button>
        </div>
        </>
    );
}
