import React, { useState } from "react";
import { FlatList, TextInput, TouchableHighlight } from "react-native";
import Text from "./Text";
import Highlight from "./Highlight";
import packageJson from '../../package.json';

const libs = Object.entries(packageJson.dependencies).reduce((arr,[name, version])=>[...arr,{name,version}],[]);

export default () => {
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
        data={libs.filter(
          (l) =>
            !filter ||
            l.name.toLowerCase().includes(filter) ||
            l.version.includes(filter)
        )}
        showsVerticalScrollIndicator
        keyExtractor={(i) => i.name}
        renderItem={({ item }) => (
          <TouchableHighlight underlayColor="#ffffff44" onPress={() => null}>
          <Text selectable style={{ color: "white", marginVertical: 10 }}>
            <Highlight text={item.name} filter={filter} />
            {" : "}
            <Highlight text={item.version} filter={filter} />
          </Text>
          </TouchableHighlight>
        )}
      />
    </>
  );
};