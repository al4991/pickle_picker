import React, { Component } from "react";
import firebase from "./../config/firebase";
import FileUploader from "react-firebase-file-uploader";
import LabelButton from "./LabelButton";
import axios from "axios";
import { yelpApiKey } from "../config/constants";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: "",
      labels: [],
      docId: "",
      selectedLabel: "",
      yelpLocations: [],
      notSearching: true,
    };
    this.handleUploadSuccess = this.handleUploadSuccess.bind(this);
    this.selectLabel = this.selectLabel.bind(this);
    this.search = this.search.bind(this);
    this.renderUploadButton = this.renderUploadButton.bind(this);
    this.renderYelpButton = this.renderYelpButton.bind(this);
    this.renderLabels = this.renderLabels.bind(this);
    this.renderUploadedImage = this.renderUploadedImage.bind(this);
    this.renderYelpLocations = this.renderYelpLocations.bind(this);
    this.renderSearching = this.renderSearching.bind(this);
  }

  async handleUploadSuccess(filename) {
    try {
      let { bucket, fullPath } = await firebase
        .storage()
        .ref("images")
        .child(filename)
        .getMetadata();
      console.log("bucket", bucket);
      console.log("fullPath", fullPath);
      let downloadURL = await firebase
        .storage()
        .ref("images")
        .child(filename)
        .getDownloadURL();
      console.log("downloadURL", downloadURL);
      const docRef = await firebase.firestore().collection("pictures").add({
        url: downloadURL,
        bucket,
        fullPath,
      });
      firebase
        .firestore()
        .collection("pictures")
        .doc(docRef.id)
        .onSnapshot((docSnapshot) => {
          console.log("YOYOYOYOYOYOY", docSnapshot.data());
          if (docSnapshot.data().labels) {
            const cleanLabels = docSnapshot
              .data()
              .labels.filter(
                (elem) =>
                  elem !== "Food" && elem !== "Dish" && elem !== "Ingredient"
              );
            this.setState({
              ...this.state,
              labels: [...cleanLabels],
            });
          }
        });

      this.setState({
        ...this.state,
        image: downloadURL,
        docId: docRef.id,
      });
    } catch (err) {
      console.log(err);
    }
  }

  selectLabel(i) {
    const selected = this.state.labels[i];
    this.setState({
      ...this.state,
      labels: [],
      selectedLabel: selected,
    });
  }

  search() {
    this.setState({
      ...this.state,
      notSearching: false,
    });
    axios
      .get(
        `${"https://cors-anywhere.herokuapp.com/"}https://api.yelp.com/v3/businesses/search?location=${"New York City"}&term=${
          this.state.selectedLabel
        }`,
        {
          headers: {
            Authorization: `Bearer ${yelpApiKey}`,
          },
        }
      )
      .then((res) => {
        console.log(res);
        this.setState({
          ...this.state,
          yelpLocations: [...res.data.businesses],
          notSearching: true,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  renderUploadButton() {
    if (this.state.docId === "") {
      return (
        <div>
          <h1> wut? where? </h1>
          <label
            style={{
              backgroundColor: "steelblue",
              color: "white",
              padding: 10,
              borderRadius: 4,
              cursor: "pointer",
              margin: 50,
            }}
          >
            Upload an image to start!
            <FileUploader
              hidden
              accept='image/*'
              storageRef={firebase.storage().ref("images")}
              onUploadStart={this.handleUploadStart}
              onUploadError={this.handleUploadError}
              onUploadSuccess={this.handleUploadSuccess}
              onProgress={this.handleProgress}
            />
          </label>
        </div>
      );
    }
  }

  renderYelpButton() {
    if (
      this.state.notSearching &&
      this.state.selectedLabel !== "" &&
      this.state.yelpLocations.length === 0
    ) {
      return (
        <div>
          <h2>Search for places with {this.state.selectedLabel}? </h2>
          <LabelButton labelName={"Search!"} onClick={this.search} />
        </div>
      );
    }
  }

  renderYelpLocations() {
    if (this.state.yelpLocations.length > 0) {
      console.log(this.state.yelpLocations);
      let cleanArray = [];
      if (this.state.yelpLocations.length > 5) {
        for (let i = 0; i < 5; i++) {
          let location = this.state.yelpLocations[i].location;
          cleanArray.push({
            name: this.state.yelpLocations[i].name,
            address1: location.address1,
            city: location.city,
            state: location.state,
            zipCode: location.zip_code,
          });
        }
      } else {
        for (let i = 0; i < this.state.yelpLocations.length; i++) {
          let location = this.state.yelpLocations[i].location;
          cleanArray.push({
            name: this.state.yelpLocations[i].name,
            address1: location.address1,
            city: location.city,
            state: location.state,
            zipCode: location.zip_code,
          });
        }
      }
      return (
        <div>
          <h2> I found these places! </h2>
          {cleanArray.map((elem) => (
            <div>
              <h4>{elem.name}</h4>
              <p>{elem.address1}</p>
              <p>
                {elem.city}, {elem.state} {elem.zipCode}
              </p>
            </div>
          ))}
        </div>
      );
    }
  }

  renderLabels() {
    if (this.state.labels.length > 0) {
      return (
        <div>
          <h2>I think it's one of these things</h2>
          {this.state.labels &&
            this.state.labels.map((elem, i) => (
              <LabelButton
                labelName={elem}
                onClick={() => this.selectLabel(i)}
              />
            ))}
        </div>
      );
    }
  }

  renderUploadedImage() {
    if (this.state.image !== "") {
      return <img style={styles.uploadedImage} src={this.state.image} alt='' />;
    }
  }

  renderSearching() {
    if (!this.state.notSearching) {
      return <h2>Searching . . . </h2>;
    }
  }

  render() {
    return (
      <div style={styles.container}>
        {this.renderUploadedImage()}
        {this.renderUploadButton()}
        {this.renderLabels()}
        {this.renderSearching()}
        {this.renderYelpButton()}
        {this.renderYelpLocations()}
      </div>
    );
  }
}
export default Home;

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  uploadedImage: {
    margin: "auto",
    maxWidth: "100%",
    maxHeight: "100vh",
  },
};
