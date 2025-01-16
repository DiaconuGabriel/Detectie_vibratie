document.addEventListener("DOMContentLoaded", function(){
    // listen for auth status changes
    
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("user logged in");
            console.log(user);
            setupUI(user);
            var uid = user.uid;
            console.log(uid);
            updateChart();
        } else {
            console.log("user logged out");
            setupUI();
        }
    });

    // login
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function (event) {
        createChart();
        event.preventDefault();
        // get user info
        const email = document.getElementById('input-email').value;
        const password = document.getElementById('input-password').value;
        const buton = document.getElementsByClassName('btn');
        // log the user in
        auth.signInWithEmailAndPassword(email, password).then((cred) => {
            // close the login modal & reset form
            loginForm.reset();
            console.log(email);
        })
        .catch((error) =>{
            const errorCode = error.code;
            const errorMessage = error.message;
            buton[0].style.backgroundColor = 'red';
            setTimeout(function(){buton[0].style.backgroundColor = 'white'},1400);
            console.log(errorMessage);
        });
    });

    // logout
    const logout =  document.getElementById('logoutBtn');
    logout.addEventListener('click' , function() {
        auth.signOut();
    });
});  