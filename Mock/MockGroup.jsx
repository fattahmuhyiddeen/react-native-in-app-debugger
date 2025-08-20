import React, { useState } from "react";
import {
  StyleSheet,
  Pressable,
  View,
} from "react-native";
import Text from "../Text";
import Highlight from "../Highlight";

export const MAX_URL_LENGTH = 100;

export default (p) => {
  const [expand, setExpand] = useState(false);
  return (
    <View>
      <Pressable onPress={() => setExpand((v) => !v)}>
        <View style={styles.container}>
          <Text
            selectable
            style={{ color: "white", marginVertical: 10, flex: 1 }}
          >
            <Highlight
              text={
                p.item.title.slice(0, MAX_URL_LENGTH) +
                (p.item.title.length > MAX_URL_LENGTH ? "....." : "")
              }
              filter={p.filter}
            />
          </Text>
          <View
            style={{ padding: 5, backgroundColor: "#777", borderRadius: 8 }}
          >
            <Text>{p.item.data.length}</Text>
          </View>
        </View>
      </Pressable>
      {expand &&
        p.item.data.map((d) => (
          <View style={styles.containerRow} key={d.id}>
            <Pressable
              style={styles.radiobox}
              onPress={() => {
                p.setMocks((v) =>
                  v.map((m) => {
                    if (m.id === d.id) return { ...m, active: true };
                    if (
                      m.request.method === d.request.method &&
                      m.request.url === d.request.url
                    )
                      return { ...m, active: false };
                    return m;
                  })
                );
              }}
            >
              {d.active && <View style={styles.checked} />}
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#555", fontSize: 8 }}>{d.id}</Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "grey" }}>{d.request.datetime}</Text>
              </View>
            </View>
            <Pressable
              style={styles.actionButton}
              onPress={() => p.deleteMock(d.id)}
            >
              <Text style={{ color: "black", fontSize: 10 }}>delete</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => p.setMockDetails(d)}
            >
              <Text style={{ color: "black", fontSize: 10 }}>edit</Text>
            </Pressable>
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
    flex: 1,
  },
  actionButton: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  radiobox: {
    backgroundColor: "black",
    width: 20,
    height: 20,
    borderRadius: 25,
    borderColor: "white",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  checked: {
    backgroundColor: "white",
    borderRadius: 50,
    height: "100%",
    width: "100%",
  },
  containerRow: {
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
