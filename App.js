import axios from "axios";
import { Camera, CameraType } from "expo-camera/legacy";
import { useState, useRef } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { serverURL } from "./DevConfig";

export default function App() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null); // Use useRef to hold a reference to the camera

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  async function takePicture() {
    if (cameraRef.current) {
      const options = { quality: 1, base64: false }; // Disable base64
      const newPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(newPhoto);
      sendPhotoToBackend(newPhoto.uri); // Send the image URI to the backend
    }
  }

  async function sendPhotoToBackend(imageUri) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: "face.png", // You can change the filename
        type: "image/png", // Set the correct MIME type
      });

      const response = await axios.post(`${serverURL}/api/v1/upload/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error uploading image:", error.response?.data || error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        ref={cameraRef} // Set the ref to the camera
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Take Picture</Text>
          </TouchableOpacity>
        </View>
      </Camera>
      {photo && (
        <Image
          source={{ uri: photo.uri }}
          style={{ width: 100, height: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
