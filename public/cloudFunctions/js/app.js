const requestModal = document.querySelector('.new-request');
const requestLink = document.querySelector('.add-request');
const requestForm = document.querySelector('.new-request form');
const notification = document.querySelector('.notification');


requestLink.addEventListener('click', e => {
    requestModal.classList.add('open');
})

requestModal.addEventListener('click', e => {
    if (e.target.classList.contains('new-request')) {
        requestModal.classList.remove('open');
    }
})

//add new Idea
requestForm.addEventListener('submit', e => {
    e.preventDefault();
    loader.style.display = 'flex';
    const addRequest = firebase.functions().httpsCallable('addRequest');
    addRequest({
        text: requestForm.request.value
    })
        .then(() => {
            requestForm.reset();
            requestModal.classList.remove('open');
            requestForm.querySelector('.error').textContent = '';
            loader.style.display = 'none';
        })
        .catch(err => {
            requestForm.querySelector('.error').textContent = err.message;
            loader.style.display = 'none';
        })
})

//show notification
const showNotification = (message) => {
    notification.textContent = message;
    notification.classList.add('active');
    setTimeout(() => {
        notification.classList.remove('active');
        notification.textContent = '';
    }, 4000);
}