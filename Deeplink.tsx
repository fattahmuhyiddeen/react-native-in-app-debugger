import React, { useEffect } from "react";
import { Linking, Text, TextInput, TouchableOpacity, View } from "react-native";

let LocalStorage;
try {
  LocalStorage =
    require("@react-native-async-storage/async-storage/src").default;
} catch (error) {
  // console.error("Error importing LocalStorage:", error);
}

export default ({ deeplinkPrefix, onClose }) => {
  const [text, setText] = React.useState("");
  const [history, setHistory] = React.useState([]);

  const go = (t) => {
    const newHistory = [t, ...history.filter((h) => h !== t)].slice(0, 3);
    setHistory(newHistory);
    LocalStorage?.setItem(
      "in-app-debugger-deeplink-list",
      JSON.stringify(newHistory)
    );
    onClose();
    Linking.openURL(deeplinkPrefix + t);
  };

  useEffect(() => {
    LocalStorage?.getItem("in-app-debugger-deeplink-list").then((d) => {
      if (d) {
        setHistory(JSON.parse(d));
      }
    });
  }, []);
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", margin: 10 }}>
        <Text style={{ color: "white" }}>{deeplinkPrefix}</Text>
        <TextInput
          value={text}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          onChangeText={setText}
          style={{
            flex: 1,
            backgroundColor: "#555",
            marginRight: 10,
            padding: 3,
            borderRadius: 3,
          }}
        />
        <TouchableOpacity
          style={{ padding: 7, borderRadius: 4, backgroundColor: "white" }}
          onPress={() => go(text)}
        >
          <Text style={{ color: "black", fontSize: 9 }}>Go</Text>
        </TouchableOpacity>
      </View>
      {history.map((h) => (
        <TouchableOpacity style={{ margin: 6 }} onPress={() => go(h)}>
          <Text style={{ color: "grey", textAlign: "right" }}>{h}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
