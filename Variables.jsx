import React, { useState } from "react";
import { FlatList, TextInput } from "react-native";
import Text from "./Text";
import Highlight from "./Highlight";

export default ({ variables }) => {
  const [filter, setFilter] = useState("");

  return (
    <>
      <TextInput
        value={filter}
        placeholder="Filter..."
        placeholderTextColor="grey"
        style={{ paddingHorizontal: 5, color: "white" }}
        onChangeText={(t) => setFilter(t.toLowerCase())}
        clearButtonMode="always"
      />
      <FlatList
        contentContainerStyle={{ padding: 5, paddingBottom: 20 }}
        data={Object.keys(variables).filter(
          (k) =>
            !filter ||
            variables[k].toLowerCase().includes(filter) ||
            k.toLowerCase().includes(filter)
        )}
        showsVerticalScrollIndicator
        keyExtractor={(i) => i}
        renderItem={({ item }) => (
          <Text selectable style={{ color: "white", marginVertical: 10 }}>
            <Highlight text={item} filter={filter} />
            {" : "}
            <Highlight text={variables[item]} filter={filter} />
          </Text>
        )}
      />
    </>
  );
};
