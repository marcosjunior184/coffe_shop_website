
import {BrowserRouter, Route, Link} from 'react-router-dom';
import {useState} from 'react';


import {WritePost} from './pages/writePost';
import {ReadPost} from './pages/readPost';
import {Landing} from './pages/landing';

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
                    <Route path="/" exact>
                      <Landing />
                    </Route>
                    <Route path='/readPost'>
                        <ReadPost get = {getPost}/>
                    </Route>
                    <Route path='/writePost'>
                        <WritePost set = {setPost}/>
                    </Route>
                    <Link to="/readPost"><button>get Posts</button></Link>
                    <Link to='/writePost'><button>Write post</button></Link>
                    </BrowserRouter>
                </p>
            </header>
        </div>
  );
    
}

export default App;