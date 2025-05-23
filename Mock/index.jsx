import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  View,
} from "react-native";
import Text from "../Text";
import Highlight from "../Highlight";
import MockGroup from "react-native-in-app-debugger/Mock/MockGroup";

const format = (m) => "(" + m.request.method + ") " + m.request.url;

export default (p) => {
  const [filter, setFilter] = useState("");

  const data = [];
  p.mocks.forEach((m) => {
    const tmp = format(m);
    if (!data.some((d) => d.title === tmp))
      data.push({ title: tmp, data: [m] });
    else data.forEach((d) => d.title === tmp && d.data.push(m));
  });

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
        data={data.filter(
          (l) => !filter || l.title.toLowerCase().includes(filter)
        )}
        showsVerticalScrollIndicator
        keyExtractor={(i) => i.title}
        renderItem={(pp) => <MockGroup {...pp} {...p} filter={filter} />}
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
