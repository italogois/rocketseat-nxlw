import React, { useState, useEffect } from "react";
import Constants from "expo-constants";
import { Feather as Icon } from "@expo/vector-icons";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SvgUri } from "react-native-svg";
import MapView, { Marker } from "react-native-maps";
import api from "../../services/api";
import * as Location from "expo-location";

interface Material {
  readonly id: number;
  readonly title: string;
  readonly image_url: string;
}

interface RouterParams {
  cidade: string;
  uf: string;
}

interface CollectionPoints {
  id: string;
  name: string;
  number: string;
  image: string;
  image_url: string;
  latitude: number;
  longitude: number;
}

const CollectionPoints = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const routerParams = route.params as RouterParams;

  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);

  const [initialPosition, setinitIalPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [collectionPoints, setCollectionPoints] = useState<CollectionPoints[]>(
    []
  );

  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("opa", "precisamos de sua permissão");
        return;
      }

      const location = await Location.getCurrentPositionAsync();

      const { latitude, longitude } = location.coords;

      setinitIalPosition([latitude, longitude]);
    }

    loadPosition();
  }, []);

  useEffect(() => {
    api.get("materials").then(({ data }) => {
      setMaterials(data);
    });
  }, []);

  useEffect(() => {
    api
      .get("collection_points", {
        params: {
          cidade: routerParams.cidade,
          uf: routerParams.uf,
          materials: selectedMaterials,
        },
      })
      .then(({ data }) => {
        setCollectionPoints(data);
        console.log(data);
      });
  }, [selectedMaterials]);

  function handleNavigationBack() {
    navigation.goBack();
  }

  function handleNavigationDetails(id: string) {
    navigation.navigate("ColletionPointsDetails", { point_id: id });
  }

  function handleSelectMaterial(id: number) {
    const alreadySelected = selectedMaterials.findIndex(
      (material) => material === id
    );

    if (alreadySelected >= 0) {
      const fieltredItems = selectedMaterials.filter(
        (material) => material !== id
      );

      setSelectedMaterials(fieltredItems);
    } else {
      setSelectedMaterials([...selectedMaterials, id]);
    }
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity>
          <Icon
            name="arrow-left"
            size={20}
            color="#34cb79"
            onPress={handleNavigationBack}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Bem Vindo</Text>
        <Text style={styles.description}>Encontre o ponto de coleta</Text>

        <View style={styles.mapContainer}>
          {initialPosition[0] !== 0 && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014,
              }}
            >
              {collectionPoints.map((point) => (
                <Marker
                  key={String(point.id)}
                  style={styles.mapMarker}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                  onPress={() => handleNavigationDetails(point.id)}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image
                      style={styles.mapMarkerImage}
                      source={{
                        uri: point.image_url,
                      }}
                    />
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {materials.map((material) => (
            <TouchableOpacity
              key={String(material.id)}
              style={[
                styles.item,
                selectedMaterials.includes(material.id)
                  ? styles.selectedItem
                  : {},
              ]}
              onPress={() => handleSelectMaterial(material.id)}
            >
              <SvgUri
                uri="https://image.flaticon.com/icons/svg/2929/2929322.svg"
                width={42}
                height={42}
              />
              <Text style={styles.itemTitle}>{material.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

export default CollectionPoints;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: "Ubuntu_700Bold",
    marginTop: 24,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 4,
    fontFamily: "Roboto_400Regular",
  },

  mapContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 16,
  },

  map: {
    width: "100%",
    height: "100%",
  },

  mapMarker: {
    width: 90,
    height: 80,
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: "#34CB79",
    flexDirection: "column",
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: "cover",
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: "Roboto_400Regular",
    color: "#FFF",
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#eee",
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "space-between",

    textAlign: "center",
  },

  selectedItem: {
    borderColor: "#34CB79",
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: "Roboto_400Regular",
    textAlign: "center",
    fontSize: 13,
  },
});
