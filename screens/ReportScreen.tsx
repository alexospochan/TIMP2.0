import React, { useState } from "react";
import { View, TextInput, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

const ReportScreen = () => {
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!result.canceled) {
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `photos/${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      setPhoto(url);
    }
  };

  return (
    <View>
      <TextInput placeholder="Describe el problema" onChangeText={setDescription} />
      <Button title="Tomar Foto" onPress={handleTakePhoto} />
      {photo && <Image source={{ uri: photo }} style={{ width: 200, height: 200 }} />}
    </View>
  );
};

export default ReportScreen;