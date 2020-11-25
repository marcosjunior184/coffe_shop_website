import React from 'react';


export const ReadPost = ({get}) => {
    return(
        <>
        {get.map(post => (
            <div className="container">
                <h3> Time - {post.timestamp}</h3>

                <h3>Id - {post.postID}</h3>
                
                <h3>username - {post.username}</h3>
                
                <h3>post - {post.text}</h3>
                
            </div>
        ))}
        </>
    );
}