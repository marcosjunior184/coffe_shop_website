import '.App.css';

import {BrowserRouter, Route, Link} from 'react-router-dom';
import {useState} from 'react';
import { response } from 'express';

import {addPost} from 'writePost';
import {readPost} from 'readPost'

function App(){
    const [getPost, setPost] = useState([]);

    if(getPost.length < 1){
        fetch('http://localhost:8888/read')
        .then(response => response.json())
        .then(response => setPost(response))
    };
    return(
        <div className="App">
            <header className="App-header">
                <p>
                    <BrowserRouter>
                    <Link to="/readPost"><button>get Posts</button></Link>
                    <Link to='/writePost'><button>Write post</button></Link>
                    <Route path='/readPost'>
                        <readPost get = {getPost}/>
                    </Route>
                    <Route path='/writePost'>
                        <writePost set = {setPost}/>
                    </Route>
                    </BrowserRouter>
                </p>
            </header>
        </div>
    );
    
}

export default App;