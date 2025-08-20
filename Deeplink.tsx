import React, { useEffect } from "react";
import {
  Linking,
  TextInput,
  Pressable,
  View,
  FlatList,
} from "react-native";
import X from "./X";
import Text from "./Text";

let LocalStorage;
try {
  LocalStorage =
    require("@react-native-async-storage/async-storage/src").default;
} catch (error) {
  // console.error("Error importing LocalStorage:", error);
}

export default ({ deeplinkPrefix = 'mym1-sunshine://', onClose }) => {
  const [text, setText] = React.useState("");
  const [history, setHistory] = React.useState([]);

  const go = (t) => {
    const newHistory = [t, ...history.filter((h) => h !== t)];
    // setHistory(newHistory);
    setTimeout(() => {
      LocalStorage?.setItem(
        "in-app-debugger-deeplink-list",
        JSON.stringify(newHistory)
      );
      Linking.openURL(deeplinkPrefix + t);
    }, 500);
    onClose();
  };

  const remove = (t) => {
    const newHistory = history.filter((h) => h !== t);
    setHistory(newHistory);
    LocalStorage?.setItem(
      "in-app-debugger-deeplink-list",
      JSON.stringify(newHistory)
    );
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
        {!!text && <Pressable
          style={{ padding: 7, borderRadius: 4, backgroundColor: "white" }}
          onPress={() => go(text)}
        >
          <Text style={{ color: "black", fontSize: 9 }}>Go</Text>
        </Pressable>}
      </View>
      <FlatList
        data={history}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              padding: 10,
              justifyContent: "flex-end",
            }}
          >
            <Pressable onPress={() => go(item)}>
              <Text style={{ color: "white", textAlign: "right" }}>{item}</Text>
            </Pressable>
            <X
              style={{ marginRight: 5 }}
              size={15}
              onPress={() => remove(item)}
            />
          </View>
        )}
      />
    </View>
  );
};
