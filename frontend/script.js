let loggedIn = false;

let userId;


window.addEventListener('DOMContentLoaded', async () =>{
    await fetchAndDisplayBlogPosts();
})

async function fetchAndDisplayBlogPosts() {
    try {
        const blogPostResponse = await fetch('/blogs/');
        if (!blogPostResponse.ok) {
            throw new Error('Failed to fetch blog posts');
        }
        const blogPosts = await blogPostResponse.json();

        await Promise.all(blogPosts.map(async (blogPosts) => {
            const authorResponse = await fetch(`/users/getUserById/${blogPost.author}`);
            if (!authorResponse.ok) {
                throw new Error('Failed to fetch author details');
            }
            const authData = await authorResponse.json();
            blogPost.authorName = authData.name;
        }));

        await Promise.all(blogPosts.map(async (blogPost) => {
            await Promise.all(blogPost.comments.map(async (comment) => {
                const userResponse = await fetch(`/users/getUserById/${comment.user}`);
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user details');
                }
                const userData = await userResponse.json();
                comment.userName = userDate.name;
            }));
        }));

        await displayBlogPost(blogPosts);

    }catch (error){
        console.error('Error fetcjing content', error.message);
    }
}

async function displayBlogPost(blogPosts){
    const blogPostContainer = document.getElementById('blogPosts');
    blogPostContainer.innerHTML = '';

    blogPosts.forEach(blogPost => {
        const cardElement = createBlogPostCard(blogPost);
        blogPostContainer.appendChild(cardElement);
    })
}

function createBlogPostCard(blogPost){
    const cardElement = document.createElement('div');
    cardElement.classList.add('blog-post-card');

    const titleElement = document.createElement('h5');
    titleElement.textContent = blogPost.title;

    const authorElement = document.createElement('p')
    authorElement.textContent = `Author: ${blogPost.authorName}`;

    const contextElement = document.createElement('p');
    contextElement.textContent = blogPost.content;

    const postLikesButton = createLikeButton(blogPost.likes);

    postLikesButton.addEventListener('click', async () => {
        if(blogPost.liked || !loggedIn){
            //do nothing
            return;
        }
        try{
            const response = await fetch(`blogs/like/${blogPost._id}`,{
                method: 'PUT',
                headers: {'Content-Type': 'application/json'
                }
            })

            if(!response.ok){
                throw new Error('Failed to like the post... please try again')
            }

            blogPost.likes++;
            postLikesButton.querySelector('.likes-count').textContent = `${blogPost.likes}`
            blogPost.liked = true
        }catch (error){
            console.error('error: ', error.message)
        }
    })

    const commentsElement = createCommentsElement(blogPost)

    cardElement.appendChild(titleElement);
    cardElement.appendChild(authorElement);
    cardElement.appendChild(postLikesButton)
    cardElement.appendChild(contextElement);
    cardElement.appendChild(commentsElement);

    if(loggedIn){
        const commentForm = createCommentsForm(blogPost._id)
        cardElement.appendChild(commentForm)
    }

    return cardElement;
}

function createLikeButton(likes) {
    const likesbutton = document.createElement('button')
    likesbutton.classList.add('Likes-button');

    const heartIcon = document.createElement('img');
    heartIcon.classList.add('heart-icon');
    heartIcon.src = 'resources/like.png';
    heartIcon.alt = 'Like';

    const likesCount = document.createElement('span')
    likesCount.textContent = `${likes}`
    likesCount.classList.add('likes-count');

    likesbutton.appendChild((heartIcon))
    likesbutton.appendChild(likesCount)

    return likesbutton;
}

function createCommentsElement(blogPost){
    const commentsElement = document.createElement('ul');
    commentsElement.classList.add('comment-list');

    blogPost.comments.forEach((comment, index) =>{
        const commentItem = document.createElement('li');

        const userIcon = document.createElement('img');
        userIcon.classList.add('heart-icon');
        userIcon.src = 'resources/user.png';
        userIcon.alt = 'user';

        const commentContent = document.createElement('span')
        commentContent.textContent = '${comment.userName} : ${comment.content}';

        const commentLikesButton = createLikeButton(comment.likes)

        commentItem.appendChild(userIcon)
        commentItem.appendChild(commentContent)
        commentItem.appendChild(commentLikesButton)
        commentsElement.appendChild(commentItem)

        commentLikesButton.addEventListener('click', async () => {
            if(comment.liked || !loggedIn){
                //do nothing
                return;
            }
            try{
                const response = await fetch(`blogs/${blogPost._id}/comment/like/${index}`,{
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'
                    }
                })

                if(!response.ok){
                    throw new Error('Failed to like the post... please try again')
                }

                comment.likes++;
                commentLikesButton.querySelector('.likes-count').textContent = `${blogPost.likes}`
                commentLikesButton.classList.add('liked')
                blogPost.liked = true
            }catch (error){
                console.error('error: ', error.message)
            }
        })
    })

    return commentsElement
}

function CreateCommentForm(blogPostId){
    const commentForm = document.createElement('form')
    commentForm.classList.add('comment-form');

    const commentTextarea = document.createElement('textarea')
    commentTextarea.setAttribute('placeholder', 'Write your comment here...');
    commentTextarea.setAttribute('name', 'comment');
    commentTextarea.classList.add('form-control', 'mb-2')
    commentForm.appendChild(commentTextarea)

    const submitButton = document.createElement('button')
    commentTextarea.setAttribute('type', 'submit');
    commentTextarea.textContent = 'Submit';
    commentTextarea.classList.add('btn', 'btn-primary')
    commentForm.appendChild(submitButton)

    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if(!loggedIn){
            console.log('Please login to submit a comemnt.')
            return
        }

        const formData = new FormData(commentForm);
        const commentContent = formData.get('comment')

        try {
            const response = await fetch(`/blogs/${blogPostId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(({content: commentContent, userId: userId}))
            })

            if (!response.ok) {
                throw new Error('Failed to add comment. Please try again.')
            }

            commentForm.reset()
            console.log('Comment added')
            const updatedBlogPosts = await fetch(`/blogs/${blogPostId}`)
            const updatedBlogPost = await updatedBlogPosts.json()
            await fetchAndDisplayBlogPosts();
        }catch (error){
            console.error('Error:', error.message)
        }
    })
    return commentForm;
}

document.getElementById('LoginForm').addEventListener('submit', async(event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username')
    const password = formData.get('password')

    try {
        const response = await fetch('/users/login', {
            method: 'POST',
            headers: {
                'Context-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        });

        if (!response.ok) {
            throw new Error('Login Failed. Try Again')
        }

        const data = await response.json();
        userId = data._id;
        loggedIn = true;

        console.log('Login Successful: ', data);

        document.getElementById('loginFormContainer').style.display = 'none';
        document.getElementById('blogFormContainer').style.display = 'block';

        document.getElementById('userGreeting').innerHTML = '<h4>Hello, ${data.name}</h4>'

        await fetchAndDisplayBlogPosts()

    }catch (error) {
        console.error('Error:', error.message);
        document.getElementById('validation').innerHTML = '<p>${error.message}</p>'
    } finally {
        event.target.reset();
    }
});
