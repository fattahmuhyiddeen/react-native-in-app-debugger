import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  Alert,
} from "react-native";
import Text from "../Text";

const removeId = (key, value) => (key === "id" ? undefined : value);
export default (p) => {
  const [data, setData] = useState("");
  const reset = () => setData(JSON.stringify(p.mockDetails, removeId, 4));
  useEffect(reset, [p.mockDetails]);
  const [canReset, setCanReset] = useState(false);

  useEffect(() => {
    try {
      setCanReset(
        JSON.stringify(p.mockDetails, removeId) !=
          JSON.stringify(JSON.parse(data))
      );
    } catch (e) {
      setCanReset(true);
    }
  }, [p.mockDetails, data]);
  if (!p.mockDetails) return null;
  const isnew = !p.mocks.some((m) => m.id === p.mockDetails.id);
  return (
    <View
      style={{
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        position: "absolute",
        zIndex: 1000,
        backgroundColor: "grey",
        width: "100%",
        height: "100%",
        paddingTop: 50,
      }}
    >
      {!isnew && <Text style={{ opacity: 0.3 }}>{p.mockDetails.id}</Text>}
      <TextInput
        onChangeText={setData}
        value={data}
        style={{ height: "40%" }}
        multiline
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
        }}
      >
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => p.setMockDetails(null)}
        >
          <Text style={{ fontSize: 15 }}>Cancel</Text>
        </TouchableOpacity>
        {!isnew && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              p.deleteMock(p.mockDetails.id);
              p.setMockDetails(null);
            }}
          >
            <Text style={{ fontSize: 15 }}>Delete</Text>
          </TouchableOpacity>
        )}
        {canReset && (
          <TouchableOpacity style={styles.actionButton} onPress={reset}>
            <Text style={{ fontSize: 15 }}>Reset</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            try {
              const newData = JSON.parse(data);
              if (!newData.request) {
                Alert.alert("Error", "Invalid JSON");
                return;
              }
              p.setMocks((v) => {
                const index = v.findIndex((m) => m.id === p.mockDetails.id);
                p.setMockDetails(null);
                if (!~index)
                  return [
                    ...v,
                    {
                      ...newData,
                      id: Date.now().toString(36) + Math.random().toString(36),
                    },
                  ];
                v[index] = { ...newData, id: p.mockDetails.id };
                return v;
              });
            } catch (e) {
              Alert.alert("Error", "Invalid JSON");
            }
          }}
        >
          <Text style={{ fontSize: 15 }}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});
