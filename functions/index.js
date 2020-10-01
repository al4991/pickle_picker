const functions = require("firebase-functions");
const admin = require("firebase-admin");
const vision = require("@google-cloud/vision");
const client = new vision.ImageAnnotatorClient();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://beeplebopple.firebaseio.com",
});
const db = admin.firestore();
const imageRef = admin.database().ref("images");

/*
Reference code for this found in this article: 
https://medium.com/@srobtweets/exploring-the-cloud-vision-api-1af9bcf080b8
*/

exports.callVision = functions.firestore
  .document("pictures/{document}")
  .onCreate(async (snap, context) => {
    console.log("SNAP", snap);
    console.log("CONTEXT", context);

    const data = snap.data();
    console.log("DATA IN IS", data);

    const gcsUrl = `gs://${data.bucket}/${data.fullPath}`;
    const [result] = await client.labelDetection(gcsUrl);
    const labels = result.labelAnnotations.map((elem) => elem.description);

    await db
      .collection("pictures")
      .doc(context.params.document)
      .update({ labels });

    console.log("Labels:");
    labels.forEach((label) => console.log(label));
  });
