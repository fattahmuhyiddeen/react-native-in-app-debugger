import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableHighlight,
} from "react-native";
import Text from "./Text";
import Highlight from "./Highlight";
import packageJson from "../../package.json";
import realDeps from "./parentDependencies.js";

const libs = Object.entries(packageJson.dependencies).reduce(
  (arr, [name, version]) => [...arr, { name, version }],
  []
);

export default () => {
  const [filter, setFilter] = useState("");

  return (
    <>
      <TextInput
        value={filter}
        placeholder="Filter..."
        placeholderTextColor="grey"
        style={styles.textInput}
        onChangeText={(t) => setFilter(t.toLowerCase())}
        clearButtonMode="always"
      />
      <FlatList
        contentContainerStyle={{ padding: 5, paddingBottom: 20 }}
        data={libs.filter(
          (l) =>
            !filter ||
            l.name.toLowerCase().includes(filter) ||
            l.version.includes(filter) ||
            realDeps[l.name].includes(filter)
        )}
        showsVerticalScrollIndicator
        keyExtractor={(i) => i.name}
        renderItem={({ item }) => {
          const showAlt =
            !!realDeps[item.name] &&
            item.version.replace("^", "") !== realDeps[item.name];
          return (
            <TouchableHighlight underlayColor="#ffffff44" onPress={() => null}>
              <Text selectable style={{ color: "white", marginVertical: 10 }}>
                <Highlight text={item.name + " : "} filter={filter} />
                <Highlight
                  text={item.version}
                  filter={filter}
                  style={
                    showAlt
                      ? { textDecorationLine: "line-through", color: "red" }
                      : undefined
                  }
                />
                {showAlt && (
                  <Highlight
                    text={"  " + realDeps[item.name]}
                    filter={filter}
                  />
                )}
              </Text>
            </TouchableHighlight>
          );
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  textInput: {
    marginHorizontal: 5,
    padding: 5,
    color: "white",
    backgroundColor: "#333",
    borderRadius: 8,
  },
});
