import React, { useState } from 'react';
import { Text, FlatList, TextInput } from 'react-native';

export default ({ variables }) => {
  const [filter, setFilter] = useState('');

  return (
    <>
      <TextInput
        value={filter}
        placeholder='Filter...'
        placeholderTextColor='grey'
        style={{ paddingHorizontal: 5, color: 'white' }}
        onChangeText={(t) => setFilter(t.toLowerCase())}
      />
      <FlatList
        contentContainerStyle={{ padding: 5, paddingBottom: 20 }}
        data={Object.keys(variables).filter(
          (k) => !filter || variables[k].toLowerCase().includes(filter) || k.toLowerCase().includes(filter),
        )}
        showsVerticalScrollIndicator
        keyExtractor={(i) => i}
        renderItem={({ item }) => (
          <Text selectable style={{ color: 'white', marginVertical: 10 }}>
            {item + ' : ' + variables[item]}
          </Text>
        )}
      />
    </>
  );
};
