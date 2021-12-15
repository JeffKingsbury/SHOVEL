import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, onValue, child, get } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import * as bcrypt from "bcrypt"
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
import { async } from "@firebase/util";
const require = createRequire(
    import.meta.url); // construct the require method


// var admin = require("firebase-admin");
// var serviceAccount = require("./SAK.json");
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: 'https://shovelgame-75d4f.firebaseio.com'

// });
const version = process.env.npm_package_version || "- TEST BUILD";
const port = process.env.PORT || 8080;
const app = express();
const __dirname = path.resolve();

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCFwtNDR1g2mDN-nD1bHc3KWiJi9mhU2bc",
    authDomain: "shovelgame-75d4f.firebaseapp.com",
    projectId: "shovelgame-75d4f",
    storageBucket: "shovelgame-75d4f.appspot.com",
    messagingSenderId: "21995527460",
    appId: "1:21995527460:web:1afedf813d0af3c78be7b1",
    measurementId: "G-T793L9RF5M"
};

const firebase = initializeApp(firebaseConfig)
const auth = getAuth();
const database = getDatabase();
console.log(__dirname)

app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/game", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/game.html"));
});

app.get("/", (req, res) => {
    res.cookie("version", version);
    res.send()
});

app.listen(port, () => {
    console.log(`Now shoveling on port ${port}`);
});

app.post('/createUser', async(req, res) => {
    let email = req.body.username;
    let password = req.body.password;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user.uid;
            res.cookie("version", version);
            res.cookie("uid", user);
            res.send('success')
        })
        .catch((error) => {
            const errorCode = error.code;
            res.send(errorCode);
        });
})

app.post('/loginUser', (req, res) => {
    let email = req.body.username;
    let password = req.body.password;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user.uid;
            res.cookie("version", version);
            res.cookie("uid", user);

            const dbRef = ref(getDatabase());
            get(child(dbRef, `users/${user}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    res.json({
                        auth: true,
                        playerData: snapshot.val(),
                        newAcc: false
                    })
                    return
                } else {
                    console.log("No data available");
                    res.json({ auth: true, playerData: null, newAcc: true })
                }
            }).catch((error) => {
                console.error(error);
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            res.send(errorCode);
        });
})


app.post('/updateUser', (req, res) => {
    let userId = req.body.uid
    const db = getDatabase();
    set(ref(db, 'users/' + userId),
        req.body
    );
    res.send()
})