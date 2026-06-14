import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { predictImage } from "../../services/api";

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<"fake" | "real" | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [imageRatio, setImageRatio] = useState(1);
  const [showHeatmapModal, setShowHeatmapModal] = useState(false);
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Quyền truy cập bị từ chối",
          "Vui lòng cho phép truy cập vào thư viện ảnh",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        Image.getSize(uri, (width, height) => {
          setImageRatio(width / height);
        });
        setSelectedUri(uri);
        setImage(uri);
        setPrediction(null);
        setHeatmapUrl(null);
        setConfidence(0);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };
  const analyzeImage = async () => {
    if (!selectedUri) {
      Alert.alert("Thông báo", "Vui lòng chọn ảnh trước");
      return;
    }
    try {
      setLoading(true);
      const data = await predictImage(selectedUri);
      console.log(data);
      setPrediction(data.prediction);
      setConfidence(data.confidence);
      setHeatmapUrl(`data:image/jpeg;base64,${data.heatmap}`);
    } catch (error) {
      console.log(error);

      Alert.alert("Lỗi", "Không thể phân tích ảnh");
    } finally {
      setLoading(false);
    }
  };
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Vui lòng cấp quyền Camera");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      setSelectedUri(uri);
    }
  };
  const showImageOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Hủy", "Chụp ảnh", "Chọn từ thư viện"],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) takePhoto();

          if (index === 2) pickImage();
        },
      );
    } else {
      Alert.alert("Chọn ảnh", "", [
        {
          text: "Chụp ảnh",
          onPress: takePhoto,
        },
        {
          text: "Thư viện",
          onPress: pickImage,
        },
        {
          text: "Hủy",
          style: "cancel",
        },
      ]);
    }
  };
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
      }}
    >
      <View style={styles.uploadContainer}>
        <TouchableOpacity
          style={[
            styles.previewBox,

            !image
              ? {
                  height: 240,
                }
              : {
                  aspectRatio: imageRatio,
                },
          ]}
          activeOpacity={0.8}
          onPress={() => {
            if (loading) {
              Alert.alert(
                "Thông báo",
                "Vui lòng đợi quá trình phân tích hoàn tất",
              );
              return;
            }
            showImageOptions();
          }}
        >
          {image ? (
            <Image
              source={{
                uri: image,
              }}
              style={{
                width: "100%",
                aspectRatio: imageRatio,
              }}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.emptyUploadContainer}>
              <View style={styles.uploadIconWrapper}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={34}
                  color="#FF7A1A"
                />
              </View>
              <Text style={styles.uploadText}>Tải ảnh</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.analyzeButton}
        disabled={loading}
        onPress={analyzeImage}
      >
        <Ionicons name="search" size={20} color="white" />
        <Text style={styles.analyzeButtonText}>Phân tích ảnh</Text>
      </TouchableOpacity>
      {loading && (
        <Text
          style={{
            textAlign: "center",
            marginTop: 20,
          }}
        >
          Đang phân tích ảnh...
        </Text>
      )}
      {prediction && (
        <View style={styles.resultContainer}>
          <Text
            style={[
              styles.resultText,
              {
                color: prediction === "real" ? "#16A34A" : "#DC2626",
              },
            ]}
          >
            {prediction === "real"
              ? "Đây là ảnh thật"
              : "Đây là ảnh do AI tạo ra"}
          </Text>

          <Text style={styles.confidenceLabel}>Độ tin cậy mô hình</Text>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {confidence.toFixed(1)}%
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${confidence}%`,
                  backgroundColor:
                    prediction === "real" ? "#16A34A" : "#DC2626",
                },
              ]}
            />
          </View>
        </View>
      )}
      {heatmapUrl && (
        <View style={styles.heatmapContainer}>
          <Text style={styles.sectionTitle}>
            Vùng ảnh được mô hình tập trung
          </Text>
          <TouchableOpacity onPress={() => setShowHeatmapModal(true)}>
            <Image
              source={{
                uri: heatmapUrl,
              }}
              style={{
                width: "100%",
                aspectRatio: imageRatio,
                borderRadius: 20,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Modal
            visible={showHeatmapModal}
            transparent={true}
            animationType="fade"
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.95)",
                justifyContent: "center",
                alignItems: "center",
              }}
              activeOpacity={1}
              onPress={() => setShowHeatmapModal(false)}
            >
              <Image
                source={{
                  uri: heatmapUrl ?? "",
                }}
                style={{
                  width: "95%",
                  height: "80%",
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Modal>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  uploadContainer: {
    alignItems: "center",
  },
  previewBox: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#FF7A1A",
    backgroundColor: "#efefef",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  emptyUploadContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  uploadIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: "#FFF3EA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  uploadText: {
    color: "#999",
    fontSize: 15,
    fontWeight: "600",
  },
  resultContainer: {
    marginTop: 24,
    width: "100%",
    backgroundColor: "#efefef",
    borderRadius: 20,
    padding: 20,
  },

  resultText: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  confidenceLabel: {
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
    color: "#666",
    fontSize: 15,
  },
  progressTrack: {
    height: 12,
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  heatmapContainer: {
    marginTop: 24,
    backgroundColor: "#efefef",
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  analyzeButton: {
    marginTop: 20,
    backgroundColor: "#FF7A1A",
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  analyzeButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
});
