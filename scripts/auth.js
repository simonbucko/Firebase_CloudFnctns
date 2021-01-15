//add admin cloud function
const adminForm = document.querySelector('.admin-actions');
const adminRoleSuccess = document.querySelector('#adminRoleSuccess');
const adminRoleFail = document.querySelector('#adminRoleFail');
adminForm.addEventListener('submit', e => {
    e.preventDefault();
    const adminEmail = document.querySelector('#admin-email').value;
    const addAdminRole = functions.httpsCallable('addAdminRole');
    addAdminRole({ email: adminEmail })
        .then(result => {
            adminRoleSuccess.querySelector('h4').textContent = result.data.message;
            M.Modal.getInstance(adminRoleSuccess).open();
        })
    adminForm.reset();
})

//DOM variables
const logInForm = document.querySelector('#login-form');
const signUpForm = document.querySelector('#signup-form');
const logOut = document.querySelector('#logout');
const createForm = document.querySelector('#create-form');


//listen for auth state changes
auth.onAuthStateChanged(user => {
    if (user) {
        user.getIdTokenResult()
            .then(idTokenResult => {
                user.admin = idTokenResult.claims.admin;
                setupUi(user);
            })
        db.collection('guides').onSnapshot(snapshot => {
            setUpGuides(snapshot.docs);
        }, err => { })
    } else {
        setupUi();
        setUpGuides([]);
    }
})


//create new guide
createForm.addEventListener('submit', e => {
    e.preventDefault();

    db.collection('guides').add({
        title: createForm['title'].value,
        content: createForm['content'].value
    }).then(() => {
        //close the modal and reset form
        const modal = document.querySelector('#modal-create');
        M.Modal.getInstance(modal).close();
        createForm.reset();
    }).catch(err => {
        console.log(err.message);
    })
})


//signup
signUpForm.addEventListener('submit', e => {
    e.preventDefault();

    //get user info
    const email = signUpForm['signup-email'].value;
    const password = signUpForm['signup-password'].value;

    //signup user
    auth.createUserWithEmailAndPassword(email, password)
        .then(cred => {
            return db.collection('users').doc(cred.user.uid).set({
                bio: signUpForm['signup-bio'].value
            })
        }).then(() => {
            const modal = document.querySelector('#modal-signup');
            M.Modal.getInstance(modal).close();
            signUpForm.reset();
            signUpForm.querySelector('.error').innerHTML = '';

        }).catch(err => {
            signUpForm.querySelector('.error').innerHTML = err.message;
        });
})


//logout
logOut.addEventListener('click', e => {
    e.preventDefault();
    auth.signOut();
})

//login
logInForm.addEventListener('submit', e => {
    e.preventDefault();
    //get user info

    const email = logInForm['login-email'].value;
    const password = logInForm['login-password'].value;

    auth.signInWithEmailAndPassword(email, password)
        .then(cred => {
            const modal = document.querySelector('#modal-login');
            M.Modal.getInstance(modal).close();
            logInForm.reset();
            logInForm.querySelector('.error').innerHTML = '';

        }).catch(err => {
            logInForm.querySelector('.error').innerHTML = err.message;
        })

})

