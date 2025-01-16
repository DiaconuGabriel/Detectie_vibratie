// MANAGE LOGIN/LOGOUT UI
const setupUI = (user) => {
  const wrapper = document.getElementById('wrapper-cl');
  const content = document.getElementById('content');
    if (user) {
        //toggle UI elements
        console.log('User is logged in.');
        wrapper.style.display = 'none';
        content.style.display = 'block';
    
        // get user UID to get data from database
        var uid = user.uid;
        console.log(uid);
  
    // IF USER IS LOGGED OUT
    } else {
        // toggle UI elements
        console.log('User is not logged in.');
        wrapper.style.display = 'block';
        content.style.display = 'none';
    }
}