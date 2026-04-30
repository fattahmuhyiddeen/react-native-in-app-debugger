import React, { useState } from "react";
import { ScrollView, StyleSheet, Pressable, View, TouchableOpacity, Alert } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard"
import Text from "../Text";
import Highlight from "../Highlight";
import { toCurl } from "./toCurl";

export const MAX_URL_LENGTH = 100;

export default ({ item, filter, wrap, setWrap }) => {
  const tabs = [
    "Response Body",
    item.request.data ? "Request Body" : '',
    "Request Header",
    "Curl",
  ];
  const [tab, setTab] = useState(tabs[0]);
  const hasResponse = item.response;
  const Tab = ({ value }) => {
    if (!value) return null;
    const isSelected = value === tab;
    return (
      <Pressable
        onPress={() => setTab(value)}
        style={[
          styles.selectionTab,
          { backgroundColor: isSelected ? "white" : undefined },
        ]}
      >
        <Text
          style={{
            color: isSelected ? "#000" : "#ffffff88",
            textAlign: "center",
            fontSize: 16
          }}
        >
          {value}
        </Text>
      </Pressable>
    );
  };

  const Comp = wrap ? View : ScrollView;

  const generateCurl = () => toCurl({
    method: item.request.method,
    url: item.request.url,
    headers: item.request.headers,
    body: item.request.data,
  })

  return (
    <View style={styles.container}>
      {item.request.url.length > MAX_URL_LENGTH && (
        <Text style={{ color: "#ffffff99", paddingVertical: 20 }}>
          <Highlight text={item.request.url} filter={filter} />
        </Text>
      )}
      <View style={{ flexDirection: "row" }}>
        {tabs.map((t) => <Tab key={t} value={t} />)}
      </View>
      <View style={styles.containerForMiniActionButton}>
        {tab === tabs[3] && <TouchableOpacity style={[styles.button, { backgroundColor: 'white' }]} onPress={() => {
          Clipboard.setString(generateCurl());
          Alert.alert("Copied","curl command");
        }}><Text>Copy</Text></TouchableOpacity>}
        <Pressable
          onPress={() => setWrap((v) => !v)}
          style={[styles.button, wrap && { backgroundColor: 'white' }]}
        >
          <Text style={{ color: wrap ? "black" : "white", fontSize: 14 }}>
            Wrap
          </Text>
        </Pressable>
      </View>
      <Comp horizontal>
        <Text style={{ color: "white" }}>
          {tab === tabs[3] ? generateCurl() :
            <Highlight
              text={JSON.stringify(tab === tabs[0] && hasResponse ? item.response.data :
                tab === tabs[1] ? item.request.data : tab === tabs[2] ? item.request.headers : '', undefined, 4)}
              filter={filter}
            />
          }
        </Text>

      </Comp>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    backgroundColor: "#171717",
    paddingTop: 10,
    paddingBottom: 40,
  },
  button: {
    borderWidth: 2,
    borderColor: "white",
    padding: 5,
    borderRadius: 10
  },
  containerForMiniActionButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  selectionTab: {
    borderBottomColor: "white",
    borderBottomWidth: 2,
    flex: 1,
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
  },
});
