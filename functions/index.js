const functions = require("firebase-functions");
const admin = require('firebase-admin'); //for using all services
admin.initializeApp();

exports.addAdminRole = functions.https.onCall((data, context) => {
    //check user is admin
    if (context.auth.token.admin !== true) {
        return { err: 'only admins can add other admins' }
    }
    // get user and add admin custom claim
    return admin.auth().getUserByEmail(data.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            admin: true
        })
    }).then(() => {
        return {
            message: `Success! ${data.email} has been made an admin.`
        }
    }).catch(err => {
        return err;
    });
});

//cloud functions project

//http request 1
// exports.randomNumber = functions.https.onRequest((req, res) => {
//     const number = Math.round(Math.random() * 100);
//     res.send(number.toString());
// })

//http callable function, data are sent by application, context has additional information of user
// exports.sayHello = functions.https.onCall((data, context) => {
//     return `Hello ninjas`;
// })

//firestore trigger for tracking activity

exports.logActivities = functions.firestore.document('/{collection}/{id}').onCreate((snap, context) => {
    const collection = context.params.collection;//has to match with name above
    const id = context.params.id;
    const data = snap.data();

    const activities = admin.firestore().collection('activities');

    if (collection === 'requests') {
        return activities.add({ text: "New idea was added" });
    }

    if (collection === 'users') {
        return activities.add({ text: "New user signed up" });
    }

    return null;
})

//auth trigger(new user sign up)
exports.newUserSignup = functions.auth.user().onCreate(user => {
    return admin.firestore().collection('users_cloud').doc(user.uid).set({
        email: user.email,
        upvotedOn: [],
    })
})

//user deleted
exports.userDeleted = functions.auth.user().onDelete(user => {
    const doc = admin.firestore().collection('users_clod').doc(user.uid);
    return doc.delete();
})

//http request (adding a request)
exports.addRequest = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated user can add request');
    }
    if (data.text.length > 30) {
        throw new functions.https.HttpsError('invalid-argument', 'Request must be no more than 30 characters long');
    }
    return admin.firestore().collection('requests').add({
        text: data.text,
        upvotes: 0
    })
})

//upvote callable function
exports.upvote = functions.https.onCall(async (data, context) => {
    //check auth state
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated user can vote');
    }
    //get ref for user doc
    const user = admin.firestore().collection('users_cloud').doc(context.auth.uid);
    const request = admin.firestore().collection('requests').doc(data.id);
    const doc = await user.get();
    //check user hasnt upvoted yet
    if (doc.data().upvotedOn.includes(data.id)) {
        throw new functions.https.HttpsError('failed-precondition', 'You can only upvotes something once');
    }
    //update user array
    await user.update({
        upvotedOn: [...doc.data().upvotedOn, data.id]
    })

    //update votes on request
    return request.update({
        upvotes: admin.firestore.FieldValue.increment(1)
    })

})





